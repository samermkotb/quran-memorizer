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
