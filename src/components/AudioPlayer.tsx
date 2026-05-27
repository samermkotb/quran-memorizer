"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { PlayerState, PlaybackStatus } from "@/types";
import { buildPlaylist, formatTime } from "@/lib/audioUtils";
import { getSurah } from "@/lib/surahData";
import { getReciter } from "@/lib/reciters";
import { useApp } from "@/contexts/AppContext";

interface Props {
  playerState: PlayerState;
}

export default function AudioPlayer({ playerState }: Props) {
  const { theme, tr } = useApp();

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

  const getAyahIndex = useCallback(
    (ayah: number) => ayah - playerState.startAyah,
    [playerState.startAyah]
  );

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
      // playbackRate applied in onCanPlay — audio.load() resets it to 1.0 in some browsers
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
    if (s.currentAyah < ps.endAyah) loadAndPlay(s.currentAyah + 1, s.currentRepeat);
  }, [loadAndPlay]);

  const skipPrev = useCallback(() => {
    const s = statusRef.current;
    const ps = playerStateRef.current;
    if (s.currentAyah > ps.startAyah) loadAndPlay(s.currentAyah - 1, s.currentRepeat);
  }, [loadAndPlay]);

  // Wire up audio element events
  useEffect(() => {
    const audio = new Audio();
    audio.preload = "auto";
    audioRef.current = audio;

    const onCanPlay = () => {
      if (isStoppedRef.current) return;
      audio.playbackRate = playerStateRef.current.speed;
      setStatus((prev) => ({ ...prev, isLoading: false }));
      audio.play().catch(() => {
        setStatus((prev) => ({
          ...prev,
          isLoading: false,
          error: tr("playBlocked"),
        }));
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
        error: tr("audioError"),
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
  }, [loadAndPlay, tr]);

  // Re-apply speed when user changes it (while audio is playing)
  useEffect(() => {
    if (audioRef.current) audioRef.current.playbackRate = playerState.speed;
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
  }, [playerState.surahNumber, playerState.startAyah, playerState.endAyah, playerState.reciterId]);

  const progressPercent = status.duration > 0 ? (status.currentTime / status.duration) * 100 : 0;
  const totalRepeatsDisplay = playerState.infiniteRepeat ? "∞" : playerState.repeatCount;
  const ayahProgress = getAyahIndex(status.currentAyah) + 1;

  return (
    <div className={theme.playerCard}>
      {/* ── Player header ──────────────────────────────────────────────── */}
      <div className={`${theme.playerHeader} px-6 py-5`}>
        <div className="flex items-start justify-between">
          <div>
            <div className={`text-xs font-medium uppercase tracking-wider mb-1 ${theme.phSecondary}`}>
              {tr("nowPlaying")}
            </div>
            <div className={`font-bold text-xl leading-tight ${theme.phPrimary}`}>
              {surah ? surah.englishName : "—"}
            </div>
            {surah && (
              <div className={`text-sm mt-0.5 ${theme.phSecondary}`} dir="rtl">
                {surah.name}
              </div>
            )}
          </div>
          <div className="text-end">
            <div className={`text-xs ${theme.phSecondary}`}>{tr("ayahsLabel")}</div>
            <div className={`font-bold text-lg ${theme.phPrimary}`}>
              {playerState.startAyah === playerState.endAyah
                ? playerState.startAyah
                : `${playerState.startAyah}–${playerState.endAyah}`}
            </div>
            <div className={`text-xs ${theme.phSecondary}`}>
              {ayahCount} {tr("ayahCount")}
            </div>
          </div>
        </div>
        {reciter && (
          <div className="mt-3 flex items-center gap-2">
            <div className={`w-1.5 h-1.5 rounded-full ${theme.phDot}`} />
            <span className={`text-sm ${theme.phSecondary}`}>{reciter.name}</span>
          </div>
        )}
      </div>

      {/* ── Ayah progress ───────────────────────────────────────────────── */}
      <div className="px-6 pt-4 pb-2">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <span className={theme.muted}>{tr("ayah")}</span>
            <span className={`font-bold text-base ${theme.accent}`}>{status.currentAyah}</span>
            <span className={theme.muted}>{tr("of")} {playerState.endAyah}</span>
            <span className={`mx-1 ${theme.muted}`}>·</span>
            <span className={theme.muted}>{ayahProgress}/{ayahCount}</span>
          </div>
          <div className={`flex items-center gap-1 ${theme.muted}`}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span className="font-medium">{status.currentRepeat}/{totalRepeatsDisplay}</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-2 mb-1">
          <div className={`relative h-1.5 rounded-full overflow-hidden ${theme.pbBg}`}>
            <div
              className={`absolute inset-y-0 start-0 rounded-full transition-all duration-300 ${theme.pbFill}`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className={`flex justify-between text-xs mt-1 ${theme.muted}`}>
            <span>{formatTime(status.currentTime)}</span>
            <span>{formatTime(status.duration)}</span>
          </div>
        </div>

        {/* Ayah dots */}
        {ayahCount <= 20 && (
          <div className="flex gap-1.5 justify-center mt-3 flex-wrap">
            {Array.from({ length: ayahCount }, (_, i) => {
              const ayah = playerState.startAyah + i;
              const isDone = ayah < status.currentAyah;
              const isCurrent = ayah === status.currentAyah;
              return (
                <div
                  key={ayah}
                  title={`${tr("ayah")} ${ayah}`}
                  className={`rounded-full transition-all duration-300 ${
                    isCurrent ? `w-3 h-3 ${theme.dot}` : isDone ? `w-2 h-2 mt-0.5 ${theme.dotDone}` : `w-2 h-2 mt-0.5 ${theme.dotPending}`
                  }`}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* ── Pause banner ────────────────────────────────────────────────── */}
      {status.isPausing && (
        <div className={`mx-6 mb-2 px-4 py-3 flex items-center gap-3 ${theme.pauseBanner}`}>
          <div className={`w-9 h-9 flex items-center justify-center rounded-full flex-shrink-0 ${theme.pauseIconBg}`}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          </div>
          <div className="flex-1">
            <div className={`text-sm ${theme.pauseText}`}>{tr("yourTurn")}</div>
            <div className={`text-xs ${theme.pauseSub}`}>
              {tr("nextAyahIn")} {status.pauseRemaining}{tr("secs")}
            </div>
          </div>
          <button onClick={skipPause} className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium transition-colors touch-manipulation ${theme.pauseBtn}`}>
            {tr("skip")}
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
            </svg>
          </button>
        </div>
      )}

      {/* ── Error ───────────────────────────────────────────────────────── */}
      {status.error && (
        <div className={`mx-6 mb-3 px-3 py-2 text-sm ${theme.errBox}`}>
          {status.error}
        </div>
      )}

      {/* ── Controls ────────────────────────────────────────────────────── */}
      <div className="px-6 pb-6">
        <div className="flex items-center justify-center gap-6">
          {/* Prev */}
          <button
            onClick={skipPrev}
            disabled={status.currentAyah <= playerState.startAyah}
            className={`p-3 rounded-full transition-all touch-manipulation disabled:opacity-30 disabled:cursor-not-allowed ${theme.muted} hover:${theme.accent}`}
            title={tr("prevAyah")}
          >
            <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
            </svg>
          </button>

          {/* Main button */}
          {status.isPausing ? (
            <button onClick={skipPause} title={tr("skip")}
              className={`w-20 h-20 flex items-center justify-center rounded-full shadow-lg hover:shadow-xl transition-all active:scale-95 touch-manipulation ${theme.btnPrimary}`}>
              <svg className="w-9 h-9" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
              </svg>
            </button>
          ) : !status.isPlaying && !status.isLoading ? (
            <button onClick={play} title={tr("play")}
              className={`w-20 h-20 flex items-center justify-center rounded-full shadow-lg hover:shadow-xl transition-all active:scale-95 touch-manipulation ${theme.btnPrimary}`}>
              <svg className="w-9 h-9 ms-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </button>
          ) : status.isLoading ? (
            <div className={`w-20 h-20 flex items-center justify-center rounded-full shadow-lg ${theme.btnPrimary}`}>
              <svg className="w-9 h-9 animate-spin opacity-80" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
            </div>
          ) : (
            <button onClick={pause} title={tr("pause")}
              className={`w-20 h-20 flex items-center justify-center rounded-full shadow-lg hover:shadow-xl transition-all active:scale-95 touch-manipulation ${theme.btnPrimary}`}>
              <svg className="w-9 h-9" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
              </svg>
            </button>
          )}

          {/* Next */}
          <button
            onClick={skipNext}
            disabled={status.currentAyah >= playerState.endAyah}
            className={`p-3 rounded-full transition-all touch-manipulation disabled:opacity-30 disabled:cursor-not-allowed ${theme.muted}`}
            title={tr("nextAyah")}
          >
            <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
            </svg>
          </button>
        </div>

        {/* Stop */}
        {(status.isPlaying || status.isLoading || status.isPausing) && (
          <div className="flex justify-center mt-3">
            <button onClick={stop}
              className={`flex items-center gap-1.5 px-5 py-2 rounded-full text-sm transition-colors touch-manipulation ${theme.btnStop}`}>
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 6h12v12H6z" />
              </svg>
              {tr("stop")}
            </button>
          </div>
        )}

        {/* Speed bar */}
        <div className="mt-4 flex items-center gap-3">
          <span className={`text-xs w-12 ${theme.muted}`}>{tr("speedLabel")}</span>
          <div className={`flex-1 h-1.5 rounded-full overflow-hidden ${theme.pbBg}`}>
            <div className={`h-full rounded-full transition-all ${theme.pbFill}`}
              style={{ width: `${((playerState.speed - 0.5) / 1.5) * 100}%` }} />
          </div>
          <span className={`text-xs font-medium w-10 text-end ${theme.primary}`}>{playerState.speed}×</span>
        </div>

        {/* Pause bar */}
        {playerState.pauseAfterAyah !== 0 && (
          <div className="mt-2 flex items-center gap-3">
            <span className={`text-xs w-12 ${theme.muted}`}>{tr("pauseLabel")}</span>
            <div className={`flex-1 h-1.5 rounded-full overflow-hidden ${theme.pbBg}`}>
              <div className={`h-full rounded-full transition-all ${theme.pb2Fill}`}
                style={{
                  width: playerState.pauseAfterAyah === -1
                    ? "100%"
                    : `${(playerState.pauseAfterAyah / 30) * 100}%`,
                }} />
            </div>
            <span className={`text-xs font-medium w-10 text-end ${theme.primary}`}>
              {playerState.pauseAfterAyah === -1 ? tr("pauseMatch") : `${playerState.pauseAfterAyah}${tr("secs")}`}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
