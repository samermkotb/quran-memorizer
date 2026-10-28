"use client";

import { RenderProgress } from "@/lib/video/renderer";
import { formatTime } from "@/lib/audioUtils";
import { useApp } from "@/contexts/AppContext";

interface Props {
  progress: RenderProgress | null;
  onCancel: () => void;
}

export default function VideoExportProgress({ progress, onCancel }: Props) {
  const { theme, tr } = useApp();

  let label = tr("videoPhaseAudio");
  let fraction: number | null = null;
  let detail = "";
  let paused = false;

  if (progress?.phase === "audio") {
    label = tr("videoPhaseAudio");
    if (progress.total > 0) {
      fraction = progress.done / progress.total;
      detail = `${progress.done}/${progress.total}`;
    }
  } else if (progress?.phase === "backgrounds") {
    label = tr("videoPhaseBackgrounds");
    if (progress.total > 0) {
      fraction = progress.done / progress.total;
      detail = `${progress.done}/${progress.total}`;
    }
  } else if (progress?.phase === "recording") {
    label = tr("videoPhaseRecording");
    fraction = Math.min(1, progress.elapsed / progress.total);
    detail = `${formatTime(progress.elapsed)} / ${formatTime(progress.total)}`;
    paused = progress.paused;
  } else if (progress?.phase === "finalizing") {
    label = tr("videoPhaseFinalizing");
    fraction = 1;
  }

  const percent = fraction === null ? undefined : Math.round(fraction * 100);

  return (
    <div className="space-y-3" aria-live="polite">
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className={`font-semibold ${theme.primary}`}>{label}</span>
        <span className={`tabular-nums ${theme.muted}`} dir="ltr">
          {detail}
          {percent !== undefined && progress?.phase === "recording" ? ` · ${percent}%` : ""}
        </span>
      </div>
      <div
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
        className={`h-2 w-full rounded-full overflow-hidden ${theme.pbBg}`}
      >
        <div
          className={`h-full rounded-full transition-[width] duration-300 ${theme.pbFill} ${fraction === null ? "w-1/3 animate-pulse" : ""}`}
          style={fraction === null ? undefined : { width: `${Math.max(2, fraction * 100)}%` }}
        />
      </div>

      {paused ? (
        <div className={`px-3 py-2 text-sm ${theme.pauseBanner}`}>
          <span className={theme.pauseText}>{tr("videoPausedHidden")}</span>
        </div>
      ) : (
        <p className={`text-xs ${theme.muted}`}>{tr("videoKeepOpen")}</p>
      )}

      <button
        type="button"
        onClick={onCancel}
        className={`w-full px-4 py-2.5 text-sm font-medium transition-colors ${theme.roundCard} ${theme.btnSecondary}`}
      >
        {tr("videoCancel")}
      </button>
    </div>
  );
}
