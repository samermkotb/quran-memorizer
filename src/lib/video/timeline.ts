// Audio preparation + timeline for the video creator.
//
// Audio is fetched as Blobs (both CDNs send `access-control-allow-origin: *`,
// verified for everyayah.com and every mp3quran.net server + redirect target)
// and played from same-origin blob: URLs. That keeps the Web Audio graph
// untainted, so the recording isn't silenced by CORS.
//
// The timeline mirrors the app's player: the selected range plays in order,
// then repeats `repeatCount` times, with the chosen pause after every ayah
// except the very last one.

import { PlayerState, Reciter } from "@/types";
import { buildPlaylist, getFullSurahAudioUrl, isSurahAvailableForReciter } from "@/lib/audioUtils";

/** Hard cap: real-time rendering takes as long as the video itself. */
export const MAX_VIDEO_SECONDS = 10 * 60;
/** Above this we warn that rendering will take a while. */
export const LONG_VIDEO_SECONDS = 3 * 60;
/** Silent lead-in before the first ayah and hold after the last one. */
export const INTRO_SECONDS = 1;
export const OUTRO_SECONDS = 1.5;

export type VideoErrorCode =
  | "unsupported"
  | "too-long"
  | "audio-fetch"
  | "surah-unavailable"
  | "background-load"
  | "playback-blocked"
  | "recorder"
  | "cancelled";

export class VideoError extends Error {
  constructor(public code: VideoErrorCode, message?: string) {
    super(message ?? code);
    this.name = "VideoError";
  }
}

export interface AudioClip {
  /** Ayah number, or null for a full-surah file. */
  ayah: number | null;
  url: string;
  /** Natural duration in seconds (before speed is applied). */
  duration: number;
}

export type Segment =
  | { kind: "intro"; start: number; end: number }
  | { kind: "recitation"; clip: number; ayah: number | null; repeat: number; start: number; end: number }
  | { kind: "pause"; afterAyah: number | null; start: number; end: number }
  | { kind: "outro"; start: number; end: number };

export interface VideoTimeline {
  clips: AudioClip[];
  segments: Segment[];
  total: number;
  repeats: number;
  fullSurah: boolean;
}

export function effectiveRepeats(ps: PlayerState, reciter: Reciter): number {
  if (reciter.source !== "everyayah") return 1;
  // Infinite looping makes no sense for a finite file. Render a single pass.
  return ps.infiniteRepeat ? 1 : Math.max(1, ps.repeatCount);
}

function pauseFor(ps: PlayerState, clipDuration: number): number {
  if (ps.pauseAfterAyah === -1) return clipDuration / ps.speed;
  return Math.max(0, ps.pauseAfterAyah);
}

/** Build the ordered segment list from the clip durations. */
export function buildTimeline(ps: PlayerState, reciter: Reciter, clips: AudioClip[]): VideoTimeline {
  const segments: Segment[] = [];
  let t = 0;
  segments.push({ kind: "intro", start: 0, end: INTRO_SECONDS });
  t = INTRO_SECONDS;

  const fullSurah = reciter.source !== "everyayah";
  const repeats = effectiveRepeats(ps, reciter);

  for (let rep = 1; rep <= repeats; rep++) {
    for (let i = 0; i < clips.length; i++) {
      const clip = clips[i];
      const d = clip.duration / ps.speed;
      segments.push({ kind: "recitation", clip: i, ayah: clip.ayah, repeat: rep, start: t, end: t + d });
      t += d;
      const isLast = rep === repeats && i === clips.length - 1;
      if (!isLast && !fullSurah) {
        const p = pauseFor(ps, clip.duration);
        if (p > 0) {
          segments.push({ kind: "pause", afterAyah: clip.ayah, start: t, end: t + p });
          t += p;
        }
      }
    }
  }

  segments.push({ kind: "outro", start: t, end: t + OUTRO_SECONDS });
  t += OUTRO_SECONDS;
  return { clips, segments, total: t, repeats, fullSurah };
}

/** Upper-bound estimate of the final length, used to stop early while fetching. */
function projectedTotal(ps: PlayerState, reciter: Reciter, durations: number[]): number {
  const repeats = effectiveRepeats(ps, reciter);
  const recite = durations.reduce((s, d) => s + d / ps.speed, 0);
  const pauses = durations.reduce((s, d) => s + pauseFor(ps, d), 0);
  return INTRO_SECONDS + OUTRO_SECONDS + (recite + pauses) * repeats;
}

function readDuration(url: string, fallbackBytes: number, kbps: number): Promise<number> {
  return new Promise((resolve) => {
    const probe = new Audio();
    probe.preload = "metadata";
    const fallback = () => fallbackBytes / (kbps * 125);
    const done = (value: number) => {
      clearTimeout(timer);
      probe.removeAttribute("src");
      probe.load();
      resolve(value);
    };
    const timer = setTimeout(() => done(fallback()), 15_000);
    probe.onloadedmetadata = () => {
      const d = probe.duration;
      done(Number.isFinite(d) && d > 0 ? d : fallback());
    };
    probe.onerror = () => done(fallback());
    probe.src = url;
  });
}

function bitrateKbps(reciter: Reciter): number {
  const n = parseInt(reciter.bitrate, 10);
  return Number.isFinite(n) && n > 0 ? n : 128;
}

async function fetchBlob(url: string, signal: AbortSignal): Promise<Blob> {
  let res: Response;
  try {
    res = await fetch(url, { signal });
  } catch (err) {
    if (signal.aborted) throw new VideoError("cancelled");
    throw new VideoError("audio-fetch", String(err));
  }
  if (!res.ok) throw new VideoError("audio-fetch", `HTTP ${res.status}`);
  return res.blob();
}

/**
 * Fetches the selection's audio and measures each file. Throws VideoError
 * ("too-long") as soon as the projected video exceeds MAX_VIDEO_SECONDS, so a
 * long surah is refused before it's fully downloaded.
 */
export async function prepareAudio(
  ps: PlayerState,
  reciter: Reciter,
  signal: AbortSignal,
  onProgress: (done: number, total: number) => void
): Promise<AudioClip[]> {
  const kbps = bitrateKbps(reciter);
  const clips: AudioClip[] = [];
  const revokeAll = () => clips.forEach((c) => URL.revokeObjectURL(c.url));

  try {
    if (reciter.source === "mp3quran") {
      if (!isSurahAvailableForReciter(reciter, ps.surahNumber)) throw new VideoError("surah-unavailable");
      const url = getFullSurahAudioUrl(reciter, ps.surahNumber);
      if (!url) throw new VideoError("surah-unavailable");

      // Size check first: content-length is CORS-safelisted, so a HEAD tells us
      // roughly how long the surah is without downloading it.
      try {
        const head = await fetch(url, { method: "HEAD", signal });
        const bytes = Number(head.headers.get("content-length"));
        if (bytes > 0) {
          const estimate = bytes / (kbps * 125) / ps.speed;
          if (estimate + INTRO_SECONDS + OUTRO_SECONDS > MAX_VIDEO_SECONDS * 1.05) {
            throw new VideoError("too-long", String(Math.round(estimate)));
          }
        }
      } catch (err) {
        if (err instanceof VideoError) throw err;
        if (signal.aborted) throw new VideoError("cancelled");
        // HEAD failures are non-fatal; the duration check after download still applies.
      }

      onProgress(0, 1);
      const blob = await fetchBlob(url, signal);
      const objectUrl = URL.createObjectURL(blob);
      const duration = await readDuration(objectUrl, blob.size, kbps);
      clips.push({ ayah: null, url: objectUrl, duration });
      onProgress(1, 1);
      if (projectedTotal(ps, reciter, [duration]) > MAX_VIDEO_SECONDS) {
        throw new VideoError("too-long", String(Math.round(duration / ps.speed)));
      }
      return clips;
    }

    const urls = buildPlaylist(ps.reciterId, ps.surahNumber, ps.startAyah, ps.endAyah);
    onProgress(0, urls.length);
    for (let i = 0; i < urls.length; i++) {
      if (signal.aborted) throw new VideoError("cancelled");
      const blob = await fetchBlob(urls[i], signal);
      const objectUrl = URL.createObjectURL(blob);
      const duration = await readDuration(objectUrl, blob.size, kbps);
      clips.push({ ayah: ps.startAyah + i, url: objectUrl, duration });
      onProgress(i + 1, urls.length);
      const projected = projectedTotal(ps, reciter, clips.map((c) => c.duration));
      if (projected > MAX_VIDEO_SECONDS) {
        throw new VideoError("too-long", String(Math.round(projected)));
      }
    }
    return clips;
  } catch (err) {
    revokeAll();
    throw err;
  }
}
