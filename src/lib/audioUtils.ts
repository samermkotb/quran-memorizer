import { getReciter } from "./reciters";

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
