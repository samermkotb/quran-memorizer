"use client";

import { useEffect, useState } from "react";
import { PlayerState, Reciter } from "@/types";
import { DurationEstimate, estimateVideoDuration } from "@/lib/video/durationEstimate";

export interface VideoDurationState {
  /** null while the first estimate for this selection is loading, or if it failed. */
  estimate: DurationEstimate | null;
  loading: boolean;
  failed: boolean;
}

/** Everything that changes the video's length. */
function selectionKey(ps: PlayerState, reciter: Reciter): string {
  return [ps.surahNumber, ps.startAyah, ps.endAyah, reciter.id, ps.speed, ps.repeatCount, ps.infiniteRepeat, ps.pauseAfterAyah].join("|");
}

/**
 * Predicted video length for the current selection, recalculated (debounced)
 * whenever the surah, range, reciter, speed, repeats or pause change. Audio
 * header lookups are cached in durationEstimate.ts, so revisiting a range is
 * instant.
 */
export function useVideoDuration(
  ps: PlayerState,
  reciter: Reciter,
  ayahTexts: string[] | null,
  /** Only measure while the video creator is open, so the player never triggers lookups. */
  enabled: boolean
): VideoDurationState {
  const key = selectionKey(ps, reciter);
  const [result, setResult] = useState<{ key: string; estimate: DurationEstimate | null } | null>(null);

  useEffect(() => {
    if (!enabled) return;
    let stale = false;
    const timer = setTimeout(() => {
      estimateVideoDuration(ps, reciter, ayahTexts ?? [], () => stale)
        .then((estimate) => {
          if (!stale) setResult({ key, estimate });
        })
        .catch(() => {
          if (!stale) setResult({ key, estimate: null });
        });
    }, 250);
    return () => {
      stale = true;
      clearTimeout(timer);
    };
  }, [enabled, key, ps, reciter, ayahTexts]);

  const current = result?.key === key ? result : null;
  return { estimate: current?.estimate ?? null, loading: !current, failed: Boolean(current && !current.estimate) };
}
