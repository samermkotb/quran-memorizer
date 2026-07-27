"use client";

import { useMemo, useRef, useState } from "react";
import { RECITERS } from "@/lib/reciters";
import { Reciter } from "@/types";
import { useApp } from "@/contexts/AppContext";
import { RECITER_ACCENTS } from "@/lib/themes";

interface Props {
  value: string;
  onChange: (reciter: Reciter) => void;
}

/** First *word* of a name — never a single-letter initial (e.g. "Mishary", not "M"). */
function firstWord(name: string): string {
  return name.trim().split(/\s+/)[0] ?? name;
}

export default function ReciterSelector({ value, onChange }: Props) {
  const { theme, tr, lang } = useApp();
  const [query, setQuery] = useState("");
  const cardRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const styleLabel = (style: Reciter["style"]) =>
    lang === "ar"
      ? ({ Murattal: "مرتل", Mujawwad: "مجود", Muallim: "معلم" }[style])
      : style;

  const results = useMemo(
    () =>
      RECITERS.filter(
        (r) =>
          !query ||
          r.name.toLowerCase().includes(query.toLowerCase()) ||
          r.arabicName.includes(query)
      ),
    [query]
  );

  function focusCard(index: number) {
    const target = results[index];
    if (!target) return;
    cardRefs.current[target.id]?.focus();
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLButtonElement>, index: number) {
    const forward = lang === "ar" ? "ArrowLeft" : "ArrowRight";
    const backward = lang === "ar" ? "ArrowRight" : "ArrowLeft";
    if (e.key === forward) {
      e.preventDefault();
      focusCard(Math.min(index + 1, results.length - 1));
    } else if (e.key === backward) {
      e.preventDefault();
      focusCard(Math.max(index - 1, 0));
    } else if (e.key === "Home") {
      e.preventDefault();
      focusCard(0);
    } else if (e.key === "End") {
      e.preventDefault();
      focusCard(results.length - 1);
    }
  }

  return (
    <div>
      <label className="relative block mb-3">
        <svg
          className={`pointer-events-none absolute top-1/2 -translate-y-1/2 start-3 w-4 h-4 ${theme.muted}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m20 20-4.2-4.2m1.2-4.3a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0Z" />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={tr("searchReciter")}
          aria-label={tr("searchReciter")}
          className={`w-full ps-9 pe-3 py-2.5 text-sm focus:outline-none transition-colors ${theme.input}`}
        />
      </label>

      {results.length === 0 ? (
        <p className={`text-sm text-center py-6 ${theme.muted}`}>{tr("noReciters")}</p>
      ) : (
        <div
          role="listbox"
          aria-label={tr("reciter")}
          className="flex gap-3.5 overflow-x-auto scrollbar-none snap-x snap-mandatory px-1 py-1 -mx-1"
          style={{ scrollPaddingInlineStart: "0.25rem" }}
        >
          {results.map((reciter, index) => {
            const selected = reciter.id === value;
            return (
              <button
                key={reciter.id}
                ref={(el) => { cardRefs.current[reciter.id] = el; }}
                type="button"
                role="option"
                aria-selected={selected}
                tabIndex={selected || (!results.some((r) => r.id === value) && index === 0) ? 0 : -1}
                onClick={() => onChange(reciter)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                className={`relative flex-shrink-0 snap-start w-[172px] px-3.5 pt-[18px] pb-4 flex flex-col items-center text-center transition-transform hover:-translate-y-1 touch-manipulation focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-600 shadow-card rounded-[18px] ${
                  RECITER_ACCENTS[index % RECITER_ACCENTS.length]
                } ${selected ? theme.reciterCardActive : ""}`}
              >
                <span
                  className={`absolute start-2.5 top-2.5 w-5 h-5 flex items-center justify-center rounded-full transition-all ${theme.reciterCheck} ${
                    selected ? "opacity-100 scale-100" : "opacity-0 scale-50"
                  }`}
                >
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </span>

                <span
                  className={`w-16 h-16 flex items-center justify-center rounded-full font-wordmark font-bold px-1 text-center leading-tight mt-1 mb-3 ${theme.reciterAvatar}`}
                  style={{ fontSize: "12px" }}
                  aria-hidden="true"
                >
                  <span className="line-clamp-2 break-words" dir={lang === "ar" ? "rtl" : "ltr"}>
                    {firstWord(lang === "ar" ? reciter.arabicName : reciter.name)}
                  </span>
                </span>

                <div className="min-w-0 w-full">
                  <div
                    className={`font-bold text-sm text-white truncate ${lang === "ar" ? "font-quran" : ""}`}
                    dir={lang === "ar" ? "rtl" : undefined}
                  >
                    {lang === "ar" ? reciter.arabicName : reciter.name}
                  </div>
                  <div
                    className={`text-xs text-white/80 truncate mt-0.5 ${lang === "en" ? "font-quran" : ""}`}
                    dir={lang === "en" ? "rtl" : undefined}
                  >
                    {lang === "ar" ? reciter.name : reciter.arabicName}
                  </div>
                </div>

                <span className={`inline-block mt-2.5 text-[10.5px] font-semibold px-2.5 py-1 rounded-full ${theme.reciterStyle[reciter.style] ?? "bg-white/20 text-white"}`}>
                  {styleLabel(reciter.style)}
                </span>

                <div className="text-[11px] text-white/70 mt-2 leading-snug">
                  {reciter.bitrate}
                  {reciter.source === "mp3quran" && ` · ${tr("fullSurahOnly")}`}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
