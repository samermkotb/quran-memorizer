"use client";

import { useApp } from "@/contexts/AppContext";
import { getAyahText, truncateAyah, useSurahText } from "@/lib/quranText";

interface Props {
  surahNumber: number;
  ayahNumber: number;
}

export default function AyahPreview({ surahNumber, ayahNumber }: Props) {
  const { theme, tr } = useApp();
  const { texts, loading, error } = useSurahText(surahNumber);
  const ayahText = texts ? getAyahText(texts, ayahNumber) : undefined;

  return (
    <div className={`mt-2 min-w-0 px-3 py-2 ${theme.ayahPreviewBox}`}>
      {loading ? (
        <p className={`text-xs ${theme.ayahPreviewLabel}`}>{tr("loadingAyahText")}</p>
      ) : error || !ayahText ? (
        <p className={`text-xs ${theme.ayahPreviewLabel}`}>{tr("ayahTextUnavailable")}</p>
      ) : (
        <p
          dir="rtl"
          className={`text-sm leading-relaxed text-start break-words ${theme.ayahPreviewText}`}
        >
          ﴿ {truncateAyah(ayahText)} ﴾
        </p>
      )}
    </div>
  );
}
