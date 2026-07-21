import { getReciter } from "./reciters";
import { buildZip } from "./zip";
import { Reciter } from "@/types";

// everyayah.com URL pattern:
// https://everyayah.com/data/{folder}/{surah_3digits}{ayah_3digits}.mp3
const EVERYAYAH_BASE = "https://everyayah.com/data";

export function getAyahAudioUrl(
  reciterId: string,
  surahNumber: number,
  ayahNumber: number
): string {
  const reciter = getReciter(reciterId);
  if (!reciter) throw new Error(`Unknown reciter: ${reciterId}`);
  if (reciter.source !== "everyayah" || !reciter.everyayahFolder) {
    throw new Error(`Reciter ${reciterId} has no ayah-by-ayah audio source`);
  }

  const surah = String(surahNumber).padStart(3, "0");
  const ayah = String(ayahNumber).padStart(3, "0");

  return `${EVERYAYAH_BASE}/${reciter.everyayahFolder}/${surah}${ayah}.mp3`;
}

export function buildPlaylist(
  reciterId: string,
  surahNumber: number,
  startAyah: number,
  endAyah: number
): string[] {
  const urls: string[] = [];
  for (let ayah = startAyah; ayah <= endAyah; ayah++) {
    urls.push(getAyahAudioUrl(reciterId, surahNumber, ayah));
  }
  return urls;
}

// mp3quran.net URL pattern (full surah, no ayah-by-ayah files):
// https://{mp3quranServer}/{surah_3digits}.mp3
export function getFullSurahAudioUrl(reciter: Reciter, surahNumber: number): string | null {
  if (reciter.source !== "mp3quran" || !reciter.mp3quranServer) return null;
  if (reciter.mp3quranMissingSurahs?.includes(surahNumber)) return null;
  const surah = String(surahNumber).padStart(3, "0");
  return `${reciter.mp3quranServer}${surah}.mp3`;
}

export function supportsAyahRange(reciter: Reciter): boolean {
  return reciter.source === "everyayah";
}

export function isSurahAvailableForReciter(reciter: Reciter, surahNumber: number): boolean {
  if (reciter.source === "mp3quran") {
    return !reciter.mp3quranMissingSurahs?.includes(surahNumber);
  }
  return true;
}

// ── Download support ──────────────────────────────────────────────────────

export type DownloadPlan =
  | { kind: "unavailable"; reason: "surah-missing" | "no-source" }
  | { kind: "single-file"; url: string; filename: string }
  | { kind: "zip"; urls: string[]; filenames: string[]; zipFilename: string };

/**
 * Decides what a "Download Audio" action should do for the current selection.
 * everyayah reciters have no single full-surah file, so a range (including
 * the whole surah) is bundled as a ZIP of individual ayah files. mp3quran
 * reciters only expose one full-surah file, so only a whole-surah download
 * is offered — a partial ayah range cannot be extracted from it.
 */
export function getDownloadPlan(
  reciter: Reciter,
  surahNumber: number,
  surahEnglishName: string,
  startAyah: number,
  endAyah: number,
  numberOfAyahs: number
): DownloadPlan {
  const isWholeSurah = startAyah === 1 && endAyah === numberOfAyahs;
  const safeName = surahEnglishName.replace(/[^a-zA-Z0-9-]+/g, "_");

  if (reciter.source === "mp3quran") {
    if (!isSurahAvailableForReciter(reciter, surahNumber)) {
      return { kind: "unavailable", reason: "surah-missing" };
    }
    if (!isWholeSurah) {
      // Only the whole surah exists as a single file — offer that instead of the partial range.
      const url = getFullSurahAudioUrl(reciter, surahNumber);
      if (!url) return { kind: "unavailable", reason: "no-source" };
      return { kind: "single-file", url, filename: `${safeName}_${reciter.id}.mp3` };
    }
    const url = getFullSurahAudioUrl(reciter, surahNumber);
    if (!url) return { kind: "unavailable", reason: "no-source" };
    return { kind: "single-file", url, filename: `${safeName}_${reciter.id}.mp3` };
  }

  if (reciter.source === "everyayah") {
    if (startAyah === endAyah) {
      const url = getAyahAudioUrl(reciter.id, surahNumber, startAyah);
      return { kind: "single-file", url, filename: `${safeName}_ayah${startAyah}_${reciter.id}.mp3` };
    }
    const urls = buildPlaylist(reciter.id, surahNumber, startAyah, endAyah);
    const filenames = urls.map((_, i) => `${String(startAyah + i).padStart(3, "0")}.mp3`);
    const rangeLabel = isWholeSurah ? "full" : `${startAyah}-${endAyah}`;
    return {
      kind: "zip",
      urls,
      filenames,
      zipFilename: `${safeName}_${rangeLabel}_${reciter.id}.zip`,
    };
  }

  return { kind: "unavailable", reason: "no-source" };
}

function triggerBlobDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

/**
 * Executes a download plan. Fetches audio as blobs (both sources send
 * `access-control-allow-origin: *`, verified) so the browser can save a
 * correctly named file regardless of origin, then either saves the single
 * file or bundles multiple ayah files into a ZIP built client-side.
 */
export async function executeDownloadPlan(
  plan: DownloadPlan,
  onProgress?: (done: number, total: number) => void
): Promise<void> {
  if (plan.kind === "unavailable") throw new Error("Download unavailable for this selection");

  if (plan.kind === "single-file") {
    const res = await fetch(plan.url);
    if (!res.ok) throw new Error(`Failed to fetch audio (HTTP ${res.status})`);
    const blob = await res.blob();
    triggerBlobDownload(blob, plan.filename);
    return;
  }

  const total = plan.urls.length;
  const entries = [];
  for (let i = 0; i < plan.urls.length; i++) {
    const res = await fetch(plan.urls[i]);
    if (!res.ok) throw new Error(`Failed to fetch ${plan.filenames[i]} (HTTP ${res.status})`);
    const data = new Uint8Array(await res.arrayBuffer());
    entries.push({ name: plan.filenames[i], data });
    onProgress?.(i + 1, total);
  }
  const blob = buildZip(entries);
  triggerBlobDownload(blob, plan.zipFilename);
}

export function formatTime(seconds: number): string {
  if (isNaN(seconds) || !isFinite(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

/**
 * Builds a real silent media item for the repetition gap. Keeping the same
 * HTMLAudioElement playing is materially more reliable in a locked/background
 * mobile browser than waiting on setTimeout(), which mobile OSes may suspend.
 */
export function createSilentAudioUrl(durationSeconds: number): string {
  const sampleRate = 8000;
  const seconds = Math.max(0.05, Math.min(durationSeconds, 30 * 60));
  const sampleCount = Math.ceil(sampleRate * seconds);
  const bytes = new Uint8Array(44 + sampleCount);
  const view = new DataView(bytes.buffer);

  const writeAscii = (offset: number, value: string) => {
    for (let index = 0; index < value.length; index += 1) {
      bytes[offset + index] = value.charCodeAt(index);
    }
  };

  writeAscii(0, "RIFF");
  view.setUint32(4, 36 + sampleCount, true);
  writeAscii(8, "WAVE");
  writeAscii(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, 1, true); // mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate, true); // 8-bit mono byte rate
  view.setUint16(32, 1, true);
  view.setUint16(34, 8, true);
  writeAscii(36, "data");
  view.setUint32(40, sampleCount, true);
  bytes.fill(128, 44); // unsigned 8-bit PCM silence

  return URL.createObjectURL(new Blob([bytes], { type: "audio/wav" }));
}
