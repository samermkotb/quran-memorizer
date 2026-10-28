"use client";

import { useMemo, useState } from "react";
import { canShareFiles } from "@/lib/video/support";
import { useApp } from "@/contexts/AppContext";

interface Props {
  blob: Blob;
  filename: string;
  shareTitle: string;
  shareText: string;
  /** Shorter, personal text for "Send as Message". */
  messageText: string;
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 30_000);
}

/**
 * Share / Save / Send-as-message for a rendered video. Sharing uses the Web
 * Share API with files, which opens the OS share sheet; the user chooses the
 * destination app there. There is deliberately no "post to X" button: browsers
 * can't publish directly to WhatsApp Status, Snapchat Story, or Facebook Story.
 */
export default function VideoShareButton({ blob, filename, shareTitle, shareText, messageText }: Props) {
  const { theme, tr } = useApp();
  const [notice, setNotice] = useState<string | null>(null);
  const file = useMemo(() => new File([blob], filename, { type: blob.type }), [blob, filename]);
  const fileShareSupported = useMemo(() => canShareFiles(file), [file]);

  // navigator.share must be called straight from the tap (no awaits first), or
  // Safari drops the user activation and rejects the request.
  function share(text: string) {
    setNotice(null);
    if (!fileShareSupported) {
      downloadBlob(blob, filename);
      setNotice(tr("videoShareUnsupported"));
      return;
    }
    navigator.share({ files: [file], title: shareTitle, text }).catch((err: unknown) => {
      const name = (err as { name?: string })?.name;
      if (name === "AbortError") return; // user closed the sheet
      downloadBlob(blob, filename);
      setNotice(tr("videoShareUnsupported"));
    });
  }

  function save() {
    downloadBlob(blob, filename);
    setNotice(tr("videoSaved"));
  }

  const btn = `w-full flex items-center justify-center gap-2 px-4 py-3 font-medium text-sm transition-all duration-200 ${theme.roundCard}`;

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <button type="button" onClick={() => share(shareText)} className={`${btn} ${theme.btnPrimary}`}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 12v7a2 2 0 002 2h12a2 2 0 002-2v-7M16 6l-4-4-4 4M12 2v14" />
          </svg>
          {tr("videoShare")}
        </button>
        <button type="button" onClick={save} className={`${btn} ${theme.btnSecondary}`}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3" />
          </svg>
          {tr("videoSave")}
        </button>
        <button type="button" onClick={() => share(messageText)} className={`${btn} ${theme.btnSecondary}`}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h8M8 14h5M21 12a9 9 0 01-13.5 7.8L3 21l1.2-4.5A9 9 0 1121 12z" />
          </svg>
          {tr("videoSendMessage")}
        </button>
      </div>

      {notice && (
        <p className={`text-xs text-center ${theme.muted}`} role="status">
          {notice}
        </p>
      )}

      <div className={`p-3 space-y-1.5 text-xs ${theme.ayahPreviewBox}`}>
        <p className={theme.primary}>{tr("videoShareSheetNote")}</p>
        <p className={theme.muted}>{tr("videoStoryLengthNote")}</p>
        <p className={theme.muted}>{tr("videoSaveHint")}</p>
      </div>
    </div>
  );
}
