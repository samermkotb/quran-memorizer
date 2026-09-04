"use client";

import { useEffect, useSyncExternalStore } from "react";

// Arabic Quran text: Uthmani Hafs script (the standard King Fahd Quran Complex
// text — https://qurancomplex.gov.sa/), sourced from the "ara-quranuthmanihaf"
// edition of fawazahmed0/quran-api (public domain / Unlicense —
// https://github.com/fawazahmed0/quran-api). All 6,236 verses were fetched
// once and their per-surah counts cross-checked against src/lib/surahData.ts
// (0 mismatches across all 114 surahs) before being bundled into this repo.
//
// Bundled locally as 114 static files under /public/quran-text/{surah}.json —
// each a JSON array of ayah strings for that surah (index 0 = ayah 1) — so
// there are no external network calls at runtime, only same-origin static
// asset fetches, cached in memory per surah for the session.

interface SurahTextEntry {
  texts: string[] | null;
  loading: boolean;
  error: boolean;
}

const LOADING_ENTRY: SurahTextEntry = { texts: null, loading: true, error: false };

const cache = new Map<number, string[]>();
const inflight = new Map<number, Promise<string[]>>();
const entries = new Map<number, SurahTextEntry>();
const listeners = new Set<() => void>();

function subscribe(onStoreChange: () => void): () => void {
  listeners.add(onStoreChange);
  return () => listeners.delete(onStoreChange);
}

function setEntry(surahNumber: number, entry: SurahTextEntry) {
  entries.set(surahNumber, entry);
  for (const listener of listeners) listener();
}

export function getSurahText(surahNumber: number): Promise<string[]> {
  const cached = cache.get(surahNumber);
  if (cached) return Promise.resolve(cached);
  const pending = inflight.get(surahNumber);
  if (pending) return pending;

  const promise = fetch(`/quran-text/${String(surahNumber).padStart(3, "0")}.json`)
    .then((res) => {
      if (!res.ok) throw new Error(`Failed to load surah text (HTTP ${res.status})`);
      return res.json() as Promise<string[]>;
    })
    .then((texts) => {
      cache.set(surahNumber, texts);
      inflight.delete(surahNumber);
      setEntry(surahNumber, { texts, loading: false, error: false });
      return texts;
    })
    .catch((err) => {
      inflight.delete(surahNumber);
      setEntry(surahNumber, { texts: null, loading: false, error: true });
      throw err;
    });

  inflight.set(surahNumber, promise);
  return promise;
}

export function getAyahText(texts: string[], ayahNumber: number): string | undefined {
  return texts[ayahNumber - 1];
}

/** First few words of an ayah, for a compact preview. */
export function truncateAyah(text: string, maxWords = 8): string {
  const words = text.trim().split(/\s+/);
  if (words.length <= maxWords) return text;
  return `${words.slice(0, maxWords).join(" ")} …`;
}

/**
 * Loads (and caches) the full Arabic text for a surah. Fetching happens
 * outside React (via the module-level cache), and this hook subscribes to
 * it with useSyncExternalStore rather than mirroring it into local state
 * from inside an effect.
 */
export function useSurahText(surahNumber: number): SurahTextEntry {
  useEffect(() => {
    getSurahText(surahNumber).catch(() => {
      // error state is already recorded via setEntry inside getSurahText
    });
  }, [surahNumber]);

  return useSyncExternalStore(
    subscribe,
    () => entries.get(surahNumber) ?? LOADING_ENTRY,
    () => LOADING_ENTRY
  );
}
