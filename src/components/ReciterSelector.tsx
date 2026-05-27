"use client";

import { useState, useRef, useEffect } from "react";
import { RECITERS } from "@/lib/reciters";
import { Reciter } from "@/types";
import { useApp } from "@/contexts/AppContext";

interface Props {
  value: string;
  onChange: (reciter: Reciter) => void;
}

export default function ReciterSelector({ value, onChange }: Props) {
  const { theme, tr, lang } = useApp();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const selected = RECITERS.find((r) => r.id === value);
  const results = RECITERS.filter(
    (r) =>
      !query ||
      r.name.toLowerCase().includes(query.toLowerCase()) ||
      r.arabicName.includes(query)
  );
  const styleLabel = (style: Reciter["style"]) =>
    lang === "ar"
      ? ({ Murattal: "مرتل", Mujawwad: "مجود", Muallim: "معلم" }[style])
      : style;

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

  function select(reciter: Reciter) {
    onChange(reciter);
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
            <span className={`text-xs font-semibold px-2 py-1 rounded-lg ${theme.reciterStyle[selected.style] ?? theme.dropNum}`}>
              {styleLabel(selected.style)}
            </span>
            <div>
              <div className={`font-semibold text-sm ${theme.primary}`} dir={lang === "ar" ? "rtl" : undefined}>
                {lang === "ar" ? selected.arabicName : selected.name}
              </div>
              <div className={`text-xs ${theme.muted}`} dir={lang === "en" ? "rtl" : undefined}>
                {lang === "ar" ? selected.name : selected.arabicName}
              </div>
            </div>
          </div>
        ) : (
          <span className={theme.muted}>{tr("selectReciter")}</span>
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
          <div className="p-3">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={tr("searchReciter")}
              className={`w-full px-3 py-2 text-sm focus:outline-none ${theme.dropSearch}`}
            />
          </div>
          <ul className="max-h-64 overflow-y-auto">
            {results.length === 0 ? (
              <li className={`px-4 py-3 text-sm text-center ${theme.muted}`}>{tr("noReciters")}</li>
            ) : (
              results.map((reciter) => (
                <li key={reciter.id}>
                  <button
                    type="button"
                    onClick={() => select(reciter)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-start transition-colors ${
                      reciter.id === value ? theme.dropItemActive : theme.dropItem
                    }`}
                  >
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-md flex-shrink-0 ${theme.reciterStyle[reciter.style] ?? theme.dropNum}`}>
                      {styleLabel(reciter.style)}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className={`font-medium text-sm ${theme.primary}`} dir={lang === "ar" ? "rtl" : undefined}>
                        {lang === "ar" ? reciter.arabicName : reciter.name}
                      </div>
                      <div className={`text-xs ${theme.muted}`} dir={lang === "en" ? "rtl" : undefined}>
                        {lang === "ar" ? reciter.name : reciter.arabicName}
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
