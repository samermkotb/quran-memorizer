export interface Surah {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: "Meccan" | "Medinan";
}

export type AudioSourceType = "everyayah" | "mp3quran";

export interface Reciter {
  id: string;
  name: string;
  arabicName: string;
  style: "Murattal" | "Mujawwad" | "Muallim";
  bitrate: string;
  /** Where audio for this reciter is fetched from. */
  source: AudioSourceType;
  /** everyayah.com CDN folder — required when source is "everyayah". Enables ayah-by-ayah playback. */
  everyayahFolder?: string;
  /** mp3quran.net server base URL (trailing slash) — required when source is "mp3quran". Full-surah files only. */
  mp3quranServer?: string;
  /** Surah numbers this reciter's mp3quran mushaf does not include, if any. */
  mp3quranMissingSurahs?: number[];
}

export interface PlayerState {
  surahNumber: number;
  startAyah: number;
  endAyah: number;
  reciterId: string;
  repeatCount: number;
  infiniteRepeat: boolean;
  speed: number;
  pauseAfterAyah: number; // seconds; 0 = off, -1 = match recitation duration
}

export interface PlaybackStatus {
  isPlaying: boolean;
  isLoading: boolean;
  isPausing: boolean;
  pauseRemaining: number;
  currentAyah: number;
  currentRepeat: number;
  totalRepeats: number;
  duration: number;
  currentTime: number;
  error: string | null;
}
