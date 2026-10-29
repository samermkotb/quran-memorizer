"use client";

import { ReactNode, useState } from "react";
import { PlayerState, Reciter, Surah } from "@/types";
import { useApp } from "@/contexts/AppContext";
import { formatTime } from "@/lib/audioUtils";
import { endAyahForTarget } from "@/lib/video/durationEstimate";
import { MAX_VIDEO_SECONDS } from "@/lib/video/timeline";
import { toArabicDigits } from "@/lib/video/textLayout";
import { VideoDurationState } from "./useVideoDuration";

interface Props {
  playerState: PlayerState;
  reciter: Reciter;
  surah: Surah;
  ayahTexts: string[] | null;
  duration: VideoDurationState;
  disabled: boolean;
  onRangeChange: (startAyah: number, endAyah: number) => void;
}

const QUICK_TARGETS = [15, 30, 60];

/** "42 seconds" / "٤٢ ثانية", with Arabic number agreement. */
function secondsInWords(seconds: number, lang: "en" | "ar"): string {
  const n = Math.round(seconds);
  if (lang === "en") return n === 1 ? "1 second" : `${n} seconds`;
  if (n === 1) return "ثانية واحدة";
  if (n === 2) return "ثانيتان";
  if (n >= 3 && n <= 10) return `${toArabicDigits(n)} ثوانٍ`;
  return `${toArabicDigits(n)} ثانية`;
}

function clock(seconds: number, lang: "en" | "ar"): string {
  const value = formatTime(seconds);
  return lang === "ar" ? toArabicDigits(value) : value;
}

function Stepper({
  label,
  value,
  onDec,
  onInc,
  canDec,
  canInc,
  decLabel,
  incLabel,
  disabled,
}: {
  label: string;
  value: number;
  onDec: () => void;
  onInc: () => void;
  canDec: boolean;
  canInc: boolean;
  decLabel: string;
  incLabel: string;
  disabled: boolean;
}) {
  const { theme } = useApp();
  const btn = `w-9 h-9 shrink-0 flex items-center justify-center rounded-full text-lg font-bold leading-none transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${theme.chip}`;
  return (
    <div className="flex-1 min-w-0">
      <div className={`text-xs mb-1 ${theme.muted}`}>{label}</div>
      <div className="flex items-center gap-2">
        <button type="button" onClick={onDec} disabled={disabled || !canDec} aria-label={decLabel} className={btn}>
          −
        </button>
        <span className={`min-w-8 text-center font-bold tabular-nums ${theme.primary}`} aria-live="polite">
          {value}
        </span>
        <button type="button" onClick={onInc} disabled={disabled || !canInc} aria-label={incLabel} className={btn}>
          +
        </button>
      </div>
    </div>
  );
}

/**
 * Shows the predicted video length before rendering, with −/+ controls on the
 * ayah range and quick length targets. Ayah limits always stay within the surah.
 */
export default function VideoDurationPanel({
  playerState: ps,
  reciter,
  surah,
  ayahTexts,
  duration,
  disabled,
  onRangeChange,
}: Props) {
  const { theme, tr, lang } = useApp();
  const [targeting, setTargeting] = useState<number | null>(null);
  const fullSurah = reciter.source !== "everyayah";
  const { estimate, loading, failed } = duration;
  const max = surah.numberOfAyahs;

  async function pickTarget(target: number) {
    setTargeting(target);
    try {
      const end = await endAyahForTarget(ps, reciter, max, ayahTexts ?? [], target);
      onRangeChange(ps.startAyah, Math.max(ps.startAyah, Math.min(end, max)));
    } finally {
      setTargeting(null);
    }
  }

  let headline: ReactNode;
  let detail: string;
  if (loading) {
    headline = <span className={`text-sm ${theme.muted}`}>{tr("videoEstCalculating")}</span>;
    detail = "";
  } else if (failed || !estimate) {
    headline = <span className={`text-sm ${theme.muted}`}>{tr("videoEstUnavailable")}</span>;
    detail = "";
  } else if (estimate.overLimit) {
    headline = (
      <span className={`text-lg font-bold ${theme.accent}`}>
        <bdi dir="ltr">&gt; {clock(MAX_VIDEO_SECONDS, lang)}</bdi>
      </span>
    );
    detail = tr("videoEstOverLimit");
  } else {
    const approx = estimate.precision !== "exact" ? "≈ " : "";
    headline = (
      <span className={`text-lg font-bold ${theme.primary}`}>
        <bdi dir="ltr">
          {approx}
          {clock(estimate.total, lang)}
        </bdi>
        <span className={`text-sm font-medium ${theme.muted}`}>
          {" · "}
          {approx}
          {secondsInWords(estimate.total, lang)}
        </span>
      </span>
    );
    detail =
      estimate.precision === "exact"
        ? tr("videoEstExact")
        : estimate.precision === "approx"
          ? tr("videoEstApprox")
          : tr("videoEstEstimate");
  }

  return (
    <div className={`p-3 space-y-3 ${theme.roundCard} ${theme.ayahPreviewBox}`}>
      <div aria-live="polite" aria-busy={loading}>
        <div className={`text-xs ${theme.label}`}>{tr("videoEstLength")}</div>
        <div className="mt-0.5">{headline}</div>
        {detail && <p className={`text-xs mt-1 ${estimate?.overLimit ? theme.accent : theme.muted}`}>{detail}</p>}
        {!loading && estimate && !estimate.overLimit && (
          <p className={`text-xs mt-0.5 ${theme.muted}`}>{tr("videoEstIncludes")}</p>
        )}
      </div>

      {!fullSurah && (
        <>
          <div role="group" aria-label={tr("videoRangeAdjust")} className="flex gap-4">
            <Stepper
              label={tr("fromAyah")}
              value={ps.startAyah}
              onDec={() => onRangeChange(ps.startAyah - 1, ps.endAyah)}
              onInc={() => onRangeChange(ps.startAyah + 1, ps.endAyah)}
              canDec={ps.startAyah > 1}
              canInc={ps.startAyah < ps.endAyah}
              decLabel={tr("videoStartEarlier")}
              incLabel={tr("videoStartLater")}
              disabled={disabled}
            />
            <Stepper
              label={tr("toAyah")}
              value={ps.endAyah}
              onDec={() => onRangeChange(ps.startAyah, ps.endAyah - 1)}
              onInc={() => onRangeChange(ps.startAyah, ps.endAyah + 1)}
              canDec={ps.endAyah > ps.startAyah}
              canInc={ps.endAyah < max}
              decLabel={tr("videoEndEarlier")}
              incLabel={tr("videoEndLater")}
              disabled={disabled}
            />
          </div>

          <div>
            <div className={`text-xs mb-1 ${theme.muted}`}>{tr("videoQuickLength")}</div>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_TARGETS.map((target) => (
                <button
                  key={target}
                  type="button"
                  disabled={disabled || targeting !== null}
                  onClick={() => void pickTarget(target)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-colors disabled:opacity-50 ${theme.chip}`}
                >
                  <bdi>
                    {tr("videoQuickTarget").replace("{n}", lang === "ar" ? toArabicDigits(target) : String(target))}
                  </bdi>
                  {targeting === target && " …"}
                </button>
              ))}
            </div>
            <p className={`text-xs mt-1 ${theme.muted}`}>{tr("videoQuickHint")}</p>
          </div>
        </>
      )}
    </div>
  );
}
