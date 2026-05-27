"use client";

import { useState, useRef, useEffect } from "react";
import { SURAHS, searchSurahs } from "@/lib/surahData";
import { Surah } from "@/types";

interface Props {
  value: number;
  onChange: (surah: Surah) => void;
}

export default function SurahSelector({ value, onChange }: Props) {
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
        className="w-full flex items-center justify-between px-4 py-3 bg-white border-2 border-emerald-200 rounded-xl text-left hover:border-emerald-400 focus:outline-none focus:border-emerald-500 transition-colors"
      >
        {selected ? (
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 rounded-lg px-2 py-1 min-w-[2.5rem] text-center">
              {selected.number}
            </span>
            <div>
              <div className="font-semibold text-gray-800">{selected.englishName}</div>
              <div className="text-xs text-gray-500">{selected.name} · {selected.numberOfAyahs} ayahs</div>
            </div>
          </div>
        ) : (
          <span className="text-gray-400">Select a Surah...</span>
        )}
        <svg className={`w-5 h-5 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute z-50 w-full mt-2 bg-white border-2 border-emerald-200 rounded-xl shadow-xl overflow-hidden">
          <div className="p-3 border-b border-gray-100">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search surah name or number..."
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-emerald-400"
            />
          </div>
          <ul ref={listRef} className="max-h-64 overflow-y-auto">
            {results.length === 0 ? (
              <li className="px-4 py-3 text-sm text-gray-400 text-center">No surahs found</li>
            ) : (
              results.map((surah) => (
                <li key={surah.number}>
                  <button
                    type="button"
                    onClick={() => select(surah)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-emerald-50 transition-colors ${
                      surah.number === value ? "bg-emerald-50 text-emerald-700" : "text-gray-700"
                    }`}
                  >
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 rounded-md px-1.5 py-0.5 min-w-[2rem] text-center">
                      {surah.number}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm">{surah.englishName}</div>
                      <div className="text-xs text-gray-400 truncate">{surah.name} · {surah.numberOfAyahs} ayahs · {surah.revelationType}</div>
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
