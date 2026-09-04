"use client";

import { useEffect, useRef, useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { useSurahText } from "@/lib/quranText";

interface Props {
  surahNumber: number;
  startAyah: number;
  endAyah: number;
  onSelectRange: (start: number, end: number) => void;
  readOnly?: boolean;
}

export default function MushafViewer({
  surahNumber,
  startAyah,
  endAyah,
  onSelectRange,
  readOnly = false,
}: Props) {
  const { theme, tr } = useApp();
  const [open, setOpen] = useState(false);
  const [pendingSelection, setPendingSelection] = useState<{
    surahNumber: number;
    ayahNumber: number;
  } | null>(null);
  const rowRefs = useRef<Record<number, HTMLElement | null>>({});
  const { texts, loading, error } = useSurahText(surahNumber);
  const pendingStart =
    pendingSelection?.surahNumber === surahNumber ? pendingSelection.ayahNumber : null;

  useEffect(() => {
    if (open && texts) {
      rowRefs.current[startAyah]?.scrollIntoView({ block: "nearest" });
    }
  }, [open, startAyah, texts]);

  function toggleOpen() {
    if (open) setPendingSelection(null);
    setOpen(!open);
  }

  function selectAyah(ayahNumber: number) {
    if (pendingStart === null) {
      onSelectRange(ayahNumber, ayahNumber);
      setPendingSelection({ surahNumber, ayahNumber });
      return;
    }

    const lo = Math.min(pendingStart, ayahNumber);
    const hi = Math.max(pendingStart, ayahNumber);
    onSelectRange(lo, hi);
    setPendingSelection(null);
  }

  function rowContent(ayahText: string, ayahNumber: number) {
    const isStart = ayahNumber === startAyah;
    const isEnd = ayahNumber === endAyah;
    const isBoundary = isStart || isEnd;

    return (
      <>
        <span className="flex flex-shrink-0 items-center gap-1.5">
          <span
            className={`min-w-8 rounded-full px-2 py-1 text-center text-xs font-bold ${
              isBoundary ? theme.mushafBoundaryBadge : theme.dropNum
            }`}
          >
            {ayahNumber}
          </span>
          {startAyah !== endAyah && isBoundary && (
            <span className={`text-[11px] font-semibold ${theme.ayahPreviewLabel}`}>
              {isStart ? tr("startBadge") : tr("endBadge")}
            </span>
          )}
        </span>
        <span
          dir="rtl"
          className={`min-w-0 flex-1 break-words text-start text-base leading-loose ${theme.ayahPreviewText}`}
        >
          {ayahText}
        </span>
      </>
    );
  }

  return (
    <div className="min-w-0">
      <button
        type="button"
        onClick={toggleOpen}
        aria-expanded={open}
        aria-controls="mushaf-ayah-list"
        className={`min-h-11 text-sm font-medium ${theme.footerLink}`}
      >
        {open ? tr("hideMushaf") : tr("viewInMushaf")}
      </button>

      {open && (
        <div
          id="mushaf-ayah-list"
          className={`max-h-[50vh] min-w-0 overflow-x-hidden overflow-y-auto ${theme.dropdown}`}
        >
          {loading ? (
            <p className={`px-4 py-3 text-sm ${theme.ayahPreviewLabel}`}>
              {tr("loadingAyahText")}
            </p>
          ) : error || !texts ? (
            <p className={`px-4 py-3 text-sm ${theme.ayahPreviewLabel}`}>
              {tr("ayahTextUnavailable")}
            </p>
          ) : (
            <>
              <p className={`px-4 py-3 text-xs ${theme.muted}`}>
                {readOnly
                  ? tr("mushafReadOnlyNote")
                  : tr(pendingStart === null ? "tapToSetStart" : "tapToSetEnd")}
              </p>
              <div>
                {texts.map((ayahText, index) => {
                  const ayahNumber = index + 1;
                  const isBoundary = ayahNumber === startAyah || ayahNumber === endAyah;
                  const isInRange = ayahNumber >= startAyah && ayahNumber <= endAyah;
                  const rowClass = isBoundary
                    ? theme.mushafRowBoundary
                    : isInRange
                      ? theme.mushafRowInRange
                      : readOnly
                        ? theme.primary
                        : theme.dropItem;
                  const commonClass = `w-full min-w-0 items-start gap-3 px-3 py-3 text-start ${rowClass}`;

                  return readOnly ? (
                    <div
                      key={ayahNumber}
                      ref={(element) => {
                        rowRefs.current[ayahNumber] = element;
                      }}
                      className={`flex cursor-default ${commonClass}`}
                    >
                      {rowContent(ayahText, ayahNumber)}
                    </div>
                  ) : (
                    <button
                      key={ayahNumber}
                      ref={(element) => {
                        rowRefs.current[ayahNumber] = element;
                      }}
                      type="button"
                      aria-pressed={isBoundary}
                      onClick={() => selectAyah(ayahNumber)}
                      className={`flex transition-colors ${commonClass}`}
                    >
                      {rowContent(ayahText, ayahNumber)}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
