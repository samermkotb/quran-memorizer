"use client";

import { useState, useEffect, useCallback } from "react";
import { PlayerState } from "@/types";
import { SURAHS, getSurah } from "@/lib/surahData";
import { DEFAULT_RECITER_ID, getReciter } from "@/lib/reciters";
import { decodeShareUrl } from "@/lib/shareUtils";
import { useApp } from "@/contexts/AppContext";
import { ChildBoy, ChildGirl, ChildBoy2, ChildGirl2 } from "@/components/ChildIllustrations";
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

export default function Home() {
  const { theme, tr, mode, setMode, lang, setLang } = useApp();
  const [playerState, setPlayerState] = useState<PlayerState>(DEFAULT_STATE);
  const [committed, setCommitted] = useState(false);

  const PAUSE_OPTIONS = [
    { label: tr("pauseOff"), value: 0 },
    { label: "3s", value: 3 },
    { label: "5s", value: 5 },
    { label: "10s", value: 10 },
    { label: "15s", value: 15 },
    { label: "30s", value: 30 },
    { label: tr("pauseMatch"), value: -1 },
  ];

  // Load from URL on mount
  useEffect(() => {
    const decoded = decodeShareUrl(window.location.search);
    if (decoded.surahNumber) {
      const surah = getSurah(decoded.surahNumber);
      if (surah) {
        const maxAyah = surah.numberOfAyahs;
        const start = Math.min(decoded.startAyah ?? 1, maxAyah);
        const end = Math.min(decoded.endAyah ?? maxAyah, maxAyah);
        const reciterId =
          decoded.reciterId && getReciter(decoded.reciterId)
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
      if (patch.surahNumber !== undefined) {
        const s = getSurah(patch.surahNumber);
        const max = s?.numberOfAyahs ?? 1;
        next.startAyah = 1;
        next.endAyah = max;
      }
      if (next.startAyah > next.endAyah) next.endAyah = next.startAyah;
      if (next.endAyah < next.startAyah) next.startAyah = next.endAyah;
      const max2 = getSurah(next.surahNumber)?.numberOfAyahs ?? 1;
      next.startAyah = Math.max(1, Math.min(next.startAyah, max2));
      next.endAyah = Math.max(1, Math.min(next.endAyah, max2));
      return next;
    });
  }, []);

  const isChild = theme.isChild;

  return (
    <div className={`${theme.pageBg} min-h-screen`}>
      {theme.pagePattern && <div className="fixed inset-0 islamic-pattern pointer-events-none" />}

      {/* ── Top Bar ─────────────────────────────────────────────────── */}
      <div className={`sticky top-0 z-50 ${theme.topBar}`}>
        <div className="max-w-2xl mx-auto px-4 py-2 flex items-center justify-between gap-3">
          {/* Mode toggle */}
          <div className="flex items-center gap-1 p-0.5 bg-black/10 rounded-xl">
            <button
              onClick={() => setMode("adult")}
              className={`px-3 py-1.5 text-xs font-medium transition-all ${mode === "adult" ? theme.modeActive : theme.modeInactive}`}
            >
              {isChild ? "👤 " : ""}{tr("modeAdult")}
            </button>
            <button
              onClick={() => setMode("child")}
              className={`px-3 py-1.5 text-xs font-medium transition-all ${mode === "child" ? theme.modeActive : theme.modeInactive}`}
            >
              {isChild ? "🧒 " : ""}{tr("modeChild")}
            </button>
          </div>

          {/* Language toggle */}
          <div className="flex items-center gap-1 p-0.5 bg-black/10 rounded-xl">
            <button
              onClick={() => setLang("en")}
              className={`px-3 py-1.5 text-xs font-medium transition-all ${lang === "en" ? theme.langActive : theme.langInactive}`}
            >
              EN
            </button>
            <button
              onClick={() => setLang("ar")}
              className={`px-3 py-1.5 text-xs font-medium transition-all ${lang === "ar" ? theme.langActive : theme.langInactive}`}
            >
              عر
            </button>
          </div>
        </div>
      </div>

      <div className="relative max-w-2xl mx-auto px-4 py-6 space-y-6">

        {/* ── Header ──────────────────────────────────────────────────── */}
        <header className="text-center pt-2 pb-4">
          {isChild ? (
            <>
              {/* On phones, keep the title easy to read and gather the children beneath it. */}
              <div className="sm:hidden">
                <div className="text-3xl mb-1 select-none">🌙</div>
                <h1 className={`text-3xl font-black tracking-tight mb-0.5 ${theme.titleColor}`}>
                  {tr("appName")}
                </h1>
                <div className="flex justify-center gap-0.5 text-lg select-none mb-0.5">⭐⭐⭐</div>
                <p className={`text-sm font-bold ${theme.subtitleColor}`}>
                  {tr("childGreeting")}
                </p>
                <div className="flex items-end justify-center gap-1 mt-3 mb-1">
                  <ChildGirl2 className="w-16 h-20 drop-shadow-md" />
                  <ChildBoy className="w-14 h-18 drop-shadow-md" />
                  <ChildGirl className="w-14 h-18 drop-shadow-md" />
                  <ChildBoy2 className="w-16 h-20 drop-shadow-md" />
                </div>
              </div>

              {/* Larger screens place the Quran learners around the heading. */}
              <div className="hidden sm:flex items-end justify-center gap-2 mb-1">
                {/* Left pair */}
                <div className="flex items-end gap-1 mb-2">
                  <ChildGirl2
                    className="w-16 h-20 drop-shadow-md"
                    style={{ filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.12))" }}
                  />
                  <ChildBoy
                    className="w-14 h-18 drop-shadow-md"
                    style={{ filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.10))" }}
                  />
                </div>

                {/* Centre title block */}
                <div className="text-center px-1 pb-2">
                  <div className="text-3xl mb-1 select-none">🌙</div>
                  <h1 className={`text-3xl font-black tracking-tight mb-0.5 ${theme.titleColor}`}>
                    {tr("appName")}
                  </h1>
                  <div className="flex justify-center gap-0.5 text-lg select-none mb-0.5">⭐⭐⭐</div>
                  <p className={`text-sm font-bold ${theme.subtitleColor}`}>
                    {tr("childGreeting")}
                  </p>
                </div>

                {/* Right pair */}
                <div className="flex items-end gap-1 mb-2">
                  <ChildGirl
                    className="w-14 h-18 drop-shadow-md"
                    style={{ filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.10))" }}
                  />
                  <ChildBoy2
                    className="w-16 h-20 drop-shadow-md"
                    style={{ filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.12))" }}
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Ornamental line */}
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="h-px w-16 bg-gradient-to-r from-transparent to-yellow-600/60" />
                <div className={`w-12 h-12 flex items-center justify-center ${theme.logoBg} rounded-xl shadow-lg`}>
                  <span className={`text-2xl font-bold ${theme.logoChar}`} style={{ fontFamily: "serif" }}>
                    ق
                  </span>
                </div>
                <div className="h-px w-16 bg-gradient-to-l from-transparent to-yellow-600/60" />
              </div>
              <h1 className={`text-4xl font-bold tracking-tight mb-1 ${theme.titleColor}`} style={{ fontFamily: "serif" }}>
                {tr("appName")}
              </h1>
              <p className={`text-sm ${theme.subtitleColor}`}>{tr("tagline")}</p>
            </>
          )}
        </header>

        {/* ── Selection Form ───────────────────────────────────────────── */}
        <div className={`${theme.card} p-6 space-y-5`}>

          {/* Surah */}
          <div>
            <label className={`block text-sm mb-2 ${theme.label}`}>
              {tr("surah")}{" "}
              <span className={`font-normal text-xs ${theme.muted}`}>({tr("chapter")})</span>
            </label>
            <SurahSelector
              value={playerState.surahNumber}
              onChange={(surah) => update({ surahNumber: surah.number })}
            />
          </div>

          {/* Ayah range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm mb-2 ${theme.label}`}>{tr("fromAyah")}</label>
              <input
                type="number"
                min={1}
                max={maxAyah}
                value={playerState.startAyah}
                onChange={(e) => {
                  const v = Math.max(1, Math.min(parseInt(e.target.value) || 1, maxAyah));
                  update({ startAyah: v });
                }}
                className={`w-full px-4 py-3 font-medium focus:outline-none transition-colors ${theme.input}`}
              />
            </div>
            <div>
              <label className={`block text-sm mb-2 ${theme.label}`}>{tr("toAyah")}</label>
              <input
                type="number"
                min={playerState.startAyah}
                max={maxAyah}
                value={playerState.endAyah}
                onChange={(e) => {
                  const v = Math.max(
                    playerState.startAyah,
                    Math.min(parseInt(e.target.value) || playerState.startAyah, maxAyah)
                  );
                  update({ endAyah: v });
                }}
                className={`w-full px-4 py-3 font-medium focus:outline-none transition-colors ${theme.input}`}
              />
            </div>
          </div>

          {/* Surah info chips */}
          {currentSurah && (
            <div className="flex flex-wrap gap-2">
              <span className={`text-xs px-3 py-1 ${theme.chip1}`}>
                {currentSurah.numberOfAyahs} {tr("totalAyahs")}
              </span>
              <span className={`text-xs px-3 py-1 ${theme.chip2}`}>
                {currentSurah.revelationType === "Meccan" ? tr("meccan") : tr("medinan")}
              </span>
              <span className={`text-xs px-3 py-1 ${theme.chip3}`} dir="rtl">
                {currentSurah.name}
              </span>
              {lang === "en" && (
                <span className={`text-xs px-3 py-1 ${theme.chip3}`}>
                  {currentSurah.englishNameTranslation}
                </span>
              )}
            </div>
          )}

          {/* Quick range */}
          {currentSurah && (
            <div className="flex flex-wrap gap-2 items-center">
              <span className={`text-xs ${theme.muted}`}>{tr("quickRange")}</span>
              <button
                onClick={() => update({ startAyah: 1, endAyah: currentSurah.numberOfAyahs })}
                className={`text-xs px-3 py-1 border transition-colors ${theme.chip}`}
              >
                {tr("wholeSurah")}
              </button>
              {currentSurah.numberOfAyahs >= 5 && (
                <button
                  onClick={() => update({ startAyah: 1, endAyah: 5 })}
                  className={`text-xs px-3 py-1 border transition-colors ${theme.chip}`}
                >
                  {tr("first5")}
                </button>
              )}
              {currentSurah.numberOfAyahs >= 10 && (
                <button
                  onClick={() => update({ startAyah: 1, endAyah: 10 })}
                  className={`text-xs px-3 py-1 border transition-colors ${theme.chip}`}
                >
                  {tr("first10")}
                </button>
              )}
            </div>
          )}

          {/* Reciter */}
          <div>
            <label className={`block text-sm mb-2 ${theme.label}`}>
              {tr("reciter")}{" "}
              <span className={`font-normal text-xs ${theme.muted}`}>({tr("reciterSub")})</span>
            </label>
            <ReciterSelector
              value={playerState.reciterId}
              onChange={(reciter) => update({ reciterId: reciter.id })}
            />
          </div>

          {/* Repeat settings */}
          <div className="space-y-3">
            <label className={`block text-sm ${theme.label}`}>{tr("repeatSettings")}</label>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 flex-1">
                <span className={`text-sm ${theme.muted}`}>{tr("repeat")}</span>
                <input
                  type="number"
                  min={1}
                  max={99}
                  value={playerState.repeatCount}
                  disabled={playerState.infiniteRepeat}
                  onChange={(e) =>
                    update({ repeatCount: Math.max(1, Math.min(99, parseInt(e.target.value) || 1)) })
                  }
                  className={`w-20 px-3 py-2 font-medium text-center focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${theme.input}`}
                />
                <span className={`text-sm ${theme.muted}`}>{tr("times")}</span>
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <div
                  onClick={() => update({ infiniteRepeat: !playerState.infiniteRepeat })}
                  className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer ${
                    playerState.infiniteRepeat ? theme.toggleOn : theme.toggleOff
                  }`}
                >
                  <div
                    className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                      playerState.infiniteRepeat ? "translate-x-5" : "translate-x-0.5"
                    }`}
                  />
                </div>
                <span className={`text-sm ${theme.primary}`}>{tr("infiniteLoop")}</span>
              </label>
            </div>
          </div>

          {/* Speed */}
          <div>
            <label className={`block text-sm mb-2 ${theme.label}`}>{tr("playbackSpeed")}</label>
            <div className="flex gap-2 flex-wrap">
              {SPEED_OPTIONS.map((speed) => (
                <button
                  key={speed}
                  onClick={() => update({ speed })}
                  className={`px-3 py-1.5 text-sm font-medium border-2 transition-all ${
                    playerState.speed === speed ? theme.chipActive : theme.chip
                  }`}
                >
                  {speed}×
                </button>
              ))}
            </div>
          </div>

          {/* Pause after ayah */}
          <div>
            <label className={`block text-sm mb-1 ${theme.label}`}>
              {tr("pauseAfterAyah")}{" "}
              <span className={`font-normal text-xs ${theme.muted}`}>({tr("pauseHint")})</span>
            </label>
            <p className={`text-xs mb-2 ${theme.muted}`}>
              <span className={`font-semibold ${isChild ? "text-orange-500" : "text-yellow-500"}`}>
                {tr("pauseMatch")}
              </span>{" "}
              — {tr("pauseMatchNote").split(" — ").slice(1).join(" — ")}
            </p>
            <div className="flex gap-2 flex-wrap">
              {PAUSE_OPTIONS.map(({ label, value }) => (
                <button
                  key={value}
                  onClick={() => update({ pauseAfterAyah: value })}
                  className={`px-3 py-1.5 text-sm font-medium border-2 transition-all ${
                    playerState.pauseAfterAyah === value ? theme.chipActive : theme.chip
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Start / Update button */}
          <button
            onClick={() => setCommitted(true)}
            className={`w-full py-4 font-bold transition-all active:scale-[0.98] text-base shadow-md hover:shadow-lg ${theme.btnPrimary}`}
          >
            {isChild && "▶ "}
            {committed ? tr("updatePlayer") : tr("startListening")}
          </button>

          {/* Child-mode motivation strip */}
          {isChild && (
            <div className="flex items-end justify-around pt-1">
              <ChildBoy className="w-12 h-16 opacity-80" style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.08))" }} />
              <ChildGirl className="w-14 h-18 opacity-90" style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.08))" }} />
              <ChildBoy2 className="w-12 h-16 opacity-80" style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.08))" }} />
              <ChildGirl2 className="w-14 h-18 opacity-90" style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.08))" }} />
            </div>
          )}
        </div>

        {/* ── Audio Player ─────────────────────────────────────────────── */}
        {committed && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
            <AudioPlayer playerState={playerState} />
          </div>
        )}

        {/* ── Share ────────────────────────────────────────────────────── */}
        {committed && (
          <div className="animate-in fade-in duration-500">
            <ShareButton playerState={playerState} />
          </div>
        )}

        {/* ── Footer ───────────────────────────────────────────────────── */}
        <footer className={`text-center text-xs pb-8 space-y-1 ${theme.footer}`}>
          <p>
            {tr("audioFrom")}{" "}
            <a
              href="https://everyayah.com"
              target="_blank"
              rel="noopener noreferrer"
              className={theme.footerLink}
            >
              EveryAyah.com
            </a>{" "}
            {tr("freeAudio")}
          </p>
          <p>{tr("quranData")}</p>
        </footer>
      </div>
    </div>
  );
}
