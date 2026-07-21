"use client";

import { useState } from "react";
import { PlayerState, Reciter } from "@/types";
import { getDownloadPlan, executeDownloadPlan } from "@/lib/audioUtils";
import { useApp } from "@/contexts/AppContext";

interface Props {
  playerState: PlayerState;
  reciter: Reciter;
  surahEnglishName: string;
  numberOfAyahs: number;
}

export default function DownloadButton({ playerState, reciter, surahEnglishName, numberOfAyahs }: Props) {
  const { theme, tr } = useApp();
  const [status, setStatus] = useState<"idle" | "preparing" | "error">("idle");
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);

  const plan = getDownloadPlan(
    reciter,
    playerState.surahNumber,
    surahEnglishName,
    playerState.startAyah,
    playerState.endAyah,
    numberOfAyahs
  );

  const isRange = playerState.startAyah !== playerState.endAyah;
  const rangeLimitedNote = reciter.source === "mp3quran" && isRange && plan.kind === "single-file";

  async function handleDownload() {
    if (plan.kind === "unavailable" || status === "preparing") return;
    setStatus("preparing");
    setProgress(plan.kind === "zip" ? { done: 0, total: plan.urls.length } : null);
    try {
      await executeDownloadPlan(plan, (done, total) => setProgress({ done, total }));
      setStatus("idle");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="space-y-2">
      <button
        onClick={handleDownload}
        disabled={plan.kind === "unavailable" || status === "preparing"}
        className={`w-full flex items-center justify-center gap-2 px-4 py-3 font-medium text-sm transition-all duration-200 ${theme.roundCard} ${theme.btnSecondary} disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {status === "preparing" ? (
          <>
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
            {progress ? `${tr("preparingDownload")} ${progress.done}/${progress.total}` : tr("preparingDownload")}
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3" />
            </svg>
            {plan.kind === "zip" ? tr("downloadRangeZip") : tr("downloadAudio")}
          </>
        )}
      </button>

      {plan.kind === "unavailable" && (
        <p className={`text-xs text-center ${theme.muted}`}>
          {plan.reason === "surah-missing" ? tr("downloadUnavailableSurah") : tr("downloadUnavailableSource")}
        </p>
      )}

      {rangeLimitedNote && status !== "error" && (
        <p className={`text-xs text-center ${theme.muted}`}>{tr("downloadRangeLimitedNote")}</p>
      )}

      {status === "error" && (
        <div className={`px-3 py-2 text-sm text-center ${theme.errBox}`}>{tr("downloadError")}</div>
      )}
    </div>
  );
}
