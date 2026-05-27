"use client";

import { useState, useRef, useEffect } from "react";
import { SURAHS, searchSurahs } from "@/lib/surahData";
import { Surah } from "@/types";
import { useApp } from "@/contexts/AppContext";

interface Props {
  value: number;
  onChange: (surah: Surah) => void;
}

export default function SurahSelector({ value, onChange }: Props) {
  const { theme, tr, lang } = useApp();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const results = searchSurahs(query);
  const selected = SURAHS.find((s) => s.number === value);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent | TouchEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside, { passive: true });
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  function select(surah: Surah) {
    onChange(surah);
    setOpen(false);
    setQuery("");
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`w-full flex items-center justify-between px-4 py-3 text-start focus:outline-none transition-colors ${theme.dropTrigger}`}
      >
        {selected ? (
          <div className="flex items-center gap-3">
            <span className={`text-xs font-bold rounded-lg px-2 py-1 min-w-[2.5rem] text-center ${theme.dropNum}`}>
              {selected.number}
            </span>
            <div>
              <div className={`font-semibold ${theme.primary}`}>
                {lang === "ar" ? selected.name : selected.englishName}
              </div>
              <div className={`text-xs ${theme.muted}`}>
                {lang === "ar" ? selected.englishName : selected.name} · {selected.numberOfAyahs} {tr("ayahCount")}
              </div>
            </div>
          </div>
        ) : (
          <span className={theme.muted}>{tr("selectSurah")}</span>
        )}
        <svg
          className={`w-5 h-5 flex-shrink-0 transition-transform ${theme.muted} ${open ? "rotate-180" : ""}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className={`absolute z-50 w-full mt-2 overflow-hidden ${theme.dropdown}`}>
          <div className={`p-3 border-b ${theme.muted}`} style={{ borderColor: "inherit" }}>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={tr("searchSurah")}
              className={`w-full px-3 py-2 text-sm focus:outline-none ${theme.dropSearch}`}
            />
          </div>
          <ul ref={listRef} className="max-h-64 overflow-y-auto">
            {results.length === 0 ? (
              <li className={`px-4 py-3 text-sm text-center ${theme.muted}`}>{tr("noSurahs")}</li>
            ) : (
              results.map((surah) => (
                <li key={surah.number}>
                  <button
                    type="button"
                    onClick={() => select(surah)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-start transition-colors ${
                      surah.number === value ? theme.dropItemActive : theme.dropItem
                    }`}
                  >
                    <span className={`text-xs font-bold rounded-md px-1.5 py-0.5 min-w-[2rem] text-center flex-shrink-0 ${theme.dropNum}`}>
                      {surah.number}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className={`font-medium text-sm ${theme.primary}`}>
                        {lang === "ar" ? surah.name : surah.englishName}
                      </div>
                      <div className={`text-xs truncate ${theme.muted}`}>
                        {lang === "ar" ? surah.englishName : surah.name} · {surah.numberOfAyahs} {tr("ayahCount")}
                      </div>
                    </div>
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
