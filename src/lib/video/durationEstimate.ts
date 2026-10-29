// Predicts the finished video's length before anything is rendered.
//
// For each audio file only the first 4 KB is fetched (an HTTP Range request;
// both audio hosts allow it cross-origin) and its MP3 header is parsed:
// - LAME Xing/"Info" header present (every everyayah.com file checked): the
//   exact frame count gives the exact duration → precision "exact".
// - No frame count: the length is derived from the file size (HEAD
//   Content-Length) and bitrate → precision "approx".
// - Nothing readable: a letter-count estimate, scaled from the ayahs that were
//   measured, or a nominal recitation pace → precision "estimate".
// The total then goes through buildTimeline(), the same function the renderer
// uses, so speed, repeats, pauses ("match" too), intro and outro all count.
//
// Results are cached per URL for the session, so stepping the range or
// changing speed/repeat/pause recalculates instantly.

import { PlayerState, Reciter } from "@/types";
import { buildPlaylist, getFullSurahAudioUrl, isSurahAvailableForReciter } from "@/lib/audioUtils";
import { arabicLetterCount } from "./passages";
import { parseMp3Head } from "./mp3Duration";
import { AudioClip, buildTimeline, MAX_VIDEO_SECONDS } from "./timeline";

export type DurationPrecision = "exact" | "approx" | "estimate";

export interface DurationEstimate {
  /** Predicted video length in seconds (including intro and outro). */
  total: number;
  precision: DurationPrecision;
  /** True when the video would exceed MAX_VIDEO_SECONDS. `total` may then be a lower bound. */
  overLimit: boolean;
}

interface Measured {
  seconds: number;
  precision: "exact" | "approx";
}

const HEAD_BYTES = 4096;
const CONCURRENCY = 6;
/** Nominal murattal pace for the last-resort estimate (seconds per Arabic letter). */
const SECONDS_PER_LETTER = 0.11;

const measured = new Map<string, Measured | null>();
const inflight = new Map<string, Promise<Measured | null>>();

async function readRange(url: string, start: number): Promise<Uint8Array> {
  const res = await fetch(url, { headers: { Range: `bytes=${start}-${start + HEAD_BYTES - 1}` } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  if (res.status === 206 || !res.body) return new Uint8Array(await res.arrayBuffer());
  // Server ignored the Range header: read just the first chunk, then stop.
  const reader = res.body.getReader();
  const parts: Uint8Array[] = [];
  let size = 0;
  while (size < HEAD_BYTES) {
    const { done, value } = await reader.read();
    if (done || !value) break;
    parts.push(value);
    size += value.length;
  }
  void reader.cancel().catch(() => {});
  const out = new Uint8Array(size);
  let at = 0;
  for (const p of parts) {
    out.set(p, at);
    at += p.length;
  }
  return out.slice(0, HEAD_BYTES);
}

/** Length from the file size at the reciter's nominal bitrate (simple HEAD, no preflight). */
async function measureBySize(url: string, kbps: number, audioStart = 0): Promise<Measured | null> {
  try {
    const res = await fetch(url, { method: "HEAD" });
    const bytes = Number(res.headers.get("content-length"));
    if (!res.ok || !(bytes > audioStart) || !(kbps > 0)) return null;
    return { seconds: ((bytes - audioStart) * 8) / (kbps * 1000), precision: "approx" };
  } catch {
    return null;
  }
}

async function measureUncached(url: string, kbpsHint: number): Promise<Measured | null> {
  let head: Uint8Array;
  try {
    head = await readRange(url, 0);
  } catch {
    // A Range request can need a CORS preflight, and preflights don't follow
    // redirects (mp3quran.net redirects to its CDN). Fall back to the size.
    return measureBySize(url, kbpsHint);
  }
  try {
    let result = parseMp3Head(head);
    if (result.kind === "need-more") {
      const offset = result.offset;
      head = await readRange(url, offset);
      result = parseMp3Head(head, offset);
    }
    if (result.kind === "exact") return { seconds: result.seconds, precision: "exact" };
    if (result.kind === "cbr") return measureBySize(url, result.kbps, result.audioStart);
    return measureBySize(url, kbpsHint);
  } catch {
    return measureBySize(url, kbpsHint);
  }
}

/** Duration of one MP3 file (cached for the session). null = couldn't be read. */
export function measureAudio(url: string, kbpsHint: number): Promise<Measured | null> {
  if (measured.has(url)) return Promise.resolve(measured.get(url) ?? null);
  const pending = inflight.get(url);
  if (pending) return pending;
  const promise = measureUncached(url, kbpsHint).then((m) => {
    inflight.delete(url);
    // Failures aren't cached, so a flaky connection can retry on the next change.
    if (m) measured.set(url, m);
    return m;
  });
  inflight.set(url, promise);
  return promise;
}

type Slot = Measured | null | undefined;

/**
 * Measures urls with limited concurrency, writing into `results` as they
 * arrive (undefined = not measured). Stops scheduling once `shouldStop` is true.
 */
async function measureAll(
  urls: string[],
  kbpsHint: number,
  shouldStop: (results: Slot[]) => boolean
): Promise<Slot[]> {
  const results: Slot[] = new Array(urls.length).fill(undefined);
  let next = 0;
  const worker = async () => {
    while (next < urls.length && !shouldStop(results)) {
      const i = next++;
      results[i] = await measureAudio(urls[i], kbpsHint);
    }
  };
  await Promise.all(Array.from({ length: Math.min(CONCURRENCY, urls.length) }, worker));
  return results;
}

function combine(levels: DurationPrecision[]): DurationPrecision {
  if (levels.includes("estimate")) return "estimate";
  if (levels.includes("approx")) return "approx";
  return "exact";
}

/** Fills unmeasured ayahs from their letter counts, scaled to the measured ones. */
function fillGaps(
  results: Slot[],
  ayahs: number[],
  ayahTexts: string[]
): { durations: number[]; precision: DurationPrecision } {
  if (results.some((r, i) => !r && !ayahTexts[ayahs[i] - 1])) {
    // Neither the audio header nor the ayah text is available: no honest estimate.
    throw new Error("duration unavailable");
  }
  const letters = ayahs.map((a) => Math.max(1, arabicLetterCount(ayahTexts[a - 1] ?? "")));
  let mSeconds = 0;
  let mLetters = 0;
  results.forEach((r, i) => {
    if (r) {
      mSeconds += r.seconds;
      mLetters += letters[i];
    }
  });
  const perLetter = mLetters > 0 ? mSeconds / mLetters : SECONDS_PER_LETTER;
  const levels: DurationPrecision[] = [];
  const durations = results.map((r, i) => {
    levels.push(r ? r.precision : "estimate");
    return r ? r.seconds : letters[i] * perLetter;
  });
  return { durations, precision: combine(levels) };
}

function totalFor(ps: PlayerState, reciter: Reciter, durations: number[], firstAyah: number | null): number {
  const clips: AudioClip[] = durations.map((duration, i) => ({
    ayah: firstAyah === null ? null : firstAyah + i,
    url: "",
    duration,
  }));
  return buildTimeline(ps, reciter, clips).total;
}

/**
 * Predicts the video length for the current selection. `isStale` lets a newer
 * request stop this one from scheduling more downloads (requests already in
 * flight finish and are cached).
 */
/** Nominal bitrate from the reciter catalogue ("128kbps"), used when the header can't be read. */
function nominalKbps(reciter: Reciter): number {
  const n = parseInt(reciter.bitrate, 10);
  return Number.isFinite(n) && n > 0 ? n : 128;
}

export async function estimateVideoDuration(
  ps: PlayerState,
  reciter: Reciter,
  ayahTexts: string[],
  isStale: () => boolean = () => false
): Promise<DurationEstimate> {
  if (reciter.source === "mp3quran") {
    const url = isSurahAvailableForReciter(reciter, ps.surahNumber)
      ? getFullSurahAudioUrl(reciter, ps.surahNumber)
      : null;
    const m = url ? await measureAudio(url, nominalKbps(reciter)) : null;
    if (!m && ayahTexts.length === 0) throw new Error("duration unavailable");
    const seconds = m?.seconds ?? ayahTexts.reduce((s, t) => s + arabicLetterCount(t), 0) * SECONDS_PER_LETTER;
    const total = totalFor(ps, reciter, [seconds], null);
    return { total, precision: m?.precision ?? "estimate", overLimit: total > MAX_VIDEO_SECONDS };
  }

  const ayahs: number[] = [];
  for (let a = ps.startAyah; a <= ps.endAyah; a++) ayahs.push(a);
  const urls = buildPlaylist(ps.reciterId, ps.surahNumber, ps.startAyah, ps.endAyah);

  // Stop downloading headers once the measured part alone is over the limit.
  const known = (slots: Slot[]) => slots.filter((r): r is Measured => Boolean(r)).map((r) => r.seconds);
  const overLimit = (slots: Slot[]) => {
    const seconds = known(slots);
    return seconds.length > 0 && totalFor(ps, reciter, seconds, ps.startAyah) > MAX_VIDEO_SECONDS;
  };
  const results = await measureAll(urls, nominalKbps(reciter), (slots) => isStale() || overLimit(slots));

  if (results.some((r) => r === undefined)) {
    // Stopped early: either over the limit (total is a lower bound) or superseded.
    return { total: totalFor(ps, reciter, known(results), ps.startAyah), precision: "approx", overLimit: !isStale() };
  }
  const { durations, precision } = fillGaps(results, ayahs, ayahTexts);
  const total = totalFor(ps, reciter, durations, ps.startAyah);
  return { total, precision, overLimit: total > MAX_VIDEO_SECONDS };
}

/**
 * Picks the end ayah (from the current start ayah) whose video length is
 * closest to `target` seconds, measuring ayahs only as far as needed.
 */
export async function endAyahForTarget(
  ps: PlayerState,
  reciter: Reciter,
  numberOfAyahs: number,
  ayahTexts: string[],
  target: number
): Promise<number> {
  const durations: number[] = [];
  let best = ps.startAyah;
  let bestDiff = Number.POSITIVE_INFINITY;
  for (let from = ps.startAyah; from <= numberOfAyahs; from += CONCURRENCY) {
    const to = Math.min(numberOfAyahs, from + CONCURRENCY - 1);
    const batch = await measureAll(buildPlaylist(ps.reciterId, ps.surahNumber, from, to), nominalKbps(reciter), () => false);
    const filled = fillGaps(
      batch,
      batch.map((_, i) => from + i),
      ayahTexts
    ).durations;
    for (let i = 0; i < filled.length; i++) {
      durations.push(filled[i]);
      const end = from + i;
      const total = totalFor({ ...ps, endAyah: end }, reciter, durations, ps.startAyah);
      const diff = Math.abs(total - target);
      if (diff < bestDiff && total <= MAX_VIDEO_SECONDS) {
        best = end;
        bestDiff = diff;
      }
      if (total >= target) return best;
    }
  }
  return best;
}
