"use client";

import { useState, useRef, useEffect } from "react";
import { RECITERS } from "@/lib/reciters";
import { Reciter } from "@/types";

interface Props {
  value: string;
  onChange: (reciter: Reciter) => void;
}

const STYLE_COLORS: Record<string, string> = {
  Murattal: "bg-blue-50 text-blue-600",
  Mujawwad: "bg-purple-50 text-purple-600",
  Muallim: "bg-orange-50 text-orange-600",
};

export default function ReciterSelector({ value, onChange }: Props) {
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
        className="w-full flex items-center justify-between px-4 py-3 bg-white border-2 border-emerald-200 rounded-xl text-left hover:border-emerald-400 focus:outline-none focus:border-emerald-500 transition-colors"
      >
        {selected ? (
          <div className="flex items-center gap-3">
            <span className={`text-xs font-semibold px-2 py-1 rounded-lg ${STYLE_COLORS[selected.style]}`}>
              {selected.style}
            </span>
            <div>
              <div className="font-semibold text-gray-800 text-sm">{selected.name}</div>
              <div className="text-xs text-gray-500" dir="rtl">{selected.arabicName}</div>
            </div>
          </div>
        ) : (
          <span className="text-gray-400">Select a reciter...</span>
        )}
        <svg className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform ${open ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
              placeholder="Search reciter..."
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-emerald-400"
            />
          </div>
          <ul className="max-h-64 overflow-y-auto">
            {results.length === 0 ? (
              <li className="px-4 py-3 text-sm text-gray-400 text-center">No reciters found</li>
            ) : (
              results.map((reciter) => (
                <li key={reciter.id}>
                  <button
                    type="button"
                    onClick={() => select(reciter)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-emerald-50 transition-colors ${
                      reciter.id === value ? "bg-emerald-50" : ""
                    }`}
                  >
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-md flex-shrink-0 ${STYLE_COLORS[reciter.style]}`}>
                      {reciter.style}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm text-gray-800">{reciter.name}</div>
                      <div className="text-xs text-gray-400" dir="rtl">{reciter.arabicName}</div>
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
