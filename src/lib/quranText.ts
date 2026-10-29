"use client";

import { useEffect, useSyncExternalStore } from "react";
import { arabicUnits } from "@/lib/video/passages";

// Arabic Quran text: Tanzil Quran Text (Uthmani, version 1.1), the Madina
// Mushaf (Hafs ʿan ʿĀṣim) text published by the Tanzil Project under CC BY 3.0
// with the condition that it is copied verbatim — https://tanzil.net. It was
// downloaded in its XML form (which keeps the Basmala separate from ayah 1),
// written out unchanged by scripts/build-quran-data.py, and cross-checked
// letter-by-letter against the King Fahd Complex (QPC) Hafs text: all 6,236
// ayahs match. The license notice ships next to the data in
// public/quran-text/LICENSE.txt. See docs/QURAN-TEXT-SOURCES.md.
//
// English translation: Marmaduke Pickthall, "The Meaning of the Glorious Koran"
// (1930), public domain, digital text from Tanzil (en.pickthall), copied
// verbatim and cross-checked against a second copy.
//
// Both are bundled as 114 static files per text — JSON arrays of ayah strings
// (index 0 = ayah 1) — so there are no external network calls at runtime, only
// same-origin static asset fetches, cached in memory per surah for the session.

export interface SurahTextEntry {
  texts: string[] | null;
  loading: boolean;
  error: boolean;
}

const LOADING_ENTRY: SurahTextEntry = { texts: null, loading: true, error: false };

function createSurahStore(dir: string, label: string) {
  const cache = new Map<number, string[]>();
  const inflight = new Map<number, Promise<string[]>>();
  const entries = new Map<number, SurahTextEntry>();
  const listeners = new Set<() => void>();

  const subscribe = (onStoreChange: () => void) => {
    listeners.add(onStoreChange);
    return () => {
      listeners.delete(onStoreChange);
    };
  };

  const setEntry = (surahNumber: number, entry: SurahTextEntry) => {
    entries.set(surahNumber, entry);
    for (const listener of listeners) listener();
  };

  const load = (surahNumber: number): Promise<string[]> => {
    const cached = cache.get(surahNumber);
    if (cached) return Promise.resolve(cached);
    const pending = inflight.get(surahNumber);
    if (pending) return pending;

    const promise = fetch(`/${dir}/${String(surahNumber).padStart(3, "0")}.json`)
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load surah ${label} (HTTP ${res.status})`);
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
  };

  /**
   * Loads (and caches) a surah. Fetching happens outside React (via the
   * module-level cache), and this hook subscribes to it with
   * useSyncExternalStore rather than mirroring it into local state from
   * inside an effect.
   */
  const useSurah = (surahNumber: number): SurahTextEntry => {
    useEffect(() => {
      load(surahNumber).catch(() => {
        // error state is already recorded via setEntry inside load
      });
    }, [surahNumber]);

    return useSyncExternalStore(
      subscribe,
      () => entries.get(surahNumber) ?? LOADING_ENTRY,
      () => LOADING_ENTRY
    );
  };

  return { load, useSurah };
}

const arabicStore = createSurahStore("quran-text", "text");
const englishStore = createSurahStore("quran-translation/en-pickthall", "translation");

export const getSurahText = arabicStore.load;
export const useSurahText = arabicStore.useSurah;
/** Pickthall's English translation for a surah (index 0 = ayah 1). */
export const getSurahTranslation = englishStore.load;

export function getAyahText(texts: string[], ayahNumber: number): string | undefined {
  return texts[ayahNumber - 1];
}

/**
 * First few words of an ayah, for a compact preview. Pause marks stay with
 * their word, so the preview never ends on a stranded mark.
 */
export function truncateAyah(text: string, maxWords = 8): string {
  const words = arabicUnits(text);
  if (words.length <= maxWords) return text;
  return `${words.slice(0, maxWords).join(" ")} …`;
}
