"use client";

import { useMemo, useRef, useState } from "react";
import { RECITERS } from "@/lib/reciters";
import { Reciter } from "@/types";
import { useApp } from "@/contexts/AppContext";

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
          className="flex gap-3 overflow-x-auto scrollbar-none snap-x snap-mandatory px-1 py-1 -mx-1"
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
                className={`relative flex-shrink-0 snap-start w-36 p-3 flex flex-col items-center gap-2 text-center transition-all touch-manipulation focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 ${
                  selected ? theme.reciterCardActive : theme.reciterCard
                } ${theme.isChild ? "rounded-3xl" : "rounded-2xl"} border`}
              >
                {selected && (
                  <span className="absolute top-2 end-2 w-5 h-5 flex items-center justify-center rounded-full bg-gold-500 text-[#17130c]">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                )}

                <span
                  className={`w-14 h-14 flex items-center justify-center rounded-2xl font-bold px-1 text-center leading-tight ${
                    selected ? theme.reciterAvatarActive : theme.reciterAvatar
                  }`}
                  style={{ fontSize: "11px" }}
                  aria-hidden="true"
                >
                  <span className="line-clamp-2 break-words" dir={lang === "ar" ? "rtl" : "ltr"}>
                    {firstWord(lang === "ar" ? reciter.arabicName : reciter.name)}
                  </span>
                </span>

                <div className="min-w-0 w-full">
                  <div className={`font-semibold text-sm truncate ${theme.primary}`} dir={lang === "ar" ? "rtl" : undefined}>
                    {lang === "ar" ? reciter.arabicName : reciter.name}
                  </div>
                  <div className={`text-xs truncate ${theme.muted}`} dir={lang === "en" ? "rtl" : undefined}>
                    {lang === "ar" ? reciter.name : reciter.arabicName}
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-1">
                  <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${theme.reciterStyle[reciter.style] ?? theme.dropNum}`}>
                    {styleLabel(reciter.style)}
                  </span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${theme.chip1}`}>
                    {reciter.bitrate}
                  </span>
                </div>

                {reciter.source === "mp3quran" && (
                  <div className={`text-[10px] leading-tight ${theme.muted}`}>{tr("fullSurahOnly")}</div>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
