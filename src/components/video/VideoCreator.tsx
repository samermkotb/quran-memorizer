"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { PlayerState, Reciter, Surah } from "@/types";
import { useApp } from "@/contexts/AppContext";
import { formatTime } from "@/lib/audioUtils";
import { getSurahText, getSurahTranslation, useSurahText } from "@/lib/quranText";
import { BACKGROUNDS, DEFAULT_BACKGROUND_IDS, attributionLine } from "@/lib/video/backgrounds";
import { detectVideoSupport, VideoContainer, VideoSupport } from "@/lib/video/support";
import { createRenderSession, renderVideo, RenderProgress, RenderSession } from "@/lib/video/renderer";
import { VideoError, VideoErrorCode } from "@/lib/video/timeline";
import BackgroundPicker from "./BackgroundPicker";
import VideoExportProgress from "./VideoExportProgress";
import VideoShareButton from "./VideoShareButton";
import VideoCredits from "./VideoCredits";
import VideoDurationPanel from "./VideoDurationPanel";
import { useVideoDuration } from "./useVideoDuration";

interface Props {
  playerState: PlayerState;
  reciter: Reciter;
  surah: Surah;
  /** Changes the app's selected ayah range (clamped by the caller). */
  onRangeChange: (startAyah: number, endAyah: number) => void;
}

type Status = "idle" | "rendering" | "done" | "error" | "cancelled";

interface Result {
  blob: Blob;
  url: string;
  container: VideoContainer;
  duration: number;
  filename: string;
  backgroundIds: string[];
  skippedBackgrounds: boolean;
  translationMissing: boolean;
}

const ERROR_KEYS: Record<VideoErrorCode, string> = {
  unsupported: "videoUnsupported",
  "too-long": "videoErrTooLong",
  "audio-fetch": "videoErrAudio",
  "surah-unavailable": "videoErrSurah",
  "background-load": "videoErrBackground",
  "playback-blocked": "videoErrBlocked",
  recorder: "videoErrRecorder",
  cancelled: "videoCancelled",
};

function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function VideoCreator({ playerState, reciter, surah, onRangeChange }: Props) {
  const { theme, tr, lang } = useApp();
  const [open, setOpen] = useState(false);
  const [support, setSupport] = useState<VideoSupport | null>(null);
  const [selected, setSelected] = useState<string[]>(DEFAULT_BACKGROUND_IDS);
  const [status, setStatus] = useState<Status>("idle");
  const [progress, setProgress] = useState<RenderProgress | null>(null);
  const [errorKey, setErrorKey] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const resultUrlRef = useRef<string | null>(null);

  // Abort any render and free the result's memory when this unmounts.
  useEffect(
    () => () => {
      abortRef.current?.abort();
      if (resultUrlRef.current) URL.revokeObjectURL(resultUrlRef.current);
    },
    []
  );

  const fullSurah = reciter.source !== "everyayah";
  const rendering = status === "rendering";
  const { texts: surahTexts } = useSurahText(surah.number);
  const duration = useVideoDuration(playerState, reciter, surahTexts, open);
  // Refuse up front when the measured length is already over the cap; a rough
  // estimate alone never blocks (the renderer still enforces the cap).
  const blockedTooLong = Boolean(duration.estimate?.overLimit && duration.estimate.precision !== "estimate");
  const rangeLabel = fullSurah
    ? tr("wholeSurah")
    : playerState.startAyah === playerState.endAyah
      ? `${tr("ayah")} ${playerState.startAyah}`
      : `${tr("ayahsLabel")} ${playerState.startAyah}–${playerState.endAyah}`;
  const surahLabel = lang === "ar" ? surah.name : surah.englishName;
  const reciterLabel = lang === "ar" ? reciter.arabicName : reciter.name;

  const pauseLabel =
    playerState.pauseAfterAyah === -1
      ? tr("pauseMatch")
      : playerState.pauseAfterAyah === 0
        ? tr("pauseOff")
        : `${playerState.pauseAfterAyah}${tr("secs")}`;

  function openPanel() {
    setSupport(detectVideoSupport());
    setOpen(true);
  }

  function releaseResult() {
    if (resultUrlRef.current) URL.revokeObjectURL(resultUrlRef.current);
    resultUrlRef.current = null;
    setResult(null);
  }

  function handleCreate() {
    if (!support?.supported || selected.length === 0 || rendering || blockedTooLong) return;

    // Created synchronously in the tap so iOS allows audio playback.
    let session: RenderSession;
    try {
      session = createRenderSession();
    } catch {
      setErrorKey("videoUnsupported");
      setStatus("error");
      return;
    }

    const controller = new AbortController();
    abortRef.current = controller;
    releaseResult();
    setErrorKey(null);
    setProgress({ phase: "audio", done: 0, total: 0 });
    setStatus("rendering");

    const ps = playerState;
    const backgrounds = selected
      .map((id) => BACKGROUNDS.find((b) => b.id === id))
      .filter((b): b is (typeof BACKGROUNDS)[number] => Boolean(b));

    void (async () => {
      try {
        let ayahTexts: string[] = [];
        let ayahTranslations: string[] = [];
        if (!fullSurah) {
          // The translation is secondary: if it fails, the video shows the Arabic only.
          const translation = getSurahTranslation(ps.surahNumber).catch(() => [] as string[]);
          try {
            ayahTexts = await getSurahText(ps.surahNumber);
          } catch {
            setErrorKey("videoErrText");
            setStatus("error");
            return;
          }
          ayahTranslations = await translation;
          if (ayahTranslations.length !== ayahTexts.length) ayahTranslations = [];
        }
        const canvas = canvasRef.current;
        if (!canvas) throw new VideoError("unsupported");

        const out = await renderVideo({
          canvas,
          session,
          playerState: ps,
          reciter,
          surah,
          ayahTexts,
          ayahTranslations,
          backgrounds,
          mimeType: support.mimeType,
          signal: controller.signal,
          onProgress: setProgress,
        });

        const safeName = surah.englishName.replace(/[^a-zA-Z0-9-]+/g, "_");
        const range = fullSurah ? "full" : `${ps.startAyah}-${ps.endAyah}`;
        const url = URL.createObjectURL(out.blob);
        resultUrlRef.current = url;
        setResult({
          blob: out.blob,
          url,
          container: out.container,
          duration: out.duration,
          filename: `${safeName}_${range}_${reciter.id}.${out.container}`,
          backgroundIds: out.backgrounds.map((b) => b.id),
          skippedBackgrounds: out.skippedBackgrounds.length > 0,
          translationMissing: !fullSurah && ayahTranslations.length === 0,
        });
        setStatus("done");
      } catch (err) {
        const code: VideoErrorCode = err instanceof VideoError ? err.code : "recorder";
        if (code === "cancelled" || controller.signal.aborted) {
          setStatus("cancelled");
          setErrorKey("videoCancelled");
        } else {
          setStatus("error");
          setErrorKey(code === "too-long" && fullSurah ? "videoErrTooLongSurah" : ERROR_KEYS[code]);
        }
      } finally {
        session.dispose();
        if (abortRef.current === controller) abortRef.current = null;
      }
    })();
  }

  function handleCancel() {
    abortRef.current?.abort();
  }

  const resultBackgrounds = useMemo(
    () =>
      result
        ? result.backgroundIds
            .map((id) => BACKGROUNDS.find((b) => b.id === id))
            .filter((b): b is (typeof BACKGROUNDS)[number] => Boolean(b))
        : [],
    [result]
  );

  const shareTitle = `${surah.name} · ${surah.englishName}`;
  const ayahRangeText = fullSurah
    ? "سورة كاملة · Full surah"
    : playerState.startAyah === playerState.endAyah
      ? `الآية ${playerState.startAyah} · Ayah ${playerState.startAyah}`
      : `الآيات ${playerState.startAyah}–${playerState.endAyah} · Ayahs ${playerState.startAyah}–${playerState.endAyah}`;
  const ccByCredits = resultBackgrounds
    .filter((b) => b.credit.licenseKind === "cc-by-4.0")
    .map((b) => `Background: ${attributionLine(b.credit)} (${b.credit.sourceUrl})`);
  const shareText = [
    `سورة ${surah.name} (${surah.englishName}) — ${ayahRangeText}`,
    `${reciter.arabicName} · ${reciter.name}`,
    "فاستمعوا له",
    ...ccByCredits,
  ].join("\n");

  if (!open) {
    return (
      <button
        type="button"
        onClick={openPanel}
        className={`w-full flex items-center justify-center gap-2 px-4 py-3 font-medium text-sm transition-all duration-200 ${theme.roundCard} ${theme.btnSecondary}`}
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.55-2.28A1 1 0 0121 8.62v6.76a1 1 0 01-1.45.9L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
        {tr("createVideo")}
      </button>
    );
  }

  return (
    <section
      aria-labelledby="video-creator-title"
      className={`${theme.card} p-5 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 id="video-creator-title" className={`font-bold text-base ${theme.primary}`}>
            {tr("videoTitle")}
          </h2>
          <p className={`text-xs mt-1 ${theme.muted}`}>{tr("videoIntro")}</p>
        </div>
        <button
          type="button"
          onClick={() => {
            handleCancel();
            setOpen(false);
          }}
          aria-label={tr("videoClose")}
          className={`shrink-0 w-8 h-8 flex items-center justify-center rounded-full ${theme.btnStop}`}
        >
          ✕
        </button>
      </div>

      {/* Current selection summary */}
      <div>
        <div className={`text-xs mb-1.5 ${theme.muted}`}>{tr("videoUsesSelection")}</div>
        <div className="flex flex-wrap gap-1.5 text-xs">
          <span className={`px-2.5 py-1 rounded-full ${theme.chip1}`}>
            {surahLabel} · {rangeLabel}
          </span>
          <span className={`px-2.5 py-1 rounded-full ${theme.chip3}`}>{reciterLabel}</span>
          <span className={`px-2.5 py-1 rounded-full ${theme.chip3}`} dir="ltr">
            {playerState.speed}×
          </span>
          {!fullSurah && (
            <>
              <span className={`px-2.5 py-1 rounded-full ${theme.chip3}`}>
                {tr("repeat")} {playerState.infiniteRepeat ? 1 : playerState.repeatCount}×
              </span>
              <span className={`px-2.5 py-1 rounded-full ${theme.chip3}`}>
                {tr("pauseLabel")}: {pauseLabel}
              </span>
            </>
          )}
        </div>
        {fullSurah && <p className={`text-xs mt-2 ${theme.muted}`}>{tr("videoFullSurahNote")}</p>}
        {!fullSurah && playerState.infiniteRepeat && (
          <p className={`text-xs mt-2 ${theme.muted}`}>{tr("videoInfiniteNote")}</p>
        )}
      </div>

      {status !== "done" && (
        <VideoDurationPanel
          playerState={playerState}
          reciter={reciter}
          surah={surah}
          ayahTexts={surahTexts}
          duration={duration}
          disabled={rendering}
          onRangeChange={onRangeChange}
        />
      )}

      {support && !support.supported ? (
        <div className={`px-3 py-2 text-sm ${theme.errBox}`} role="alert">
          {tr("videoUnsupported")}
        </div>
      ) : (
        <>
          {status !== "done" && (
            <BackgroundPicker selected={selected} onChange={setSelected} disabled={rendering} />
          )}

          {/* The render canvas doubles as a live preview while recording. */}
          <div className={rendering ? "flex justify-center" : "hidden"}>
            <canvas
              ref={canvasRef}
              role="img"
              aria-label={tr("videoPreviewLabel")}
              className="w-40 sm:w-48 aspect-[9/16] rounded-[12px] shadow-card bg-ink-900"
            />
          </div>

          {rendering && <VideoExportProgress progress={progress} onCancel={handleCancel} />}

          {!rendering && status !== "done" && (
            <div className="space-y-2">
              <p className={`text-xs ${theme.muted}`}>{tr("videoRealtimeNote")}</p>
              {!fullSurah && <p className={`text-xs ${theme.muted}`}>{tr("videoTimingNote")}</p>}
              {selected.length === 0 && <p className={`text-xs ${theme.accent}`}>{tr("videoNoBackground")}</p>}
              <button
                type="button"
                onClick={handleCreate}
                disabled={selected.length === 0 || blockedTooLong}
                className={`w-full py-3.5 font-bold text-base rounded-2xl transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed ${theme.btnPrimary}`}
              >
                {tr("videoStart")}
              </button>
            </div>
          )}

          {(status === "error" || status === "cancelled") && errorKey && (
            <div
              className={`px-3 py-2 text-sm ${status === "error" ? theme.errBox : `${theme.ayahPreviewBox} ${theme.muted}`}`}
              role={status === "error" ? "alert" : "status"}
            >
              {tr(errorKey)}
            </div>
          )}

          {status === "done" && result && (
            <div className="space-y-4">
              <div className={`text-sm font-semibold ${theme.primary}`} role="status">
                ✓ {tr("videoDone")}
              </div>
              <video
                src={result.url}
                controls
                playsInline
                className="w-48 sm:w-56 mx-auto block aspect-[9/16] rounded-[12px] shadow-card bg-ink-900"
              />
              <dl className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className={`p-2 ${theme.roundCard} ${theme.chip3}`}>
                  <dt className={theme.muted}>{tr("videoFormat")}</dt>
                  <dd className={`font-semibold ${theme.primary}`} dir="ltr">
                    {result.container === "mp4" ? "MP4" : "WebM"}
                  </dd>
                </div>
                <div className={`p-2 ${theme.roundCard} ${theme.chip3}`}>
                  <dt className={theme.muted}>{tr("videoLength")}</dt>
                  <dd className={`font-semibold ${theme.primary}`} dir="ltr">
                    {formatTime(result.duration)}
                  </dd>
                </div>
                <div className={`p-2 ${theme.roundCard} ${theme.chip3}`}>
                  <dt className={theme.muted}>{tr("videoSize")}</dt>
                  <dd className={`font-semibold ${theme.primary}`} dir="ltr">
                    {formatBytes(result.blob.size)}
                  </dd>
                </div>
              </dl>
              {result.container === "webm" && <p className={`text-xs ${theme.accent}`}>{tr("videoWebmNote")}</p>}
              {result.skippedBackgrounds && <p className={`text-xs ${theme.accent}`}>{tr("videoBackgroundsSkipped")}</p>}
              {result.translationMissing && <p className={`text-xs ${theme.accent}`}>{tr("videoTranslationMissing")}</p>}

              <VideoShareButton
                blob={result.blob}
                filename={result.filename}
                shareTitle={shareTitle}
                shareText={shareText}
              />

              <button
                type="button"
                onClick={() => {
                  releaseResult();
                  setStatus("idle");
                }}
                className={`w-full px-4 py-2.5 text-sm font-medium ${theme.roundCard} ${theme.chip}`}
              >
                {tr("videoCreateAnother")}
              </button>
            </div>
          )}

          <VideoCredits inVideo={status === "done" ? resultBackgrounds : undefined} />
        </>
      )}
    </section>
  );
}
