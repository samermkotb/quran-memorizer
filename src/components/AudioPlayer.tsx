"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { PlayerState, PlaybackStatus } from "@/types";
import { buildPlaylist, formatTime } from "@/lib/audioUtils";
import { getSurah } from "@/lib/surahData";
import { getReciter } from "@/lib/reciters";

interface Props {
  playerState: PlayerState;
}

export default function AudioPlayer({ playerState }: Props) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [status, setStatus] = useState<PlaybackStatus>({
    isPlaying: false,
    isLoading: false,
    isPausing: false,
    pauseRemaining: 0,
    currentAyah: playerState.startAyah,
    currentRepeat: 1,
    totalRepeats: playerState.infiniteRepeat ? Infinity : playerState.repeatCount,
    duration: 0,
    currentTime: 0,
    error: null,
  });

  const playlist = buildPlaylist(
    playerState.reciterId,
    playerState.surahNumber,
    playerState.startAyah,
    playerState.endAyah
  );

  const playlistRef = useRef(playlist);
  const statusRef = useRef(status);
  const playerStateRef = useRef(playerState);
  const isStoppedRef = useRef(false);
  const pauseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pauseIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const doNextRef = useRef<(() => void) | null>(null);

  useEffect(() => { playlistRef.current = playlist; }, [playlist]);
  useEffect(() => { statusRef.current = status; }, [status]);
  useEffect(() => { playerStateRef.current = playerState; }, [playerState]);

  const surah = getSurah(playerState.surahNumber);
  const reciter = getReciter(playerState.reciterId);
  const ayahCount = playerState.endAyah - playerState.startAyah + 1;

  const getAyahIndex = useCallback((ayah: number) => {
    return ayah - playerState.startAyah;
  }, [playerState.startAyah]);

  const clearPauseTimers = useCallback(() => {
    if (pauseTimerRef.current) { clearTimeout(pauseTimerRef.current); pauseTimerRef.current = null; }
    if (pauseIntervalRef.current) { clearInterval(pauseIntervalRef.current); pauseIntervalRef.current = null; }
    doNextRef.current = null;
  }, []);

  const loadAndPlay = useCallback((ayahNumber: number, repeatNum: number) => {
    clearPauseTimers();
    const ps = playerStateRef.current;
    const pl = playlistRef.current;
    const idx = ayahNumber - ps.startAyah;
    if (idx < 0 || idx >= pl.length) return;

    setStatus((prev) => ({
      ...prev,
      isLoading: true,
      isPlaying: false,
      isPausing: false,
      pauseRemaining: 0,
      currentAyah: ayahNumber,
      currentRepeat: repeatNum,
      error: null,
      currentTime: 0,
      duration: 0,
    }));

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = pl[idx];
      audioRef.current.load();
      // playbackRate is (re-)applied in onCanPlay to survive audio.load() resets
    }
  }, [clearPauseTimers]);

  const stop = useCallback(() => {
    isStoppedRef.current = true;
    clearPauseTimers();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
    }
    setStatus((prev) => ({
      ...prev,
      isPlaying: false,
      isLoading: false,
      isPausing: false,
      pauseRemaining: 0,
      currentTime: 0,
      duration: 0,
    }));
  }, [clearPauseTimers]);

  const play = useCallback(() => {
    isStoppedRef.current = false;
    loadAndPlay(playerState.startAyah, 1);
  }, [playerState.startAyah, loadAndPlay]);

  const pause = useCallback(() => {
    if (audioRef.current && !audioRef.current.paused) {
      audioRef.current.pause();
      setStatus((prev) => ({ ...prev, isPlaying: false }));
    }
  }, []);

  const resume = useCallback(() => {
    if (audioRef.current && audioRef.current.paused && audioRef.current.src) {
      audioRef.current.play().catch(() => {});
      setStatus((prev) => ({ ...prev, isPlaying: true }));
    }
  }, []);

  const skipPause = useCallback(() => {
    clearPauseTimers();
    setStatus((prev) => ({ ...prev, isPausing: false, pauseRemaining: 0 }));
    if (doNextRef.current) {
      const fn = doNextRef.current;
      doNextRef.current = null;
      fn();
    }
  }, [clearPauseTimers]);

  const skipNext = useCallback(() => {
    const s = statusRef.current;
    const ps = playerStateRef.current;
    if (s.currentAyah < ps.endAyah) {
      loadAndPlay(s.currentAyah + 1, s.currentRepeat);
    }
  }, [loadAndPlay]);

  const skipPrev = useCallback(() => {
    const s = statusRef.current;
    const ps = playerStateRef.current;
    if (s.currentAyah > ps.startAyah) {
      loadAndPlay(s.currentAyah - 1, s.currentRepeat);
    }
  }, [loadAndPlay]);

  // Wire up audio element events
  useEffect(() => {
    const audio = new Audio();
    audio.preload = "auto";
    audioRef.current = audio;

    const onCanPlay = () => {
      if (isStoppedRef.current) return;
      // Re-apply speed here — audio.load() resets playbackRate to 1.0 in some browsers
      audio.playbackRate = playerStateRef.current.speed;
      setStatus((prev) => ({ ...prev, isLoading: false }));
      audio.play().catch(() => {
        setStatus((prev) => ({ ...prev, isLoading: false, error: "Playback blocked. Tap Play to start." }));
      });
    };

    const onPlay = () => setStatus((prev) => ({ ...prev, isPlaying: true, error: null }));
    const onPause = () => setStatus((prev) => ({ ...prev, isPlaying: false }));

    const onTimeUpdate = () => {
      setStatus((prev) => ({
        ...prev,
        currentTime: audio.currentTime,
        duration: isNaN(audio.duration) ? 0 : audio.duration,
      }));
    };

    const onEnded = () => {
      if (isStoppedRef.current) return;
      const s = statusRef.current;
      const ayahDuration = isNaN(audio.duration) ? 0 : audio.duration;

      const doNext = () => {
        if (isStoppedRef.current) return;
        // Re-read playerStateRef for live repeat/infinite values
        const ps = playerStateRef.current;
        const nextAyah = s.currentAyah + 1;

        if (nextAyah <= ps.endAyah) {
          loadAndPlay(nextAyah, s.currentRepeat);
        } else {
          const maxRepeats = ps.infiniteRepeat ? Infinity : ps.repeatCount;
          const nextRepeat = s.currentRepeat + 1;
          if (nextRepeat <= maxRepeats) {
            loadAndPlay(ps.startAyah, nextRepeat);
          } else {
            setStatus((prev) => ({
              ...prev,
              isPlaying: false,
              isPausing: false,
              pauseRemaining: 0,
              currentAyah: ps.startAyah,
              currentRepeat: 1,
              currentTime: 0,
            }));
          }
        }
      };

      const ps = playerStateRef.current;
      const pauseSecs = ps.pauseAfterAyah === -1 ? ayahDuration : ps.pauseAfterAyah;

      if (pauseSecs > 0) {
        doNextRef.current = doNext;
        let remaining = Math.ceil(pauseSecs);
        setStatus((prev) => ({ ...prev, isPlaying: false, isPausing: true, pauseRemaining: remaining }));

        pauseIntervalRef.current = setInterval(() => {
          if (isStoppedRef.current) {
            if (pauseIntervalRef.current) { clearInterval(pauseIntervalRef.current); pauseIntervalRef.current = null; }
            return;
          }
          remaining -= 1;
          setStatus((prev) => ({ ...prev, pauseRemaining: Math.max(0, remaining) }));
          if (remaining <= 0 && pauseIntervalRef.current) {
            clearInterval(pauseIntervalRef.current);
            pauseIntervalRef.current = null;
          }
        }, 1000);

        pauseTimerRef.current = setTimeout(() => {
          if (pauseIntervalRef.current) { clearInterval(pauseIntervalRef.current); pauseIntervalRef.current = null; }
          if (!isStoppedRef.current) {
            setStatus((prev) => ({ ...prev, isPausing: false, pauseRemaining: 0 }));
          }
          doNextRef.current = null;
          doNext();
        }, pauseSecs * 1000);
      } else {
        doNext();
      }
    };

    const onError = () => {
      if (isStoppedRef.current) return;
      setStatus((prev) => ({
        ...prev,
        isLoading: false,
        isPlaying: false,
        error: "Failed to load audio. Check your connection and try again.",
      }));
    };

    audio.addEventListener("canplay", onCanPlay);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("error", onError);

    return () => {
      audio.pause();
      audio.src = "";
      audio.removeEventListener("canplay", onCanPlay);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("error", onError);
    };
  }, [loadAndPlay]);

  // Update playback rate when speed changes (while audio is playing)
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playerState.speed;
    }
  }, [playerState.speed]);

  // Reset when core selection changes
  useEffect(() => {
    isStoppedRef.current = true;
    clearPauseTimers();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
    }
    setStatus({
      isPlaying: false,
      isLoading: false,
      isPausing: false,
      pauseRemaining: 0,
      currentAyah: playerState.startAyah,
      currentRepeat: 1,
      totalRepeats: playerState.infiniteRepeat ? Infinity : playerState.repeatCount,
      duration: 0,
      currentTime: 0,
      error: null,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    playerState.surahNumber,
    playerState.startAyah,
    playerState.endAyah,
    playerState.reciterId,
  ]);

  const progressPercent =
    status.duration > 0 ? (status.currentTime / status.duration) * 100 : 0;

  const totalRepeatsDisplay = playerState.infiniteRepeat ? "∞" : playerState.repeatCount;
  const ayahProgress = getAyahIndex(status.currentAyah) + 1;

  return (
    <div className="bg-white rounded-2xl border-2 border-emerald-100 shadow-lg overflow-hidden">
      {/* Header info */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-5 text-white">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-emerald-100 text-xs font-medium uppercase tracking-wider mb-1">Now Playing</div>
            <div className="font-bold text-xl leading-tight">
              {surah ? surah.englishName : "—"}
            </div>
            {surah && (
              <div className="text-emerald-200 text-sm mt-0.5" dir="rtl">
                {surah.name}
              </div>
            )}
          </div>
          <div className="text-right">
            <div className="text-emerald-100 text-xs">Ayahs</div>
            <div className="font-bold text-lg">
              {playerState.startAyah === playerState.endAyah
                ? playerState.startAyah
                : `${playerState.startAyah}–${playerState.endAyah}`}
            </div>
            <div className="text-emerald-200 text-xs">{ayahCount} ayah{ayahCount !== 1 ? "s" : ""}</div>
          </div>
        </div>

        {reciter && (
          <div className="mt-3 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-300" />
            <span className="text-emerald-100 text-sm">{reciter.name}</span>
          </div>
        )}
      </div>

      {/* Current ayah indicator */}
      <div className="px-6 pt-4 pb-2">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <span className="text-gray-500">Ayah</span>
            <span className="font-bold text-emerald-700 text-base">
              {status.currentAyah}
            </span>
            <span className="text-gray-400">of {playerState.endAyah}</span>
            <span className="text-gray-300 mx-1">·</span>
            <span className="text-gray-400">{ayahProgress}/{ayahCount}</span>
          </div>
          <div className="flex items-center gap-1 text-gray-400">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span className="font-medium">
              {status.currentRepeat}/{totalRepeatsDisplay}
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-2 mb-1">
          <div className="relative h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 bg-emerald-500 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>{formatTime(status.currentTime)}</span>
            <span>{formatTime(status.duration)}</span>
          </div>
        </div>

        {/* Ayah progress dots */}
        {ayahCount <= 20 && (
          <div className="flex gap-1.5 justify-center mt-3 flex-wrap">
            {Array.from({ length: ayahCount }, (_, i) => {
              const ayah = playerState.startAyah + i;
              const isDone = ayah < status.currentAyah;
              const isCurrent = ayah === status.currentAyah;
              return (
                <div
                  key={ayah}
                  title={`Ayah ${ayah}`}
                  className={`rounded-full transition-all duration-300 ${
                    isCurrent
                      ? "w-3 h-3 bg-emerald-500 ring-2 ring-emerald-200"
                      : isDone
                      ? "w-2 h-2 bg-emerald-300 mt-0.5"
                      : "w-2 h-2 bg-gray-200 mt-0.5"
                  }`}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Pause / repeat countdown banner */}
      {status.isPausing && (
        <div className="mx-6 mb-2 px-4 py-3 bg-teal-50 border-2 border-teal-200 rounded-xl flex items-center gap-3">
          <div className="w-9 h-9 flex items-center justify-center bg-teal-100 rounded-full flex-shrink-0">
            <svg className="w-5 h-5 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          </div>
          <div className="flex-1">
            <div className="text-sm font-semibold text-teal-700">Your turn to repeat</div>
            <div className="text-xs text-teal-500">
              Next ayah in {status.pauseRemaining}s
            </div>
          </div>
          <button
            onClick={skipPause}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-teal-600 bg-teal-100 hover:bg-teal-200 transition-colors touch-manipulation"
          >
            Skip
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
            </svg>
          </button>
        </div>
      )}

      {/* Error message */}
      {status.error && (
        <div className="mx-6 mb-3 px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
          {status.error}
        </div>
      )}

      {/* Controls */}
      <div className="px-6 pb-6">
        <div className="flex items-center justify-center gap-6">
          {/* Prev ayah */}
          <button
            onClick={skipPrev}
            disabled={status.currentAyah <= playerState.startAyah}
            className="p-3 rounded-full text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 active:bg-emerald-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all touch-manipulation"
            title="Previous ayah"
          >
            <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
            </svg>
          </button>

          {/* Main play/pause/loading/skip-pause button */}
          {status.isPausing ? (
            <button
              onClick={skipPause}
              className="w-20 h-20 flex items-center justify-center bg-teal-500 hover:bg-teal-600 active:bg-teal-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all active:scale-95 touch-manipulation"
              title="Skip pause"
            >
              <svg className="w-9 h-9" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
              </svg>
            </button>
          ) : !status.isPlaying && !status.isLoading ? (
            <button
              onClick={play}
              className="w-20 h-20 flex items-center justify-center bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all active:scale-95 touch-manipulation"
              title="Play"
            >
              <svg className="w-9 h-9 ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </button>
          ) : status.isLoading ? (
            <div className="w-20 h-20 flex items-center justify-center bg-emerald-500 rounded-full shadow-lg">
              <svg className="w-9 h-9 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
            </div>
          ) : (
            <button
              onClick={pause}
              className="w-20 h-20 flex items-center justify-center bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all active:scale-95 touch-manipulation"
              title="Pause"
            >
              <svg className="w-9 h-9" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
              </svg>
            </button>
          )}

          {/* Next ayah */}
          <button
            onClick={skipNext}
            disabled={status.currentAyah >= playerState.endAyah}
            className="p-3 rounded-full text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 active:bg-emerald-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all touch-manipulation"
            title="Next ayah"
          >
            <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
            </svg>
          </button>
        </div>

        {/* Stop button */}
        {(status.isPlaying || status.isLoading || status.isPausing) && (
          <div className="flex justify-center mt-3">
            <button
              onClick={stop}
              className="flex items-center gap-1.5 px-5 py-2 rounded-full text-sm text-gray-500 hover:text-red-500 hover:bg-red-50 active:bg-red-100 transition-colors touch-manipulation"
              title="Stop"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 6h12v12H6z" />
              </svg>
              Stop
            </button>
          </div>
        )}

        {/* Speed indicator */}
        <div className="mt-4 flex items-center gap-3">
          <span className="text-xs text-gray-400 w-10">Speed</span>
          <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-400 rounded-full transition-all"
              style={{ width: `${((playerState.speed - 0.5) / 1.5) * 100}%` }}
            />
          </div>
          <span className="text-xs font-medium text-gray-600 w-10 text-right">{playerState.speed}×</span>
        </div>

        {/* Pause indicator */}
        {playerState.pauseAfterAyah !== 0 && (
          <div className="mt-2 flex items-center gap-3">
            <span className="text-xs text-gray-400 w-10">Pause</span>
            <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-teal-400 rounded-full transition-all"
                style={{
                  width: playerState.pauseAfterAyah === -1
                    ? "100%"
                    : `${(playerState.pauseAfterAyah / 30) * 100}%`
                }}
              />
            </div>
            <span className="text-xs font-medium text-gray-600 w-10 text-right">
              {playerState.pauseAfterAyah === -1 ? "Match" : `${playerState.pauseAfterAyah}s`}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
