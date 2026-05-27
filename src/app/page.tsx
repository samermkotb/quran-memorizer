"use client";

import { useState, useEffect, useCallback } from "react";
import { PlayerState } from "@/types";
import { SURAHS, getSurah } from "@/lib/surahData";
import { DEFAULT_RECITER_ID, getReciter } from "@/lib/reciters";
import { decodeShareUrl } from "@/lib/shareUtils";
import SurahSelector from "@/components/SurahSelector";
import ReciterSelector from "@/components/ReciterSelector";
import AudioPlayer from "@/components/AudioPlayer";
import ShareButton from "@/components/ShareButton";

const DEFAULT_STATE: PlayerState = {
  surahNumber: 1,
  startAyah: 1,
  endAyah: 7,
  reciterId: DEFAULT_RECITER_ID,
  repeatCount: 3,
  infiniteRepeat: false,
  speed: 1,
  pauseAfterAyah: 0,
};

const SPEED_OPTIONS = [0.5, 0.75, 1, 1.25, 1.5, 2];

const PAUSE_OPTIONS = [
  { label: "Off", value: 0 },
  { label: "3s", value: 3 },
  { label: "5s", value: 5 },
  { label: "10s", value: 10 },
  { label: "15s", value: 15 },
  { label: "30s", value: 30 },
  { label: "Match", value: -1 },
];

export default function Home() {
  const [playerState, setPlayerState] = useState<PlayerState>(DEFAULT_STATE);
  const [committed, setCommitted] = useState(false);

  // Load from URL on mount
  useEffect(() => {
    const decoded = decodeShareUrl(window.location.search);
    if (decoded.surahNumber) {
      const surah = getSurah(decoded.surahNumber);
      if (surah) {
        const maxAyah = surah.numberOfAyahs;
        const start = Math.min(decoded.startAyah ?? 1, maxAyah);
        const end = Math.min(decoded.endAyah ?? maxAyah, maxAyah);
        const reciterId = decoded.reciterId && getReciter(decoded.reciterId)
          ? decoded.reciterId
          : DEFAULT_RECITER_ID;

        setPlayerState({
          surahNumber: decoded.surahNumber,
          startAyah: start,
          endAyah: Math.max(start, end),
          reciterId,
          repeatCount: decoded.repeatCount ?? 3,
          infiniteRepeat: decoded.infiniteRepeat ?? false,
          speed: decoded.speed ?? 1,
          pauseAfterAyah: decoded.pauseAfterAyah ?? 0,
        });
        setCommitted(true);
      }
    }
  }, []);

  const currentSurah = getSurah(playerState.surahNumber);
  const maxAyah = currentSurah?.numberOfAyahs ?? 1;

  const update = useCallback((patch: Partial<PlayerState>) => {
    setPlayerState((prev) => {
      const next = { ...prev, ...patch };
      // Clamp ayahs on surah change
      if (patch.surahNumber !== undefined) {
        const s = getSurah(patch.surahNumber);
        const max = s?.numberOfAyahs ?? 1;
        next.startAyah = 1;
        next.endAyah = max;
      }
      // Keep start <= end
      if (next.startAyah > next.endAyah) next.endAyah = next.startAyah;
      if (next.endAyah < next.startAyah) next.startAyah = next.endAyah;
      // Clamp to surah bounds
      const max2 = getSurah(next.surahNumber)?.numberOfAyahs ?? 1;
      next.startAyah = Math.max(1, Math.min(next.startAyah, max2));
      next.endAyah = Math.max(1, Math.min(next.endAyah, max2));
      return next;
    });
    // Speed, repeat count, and infinite repeat update live — don't hide the player.
    // Surah/ayah/reciter changes are handled by AudioPlayer's own reset effect.
  }, []);

  function handleStart() {
    setCommitted(true);
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <header className="text-center pt-4 pb-2">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-emerald-500 rounded-2xl mb-4 shadow-lg">
            <span className="text-white text-2xl font-bold" style={{ fontFamily: "serif" }}>
              ق
            </span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            Quran Memorizer
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            Listen · Repeat · Memorize
          </p>
        </header>

        {/* Selection form */}
        <div className="bg-white/80 backdrop-blur rounded-2xl border border-emerald-100 shadow-sm p-6 space-y-5">
          {/* Surah */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Surah <span className="text-gray-400 font-normal">(Chapter)</span>
            </label>
            <SurahSelector
              value={playerState.surahNumber}
              onChange={(surah) => update({ surahNumber: surah.number })}
            />
          </div>

          {/* Ayah range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                From Ayah
              </label>
              <input
                type="number"
                min={1}
                max={maxAyah}
                value={playerState.startAyah}
                onChange={(e) => {
                  const v = Math.max(1, Math.min(parseInt(e.target.value) || 1, maxAyah));
                  update({ startAyah: v });
                }}
                className="w-full px-4 py-3 border-2 border-emerald-200 rounded-xl text-gray-800 font-medium focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                To Ayah
              </label>
              <input
                type="number"
                min={playerState.startAyah}
                max={maxAyah}
                value={playerState.endAyah}
                onChange={(e) => {
                  const v = Math.max(playerState.startAyah, Math.min(parseInt(e.target.value) || playerState.startAyah, maxAyah));
                  update({ endAyah: v });
                }}
                className="w-full px-4 py-3 border-2 border-emerald-200 rounded-xl text-gray-800 font-medium focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
          </div>

          {/* Surah info chips */}
          {currentSurah && (
            <div className="flex flex-wrap gap-2">
              <span className="text-xs bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full border border-emerald-100">
                {currentSurah.numberOfAyahs} total ayahs
              </span>
              <span className="text-xs bg-teal-50 text-teal-700 px-3 py-1 rounded-full border border-teal-100">
                {currentSurah.revelationType}
              </span>
              <span className="text-xs bg-gray-50 text-gray-600 px-3 py-1 rounded-full border border-gray-100" dir="rtl">
                {currentSurah.name}
              </span>
              <span className="text-xs bg-gray-50 text-gray-600 px-3 py-1 rounded-full border border-gray-100">
                {currentSurah.englishNameTranslation}
              </span>
            </div>
          )}

          {/* Quick range buttons */}
          {currentSurah && (
            <div className="flex flex-wrap gap-2">
              <span className="text-xs text-gray-400 self-center">Quick range:</span>
              <button
                onClick={() => update({ startAyah: 1, endAyah: currentSurah.numberOfAyahs })}
                className="text-xs px-3 py-1 rounded-full border border-emerald-200 text-emerald-600 hover:bg-emerald-50 transition-colors"
              >
                Whole Surah
              </button>
              {currentSurah.numberOfAyahs >= 5 && (
                <button
                  onClick={() => update({ startAyah: 1, endAyah: 5 })}
                  className="text-xs px-3 py-1 rounded-full border border-emerald-200 text-emerald-600 hover:bg-emerald-50 transition-colors"
                >
                  First 5
                </button>
              )}
              {currentSurah.numberOfAyahs >= 10 && (
                <button
                  onClick={() => update({ startAyah: 1, endAyah: 10 })}
                  className="text-xs px-3 py-1 rounded-full border border-emerald-200 text-emerald-600 hover:bg-emerald-50 transition-colors"
                >
                  First 10
                </button>
              )}
            </div>
          )}

          {/* Reciter */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Reciter <span className="text-gray-400 font-normal">(القارئ)</span>
            </label>
            <ReciterSelector
              value={playerState.reciterId}
              onChange={(reciter) => update({ reciterId: reciter.id })}
            />
          </div>

          {/* Repeat settings */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-gray-700">
              Repeat Settings
            </label>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 flex-1">
                <span className="text-sm text-gray-500">Repeat</span>
                <input
                  type="number"
                  min={1}
                  max={99}
                  value={playerState.repeatCount}
                  disabled={playerState.infiniteRepeat}
                  onChange={(e) => update({ repeatCount: Math.max(1, Math.min(99, parseInt(e.target.value) || 1)) })}
                  className="w-20 px-3 py-2 border-2 border-emerald-200 rounded-xl text-gray-800 font-medium text-center focus:outline-none focus:border-emerald-500 disabled:opacity-50 disabled:bg-gray-50 transition-colors"
                />
                <span className="text-sm text-gray-500">times</span>
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <div
                  onClick={() => update({ infiniteRepeat: !playerState.infiniteRepeat })}
                  className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer ${
                    playerState.infiniteRepeat ? "bg-emerald-500" : "bg-gray-200"
                  }`}
                >
                  <div
                    className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                      playerState.infiniteRepeat ? "translate-x-5" : "translate-x-0.5"
                    }`}
                  />
                </div>
                <span className="text-sm text-gray-600">∞ Loop</span>
              </label>
            </div>
          </div>

          {/* Speed */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Playback Speed
            </label>
            <div className="flex gap-2 flex-wrap">
              {SPEED_OPTIONS.map((speed) => (
                <button
                  key={speed}
                  onClick={() => update({ speed })}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium border-2 transition-colors ${
                    playerState.speed === speed
                      ? "bg-emerald-500 text-white border-emerald-500"
                      : "bg-white text-gray-600 border-gray-200 hover:border-emerald-300"
                  }`}
                >
                  {speed}×
                </button>
              ))}
            </div>
          </div>

          {/* Pause after ayah */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Pause After Each Ayah{" "}
              <span className="text-gray-400 font-normal">(time to repeat)</span>
            </label>
            <p className="text-xs text-gray-400 mb-2">
              <span className="font-medium text-gray-500">Match</span> = same duration as the recitation
            </p>
            <div className="flex gap-2 flex-wrap">
              {PAUSE_OPTIONS.map(({ label, value }) => (
                <button
                  key={value}
                  onClick={() => update({ pauseAfterAyah: value })}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium border-2 transition-colors ${
                    playerState.pauseAfterAyah === value
                      ? "bg-teal-500 text-white border-teal-500"
                      : "bg-white text-gray-600 border-gray-200 hover:border-teal-300"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Start button */}
          <button
            onClick={handleStart}
            className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all active:scale-[0.98] text-base"
          >
            {committed ? "Update Player" : "Start Listening"}
          </button>
        </div>

        {/* Audio Player — only shown after first Start */}
        {committed && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
            <AudioPlayer playerState={playerState} />
          </div>
        )}

        {/* Share */}
        {committed && (
          <div className="animate-in fade-in duration-500">
            <ShareButton playerState={playerState} />
          </div>
        )}

        {/* Footer */}
        <footer className="text-center text-xs text-gray-400 pb-8 space-y-1">
          <p>Audio from <a href="https://everyayah.com" target="_blank" rel="noopener noreferrer" className="text-emerald-500 hover:underline">EveryAyah.com</a> — free Quran audio</p>
          <p>Quran data from open public sources</p>
        </footer>
      </div>
    </div>
  );
}
