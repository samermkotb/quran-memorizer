export interface Surah {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: "Meccan" | "Medinan";
}

export interface Reciter {
  id: string;
  name: string;
  arabicName: string;
  style: "Murattal" | "Mujawwad" | "Muallim";
  everyayahFolder: string;
  bitrate: string;
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
