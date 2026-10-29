// Real-time, fully client-side Quran video renderer.
//
//   canvas (720×1280, drawn every animation frame) ─ captureStream(30) ─┐
//                                                                       ├─ MediaRecorder → Blob
//   <audio> (blob: URLs) → MediaElementSource → MediaStreamDestination ─┘
//                                            └→ speakers (so the user hears progress)
//
// The <audio> element (not AudioBufferSourceNode) plays the recitation, so
// `playbackRate` keeps pitch (preservesPitch) and speed changes don't distort
// the reciter's voice. Rendering runs in real time: a 2-minute video takes
// about 2 minutes.

import { PlayerState, Reciter, Surah } from "@/types";
import { createSilentAudioUrl } from "@/lib/audioUtils";
import { Background, getBackground, VideoBackground } from "./backgrounds";
import { drawProceduralScene } from "./proceduralScenes";
import { passageIndexAt, planPassages, Passage } from "./passages";
import {
  arabicFont,
  englishFont,
  layoutPassage,
  PassageLayout,
  resolveFontFamily,
  toArabicDigits,
} from "./textLayout";
import { getAudioContextCtor, sniffContainer, containerFromMime, VideoContainer } from "./support";
import { buildTimeline, prepareAudio, Segment, VideoError, VideoTimeline } from "./timeline";

export const VIDEO_WIDTH = 720;
export const VIDEO_HEIGHT = 1280;
const FPS = 30;
const VIDEO_BITRATE = 2_000_000;
const AUDIO_BITRATE = 128_000;

// ── Session: must be created synchronously inside the user's tap ────────────

export interface RenderSession {
  ctx: AudioContext;
  audio: HTMLAudioElement;
  dest: MediaStreamAudioDestinationNode;
  dispose(): void;
}

function setPreservesPitch(audio: HTMLAudioElement) {
  const a = audio as HTMLAudioElement & { webkitPreservesPitch?: boolean; mozPreservesPitch?: boolean };
  a.preservesPitch = true;
  a.webkitPreservesPitch = true;
  a.mozPreservesPitch = true;
}

/**
 * Creates and unlocks the audio graph. Call this directly in the click handler,
 * before any await: iOS Safari only allows AudioContext.resume() and
 * HTMLMediaElement.play() during a user gesture. The same element is reused for
 * every clip afterwards.
 */
export function createRenderSession(): RenderSession {
  const AC = getAudioContextCtor();
  if (!AC) throw new VideoError("unsupported");
  const ctx = new AC();
  void ctx.resume().catch(() => {});

  const audio = new Audio();
  audio.preload = "auto";
  setPreservesPitch(audio);
  const silentUrl = createSilentAudioUrl(0.2);
  audio.src = silentUrl;

  const source = ctx.createMediaElementSource(audio);
  const dest = ctx.createMediaStreamDestination();
  source.connect(dest);
  source.connect(ctx.destination);
  void audio.play().then(() => audio.pause()).catch(() => {});

  return {
    ctx,
    audio,
    dest,
    dispose() {
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
      URL.revokeObjectURL(silentUrl);
      void ctx.close().catch(() => {});
    },
  };
}

// ── Public API ──────────────────────────────────────────────────────────────

export type RenderProgress =
  | { phase: "audio"; done: number; total: number }
  | { phase: "backgrounds"; done: number; total: number }
  | { phase: "recording"; elapsed: number; total: number; paused: boolean }
  | { phase: "finalizing" };

export interface RenderInput {
  canvas: HTMLCanvasElement;
  session: RenderSession;
  playerState: PlayerState;
  reciter: Reciter;
  surah: Surah;
  /** Arabic ayah texts for the whole surah (index 0 = ayah 1). */
  ayahTexts: string[];
  /** English translation for the whole surah (index 0 = ayah 1), or [] to show Arabic only. */
  ayahTranslations: string[];
  backgrounds: Background[];
  mimeType: string;
  signal: AbortSignal;
  onProgress: (p: RenderProgress) => void;
}

export interface RenderResult {
  blob: Blob;
  container: VideoContainer;
  duration: number;
  /** The backgrounds that actually appear in the video, in order. */
  backgrounds: Background[];
  /** Ids of selected backgrounds that failed to load and were left out. */
  skippedBackgrounds: string[];
}

/** Used only if every selected video background fails to load. */
const FALLBACK_BACKGROUND_ID = "geometric";
const BACKGROUND_TIMEOUT_MS = 25_000;

// ── Helpers ─────────────────────────────────────────────────────────────────

class Clock {
  private acc = 0;
  private startedAt: number | null = null;
  start() {
    if (this.startedAt === null) this.startedAt = performance.now();
  }
  pause() {
    if (this.startedAt !== null) {
      this.acc += performance.now() - this.startedAt;
      this.startedAt = null;
    }
  }
  get running() {
    return this.startedAt !== null;
  }
  get elapsed() {
    const live = this.startedAt === null ? 0 : performance.now() - this.startedAt;
    return (this.acc + live) / 1000;
  }
}

function throwIfAborted(signal: AbortSignal) {
  if (signal.aborted) throw new VideoError("cancelled");
}

/**
 * Loads the selected background videos. A clip that errors or times out is
 * left out (and reported) instead of failing the whole render.
 */
async function loadBackgroundVideos(
  backgrounds: Background[],
  host: HTMLElement,
  signal: AbortSignal,
  onProgress: (done: number, total: number) => void
): Promise<{ videos: Map<string, HTMLVideoElement>; failed: string[] }> {
  const videos = new Map<string, HTMLVideoElement>();
  const failed: string[] = [];
  const list = backgrounds.filter((b): b is VideoBackground => b.kind === "video");
  let done = 0;
  onProgress(0, list.length);
  await Promise.all(
    list.map(
      (bg) =>
        new Promise<void>((resolve, reject) => {
          const v = document.createElement("video");
          v.muted = true;
          v.defaultMuted = true;
          v.loop = true;
          v.playsInline = true;
          v.setAttribute("playsinline", "");
          v.setAttribute("muted", "");
          v.preload = "auto";
          let settled = false;
          const onAbort = () => finish(new VideoError("cancelled"));
          const finish = (err?: VideoError) => {
            if (settled) return;
            settled = true;
            clearTimeout(timer);
            signal.removeEventListener("abort", onAbort);
            if (err) return reject(err);
            onProgress(++done, list.length);
            resolve();
          };
          const skip = () => {
            if (settled) return;
            failed.push(bg.id);
            videos.delete(bg.id);
            v.removeAttribute("src");
            v.load();
            v.remove();
            finish();
          };
          const timer = setTimeout(skip, BACKGROUND_TIMEOUT_MS);
          signal.addEventListener("abort", onAbort);
          v.addEventListener("loadeddata", () => finish(), { once: true });
          v.addEventListener("error", skip, { once: true });
          v.src = bg.src;
          // iOS Safari only decodes frames for videos that are in the document.
          host.appendChild(v);
          videos.set(bg.id, v);
          if (v.readyState >= 2) finish();
        })
    )
  );
  return { videos, failed };
}

// ── Main render ─────────────────────────────────────────────────────────────

export async function renderVideo(input: RenderInput): Promise<RenderResult> {
  const { canvas, session, playerState: ps, reciter, surah, backgrounds, signal, onProgress } = input;
  if (backgrounds.length === 0) throw new VideoError("background-load", "none selected");

  // Off-screen host for background <video> elements (must be in the DOM for iOS).
  const host = document.createElement("div");
  host.setAttribute("aria-hidden", "true");
  Object.assign(host.style, {
    position: "fixed",
    left: "0",
    top: "0",
    width: "2px",
    height: "2px",
    overflow: "hidden",
    opacity: "0.01",
    pointerEvents: "none",
    zIndex: "-1",
  });
  document.body.appendChild(host);

  let timeline: VideoTimeline | null = null;
  let recorder: MediaRecorder | null = null;
  let raf = 0;
  const wakeLock: { current: WakeLockSentinel | null } = { current: null };
  let videoStream: MediaStream | null = null;
  const cleanups: Array<() => void> = [];

  const acquireWakeLock = async () => {
    try {
      if ("wakeLock" in navigator && document.visibilityState === "visible") {
        wakeLock.current = await navigator.wakeLock.request("screen");
      }
    } catch {
      // Wake Lock is best-effort; rendering still works without it.
    }
  };

  try {
    // 1. Audio
    const clips = await prepareAudio(ps, reciter, signal, (done, total) =>
      onProgress({ phase: "audio", done, total })
    );
    timeline = buildTimeline(ps, reciter, clips);
    throwIfAborted(signal);

    // 2. Backgrounds + fonts
    const { videos, failed } = await loadBackgroundVideos(backgrounds, host, signal, (done, total) =>
      onProgress({ phase: "backgrounds", done, total })
    );
    let usable = backgrounds.filter((b) => !failed.includes(b.id));
    if (usable.length === 0) {
      const fallback = getBackground(FALLBACK_BACKGROUND_ID);
      usable = fallback ? [fallback] : backgrounds;
    }
    const quranFont = resolveFontFamily("font-quran", '"Amiri Quran", serif');
    const uiFont = resolveFontFamily("font-ui", "system-ui, sans-serif");
    const brandFont = resolveFontFamily("font-wordmark", "serif");
    if (document.fonts?.load) {
      await Promise.all([
        document.fonts.load(`48px ${quranFont}`, "بِسْمِ ٱللَّهِ ۖ ۩"),
        document.fonts.load(`28px ${uiFont}`, "Surah سورة"),
        document.fonts.load(englishFont(24, uiFont), "In the name of Allah"),
        document.fonts.load(`32px ${brandFont}`, "فاستمعوا له"),
      ]).catch(() => {});
    }
    throwIfAborted(signal);

    // 3. Canvas + recorder
    canvas.width = VIDEO_WIDTH;
    canvas.height = VIDEO_HEIGHT;
    canvas.setAttribute("dir", "rtl");
    const g = canvas.getContext("2d");
    if (!g) throw new VideoError("unsupported");

    const draw = createFrameDrawer(g, {
      timeline,
      backgrounds: usable,
      videos,
      surah,
      reciter,
      ps,
      ayahTexts: input.ayahTexts,
      ayahTranslations: input.ayahTranslations,
      fonts: { quran: quranFont, ui: uiFont, brand: brandFont },
    });

    let currentSegment: Segment = timeline.segments[0];
    let segmentProgress = 0;
    const clock = new Clock();
    draw(0, currentSegment, 0);

    videoStream = canvas.captureStream(FPS);
    const stream = new MediaStream([
      ...videoStream.getVideoTracks(),
      ...session.dest.stream.getAudioTracks(),
    ]);
    const options: MediaRecorderOptions = { videoBitsPerSecond: VIDEO_BITRATE, audioBitsPerSecond: AUDIO_BITRATE };
    if (input.mimeType) options.mimeType = input.mimeType;
    try {
      recorder = new MediaRecorder(stream, options);
    } catch {
      // Some browsers reject explicit options. Let the browser pick its default.
      recorder = new MediaRecorder(stream);
    }
    const chunks: Blob[] = [];
    let recorderError: unknown = null;
    recorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) chunks.push(e.data);
    };
    recorder.onerror = (e) => {
      recorderError = e;
    };
    const stopped = new Promise<void>((resolve) => {
      recorder!.onstop = () => resolve();
    });

    // Pause everything while the page is hidden: animation frames stop in
    // background tabs, so recording on would freeze the picture.
    let hiddenPause = false;
    const onVisibility = () => {
      if (!recorder) return;
      if (document.hidden && !hiddenPause && clock.running) {
        hiddenPause = true;
        clock.pause();
        if (recorder.state === "recording") recorder.pause();
        session.audio.pause();
        onProgress({ phase: "recording", elapsed: clock.elapsed, total: timeline!.total, paused: true });
      } else if (!document.hidden && hiddenPause) {
        hiddenPause = false;
        void session.ctx.resume().catch(() => {});
        if (recorder.state === "paused") recorder.resume();
        if (currentSegment.kind === "recitation") void session.audio.play().catch(() => {});
        clock.start();
        void acquireWakeLock();
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    cleanups.push(() => document.removeEventListener("visibilitychange", onVisibility));

    // resume() stays pending forever without a user gesture, so bound the wait
    // (and keep Cancel working) instead of hanging the render.
    await Promise.race([
      session.ctx.resume().catch(() => {}),
      new Promise((resolve) => setTimeout(resolve, 3000)),
      new Promise((resolve) => signal.addEventListener("abort", resolve, { once: true })),
    ]);
    throwIfAborted(signal);
    if (session.ctx.state !== "running") throw new VideoError("playback-blocked");
    await acquireWakeLock();
    recorder.start(1000);
    clock.start();

    let lastReport = -1;
    const frame = () => {
      const t = clock.elapsed;
      if (currentSegment.kind === "recitation" && session.audio.duration > 0) {
        segmentProgress = Math.min(1, session.audio.currentTime / session.audio.duration);
      }
      draw(t, currentSegment, segmentProgress);
      const second = Math.floor(t * 4);
      if (second !== lastReport) {
        lastReport = second;
        onProgress({ phase: "recording", elapsed: t, total: timeline!.total, paused: hiddenPause });
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    // Waits `seconds` of active (not hidden-paused) time.
    const waitActive = (seconds: number) =>
      new Promise<void>((resolve, reject) => {
        const target = clock.elapsed + seconds;
        const tick = () => {
          if (signal.aborted) return reject(new VideoError("cancelled"));
          if (recorderError) return reject(new VideoError("recorder"));
          if (clock.elapsed >= target) return resolve();
          setTimeout(tick, 40);
        };
        tick();
      });

    const playClip = (url: string, expectedSeconds: number) =>
      new Promise<void>((resolve, reject) => {
        const audio = session.audio;
        const startedAt = clock.elapsed;
        let settled = false;
        const finish = (err?: VideoError) => {
          if (settled) return;
          settled = true;
          clearInterval(watchdog);
          audio.onended = null;
          audio.onerror = null;
          signal.removeEventListener("abort", onAbort);
          if (err) reject(err);
          else resolve();
        };
        const onAbort = () => {
          audio.pause();
          finish(new VideoError("cancelled"));
        };
        // Guard against a stalled network/decoder hanging the render forever.
        const watchdog = setInterval(() => {
          if (recorderError) finish(new VideoError("recorder"));
          else if (clock.elapsed - startedAt > expectedSeconds + 20) finish(new VideoError("audio-fetch", "stalled"));
        }, 500);
        signal.addEventListener("abort", onAbort);
        audio.onended = () => finish();
        audio.onerror = () => finish(new VideoError("audio-fetch", "decode"));
        audio.src = url;
        audio.defaultPlaybackRate = ps.speed;
        audio.playbackRate = ps.speed;
        setPreservesPitch(audio);
        audio.play().then(
          () => {
            // Some browsers reset the rate on load. Re-apply it once playing.
            audio.playbackRate = ps.speed;
          },
          (err: unknown) => {
            const name = (err as { name?: string })?.name;
            // A hidden-page pause rejects play() with AbortError; the visibility handler resumes it.
            if (name === "AbortError" && hiddenPause) return;
            finish(new VideoError(name === "NotAllowedError" ? "playback-blocked" : "audio-fetch", String(err)));
          }
        );
      });

    // 4. Sequence the timeline
    for (const seg of timeline.segments) {
      throwIfAborted(signal);
      currentSegment = seg;
      segmentProgress = 0;
      if (seg.kind === "recitation") {
        const clip = timeline.clips[seg.clip];
        await playClip(clip.url, clip.duration / ps.speed);
      } else {
        await waitActive(seg.end - seg.start);
      }
    }

    // 5. Finalize
    onProgress({ phase: "finalizing" });
    cancelAnimationFrame(raf);
    raf = 0;
    if (recorder.state !== "inactive") {
      recorder.requestData();
      recorder.stop();
    }
    await stopped;
    if (recorderError) throw new VideoError("recorder");
    if (chunks.length === 0) throw new VideoError("recorder", "no data");

    const raw = new Blob(chunks, { type: recorder.mimeType || input.mimeType || "" });
    const container = (await sniffContainer(raw)) ?? containerFromMime(raw.type);
    if (!container) throw new VideoError("recorder", "unknown container");
    // Plain container types (no codecs suffix) are the most widely accepted by share targets.
    const blob = new Blob(chunks, { type: container === "mp4" ? "video/mp4" : "video/webm" });
    return { blob, container, duration: clock.elapsed, backgrounds: usable, skippedBackgrounds: failed };
  } finally {
    if (raf) cancelAnimationFrame(raf);
    cleanups.forEach((fn) => fn());
    if (recorder && recorder.state !== "inactive") {
      try {
        recorder.stop();
      } catch {
        // already stopped
      }
    }
    videoStream?.getTracks().forEach((track) => track.stop());
    session.audio.pause();
    timeline?.clips.forEach((c) => URL.revokeObjectURL(c.url));
    host.querySelectorAll("video").forEach((v) => {
      v.pause();
      v.removeAttribute("src");
      v.load();
    });
    host.remove();
    void wakeLock.current?.release().catch(() => {});
  }
}


// ── Frame drawing ───────────────────────────────────────────────────────────

interface DrawContext {
  timeline: VideoTimeline;
  backgrounds: Background[];
  videos: Map<string, HTMLVideoElement>;
  surah: Surah;
  reciter: Reciter;
  ps: PlayerState;
  ayahTexts: string[];
  ayahTranslations: string[];
  fonts: { quran: string; ui: string; brand: string };
}

interface AyahPlan {
  passages: Passage[];
  layouts: PassageLayout[];
}

const TEXT_BOX = { x: 56, y: 272, w: VIDEO_WIDTH - 112, h: 668 };
/** Passage changes: crossfade with a small upward drift. */
const PASSAGE_FADE_SECONDS = 0.6;
const PASSAGE_DRIFT_PX = 14;

export const QURAN_SOURCES_CREDIT = "Quran text: Tanzil.net (Uthmani) · English: Pickthall (1930, public domain)";

export function createFrameDrawer(g: CanvasRenderingContext2D, d: DrawContext) {
  const W = VIDEO_WIDTH;
  const H = VIDEO_HEIGHT;
  const n = d.backgrounds.length;
  const slot = d.timeline.total / n;
  const fade = Math.min(1.2, slot / 4);
  const plans = new Map<number, AyahPlan | null>();
  let shown: { key: string; ayah: number; index: number; dim: boolean } | null = null;
  let previous: { ayah: number; index: number; dim: boolean } | null = null;
  let changedAt = 0;

  // Splits each ayah once into passages that fit the text box, measured with
  // the real fonts. planPassages checks that the pieces join back to the exact
  // ayah text and falls back to the whole ayah otherwise.
  const planFor = (ayah: number): AyahPlan | null => {
    if (plans.has(ayah)) return plans.get(ayah) ?? null;
    const arabic = d.ayahTexts[ayah - 1];
    if (!arabic) {
      plans.set(ayah, null);
      return null;
    }
    const english = d.ayahTranslations[ayah - 1] ?? "";
    const fits = (p: Passage) =>
      layoutPassage(g, p.arabic, p.english, d.fonts, TEXT_BOX.w, TEXT_BOX.h) !== null;
    const passages = planPassages(arabic, english, fits);
    const layouts = passages.map(
      (p) => layoutPassage(g, p.arabic, p.english, d.fonts, TEXT_BOX.w, TEXT_BOX.h, true)!
    );
    const plan = { passages, layouts };
    plans.set(ayah, plan);
    return plan;
  };

  const drawBackground = (bg: Background, t: number, alpha: number) => {
    g.save();
    g.globalAlpha = alpha;
    if (bg.kind === "procedural") {
      drawProceduralScene(bg.scene, g, W, H, t);
    } else {
      const v = d.videos.get(bg.id);
      if (v && v.readyState >= 2) {
        // Assets are 720×1280 already; cover-fit in case a browser reports otherwise.
        const vw = v.videoWidth || W;
        const vh = v.videoHeight || H;
        const s = Math.max(W / vw, H / vh);
        const dw = vw * s;
        const dh = vh * s;
        g.drawImage(v, (W - dw) / 2, (H - dh) / 2, dw, dh);
      } else {
        g.fillStyle = "#16223b";
        g.fillRect(0, 0, W, H);
      }
    }
    g.restore();
  };

  // Only the visible (and about-to-be-visible) videos keep decoding.
  const pendingPlay = new WeakSet<HTMLVideoElement>();
  const syncVideoPlayback = (active: Set<string>) => {
    d.videos.forEach((v, id) => {
      if (active.has(id)) {
        if (v.paused && !pendingPlay.has(v)) {
          pendingPlay.add(v);
          void v
            .play()
            .catch(() => {})
            .finally(() => pendingPlay.delete(v));
        }
      } else if (!v.paused) {
        v.pause();
      }
    });
  };

  const text = (
    value: string,
    x: number,
    y: number,
    font: string,
    color: string,
    dir: CanvasDirection = "rtl"
  ) => {
    g.font = font;
    g.fillStyle = color;
    g.direction = dir;
    g.fillText(value, x, y);
  };

  const ornamentLine = (y: number, half: number) => {
    const grad = g.createLinearGradient(W / 2 - half, y, W / 2 + half, y);
    grad.addColorStop(0, "rgba(217,181,99,0)");
    grad.addColorStop(0.5, "rgba(217,181,99,0.9)");
    grad.addColorStop(1, "rgba(217,181,99,0)");
    g.strokeStyle = grad;
    g.lineWidth = 1.5;
    g.beginPath();
    g.moveTo(W / 2 - half, y);
    g.lineTo(W / 2 + half, y);
    g.stroke();
    // Small diamond at the center.
    g.fillStyle = "rgba(217,181,99,0.95)";
    g.beginPath();
    g.moveTo(W / 2, y - 6);
    g.lineTo(W / 2 + 6, y);
    g.lineTo(W / 2, y + 6);
    g.lineTo(W / 2 - 6, y);
    g.closePath();
    g.fill();
  };

  const ayahBadge = (ayah: number, cx: number, cy: number) => {
    const r = 30;
    g.save();
    g.strokeStyle = "rgba(217,181,99,0.95)";
    g.lineWidth = 2;
    for (const rot of [0, Math.PI / 4]) {
      g.beginPath();
      for (let i = 0; i < 4; i++) {
        const a = rot + (Math.PI / 2) * i;
        const x = cx + Math.cos(a) * r;
        const y = cy + Math.sin(a) * r;
        if (i === 0) g.moveTo(x, y);
        else g.lineTo(x, y);
      }
      g.closePath();
      g.stroke();
    }
    g.textAlign = "center";
    g.textBaseline = "middle";
    text(toArabicDigits(ayah), cx, cy + 2, `600 26px ${d.fonts.ui}`, "#f4ead3", "rtl");
    g.restore();
  };

  /** Arabic lines, then the English translation in a smaller, dimmer face. */
  const drawPassage = (layout: PassageLayout, alpha: number, offsetY: number) => {
    if (alpha <= 0) return;
    const y0 = TEXT_BOX.y + (TEXT_BOX.h - layout.height) / 2 + offsetY;
    g.globalAlpha = alpha;
    let y = y0 + layout.arabicLineHeight / 2;
    for (const line of layout.arabicLines) {
      text(line, W / 2, y, arabicFont(layout.arabicSize, d.fonts.quran), "#ffffff", "rtl");
      y += layout.arabicLineHeight;
    }
    y = y0 + layout.arabicLines.length * layout.arabicLineHeight + layout.gap + layout.englishLineHeight / 2;
    for (const line of layout.englishLines) {
      text(line, W / 2, y, englishFont(layout.englishSize, d.fonts.ui), "rgba(244,234,211,0.82)", "ltr");
      y += layout.englishLineHeight;
    }
    g.globalAlpha = 1;
  };

  return function draw(t: number, seg: Segment, segProgress: number) {
    // Backgrounds: equal time slots with crossfades between them.
    const i = Math.min(n - 1, Math.floor(t / slot));
    const nextStart = (i + 1) * slot;
    const active = new Set<string>([d.backgrounds[i].id]);
    if (i < n - 1 && t > nextStart - fade - 2) active.add(d.backgrounds[i + 1].id);
    syncVideoPlayback(active);
    drawBackground(d.backgrounds[i], t, 1);
    if (i < n - 1 && t > nextStart - fade) {
      drawBackground(d.backgrounds[i + 1], t, Math.min(1, (t - (nextStart - fade)) / fade));
    }
    const dominant = i < n - 1 && t > nextStart - fade / 2 ? d.backgrounds[i + 1] : d.backgrounds[i];

    // Legibility overlays: overall dim + darker top and bottom bands.
    g.fillStyle = "rgba(12,9,7,0.30)";
    g.fillRect(0, 0, W, H);
    const top = g.createLinearGradient(0, 0, 0, 380);
    top.addColorStop(0, "rgba(12,9,7,0.70)");
    top.addColorStop(1, "rgba(12,9,7,0)");
    g.fillStyle = top;
    g.fillRect(0, 0, W, 380);
    const bottom = g.createLinearGradient(0, 920, 0, H);
    bottom.addColorStop(0, "rgba(12,9,7,0)");
    bottom.addColorStop(1, "rgba(12,9,7,0.80)");
    g.fillStyle = bottom;
    g.fillRect(0, 920, W, H - 920);
    const center = g.createRadialGradient(W / 2, 610, 40, W / 2, 610, 440);
    center.addColorStop(0, "rgba(12,9,7,0.40)");
    center.addColorStop(1, "rgba(12,9,7,0)");
    g.fillStyle = center;
    g.fillRect(0, 180, W, 880);

    g.save();
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.shadowColor = "rgba(0,0,0,0.55)";
    g.shadowBlur = 14;

    // Header: Surah name, English name + range.
    text(`سورة ${d.surah.name}`, W / 2, 112, `52px ${d.fonts.quran}`, "#f4ead3");
    const rangeLabel = d.timeline.fullSurah
      ? `${d.surah.englishName} · Full surah`
      : d.ps.startAyah === d.ps.endAyah
        ? `${d.surah.englishName} · Ayah ${d.ps.startAyah}`
        : `${d.surah.englishName} · Ayahs ${d.ps.startAyah}–${d.ps.endAyah}`;
    text(rangeLabel, W / 2, 180, `500 26px ${d.fonts.ui}`, "rgba(244,234,211,0.82)", "ltr");
    g.shadowBlur = 0;
    ornamentLine(224, 150);
    g.shadowBlur = 14;

    // Body: the current passage, or the surah title for full-surah recitations
    // (there's no verified per-ayah timing for those files, so we never guess
    // which ayah is being recited).
    if (d.timeline.fullSurah) {
      text(d.surah.name, W / 2, 600, `110px ${d.fonts.quran}`, "#ffffff");
      text("تلاوة السورة كاملة", W / 2, 760, `500 30px ${d.fonts.ui}`, "rgba(244,234,211,0.85)");
    } else {
      // Which ayah and how far through its recitation. Ayah boundaries come
      // from the per-ayah audio files (exact); the passage within the ayah is
      // picked by letter share (approximate, see passages.ts).
      let ayah: number;
      let dim = false;
      let progress = segProgress;
      if (seg.kind === "recitation") ayah = seg.ayah ?? d.ps.startAyah;
      else if (seg.kind === "pause") {
        ayah = seg.afterAyah ?? d.ps.startAyah;
        dim = true;
        progress = 1;
      } else if (seg.kind === "intro") {
        ayah = d.ps.startAyah;
        dim = true;
        progress = 0;
      } else {
        ayah = d.ps.endAyah;
        progress = 1;
      }

      const plan = planFor(ayah);
      if (plan) {
        const index = passageIndexAt(plan.passages, progress);
        const key = `${ayah}:${index}`;
        if (!shown || shown.key !== key) {
          previous = shown ? { ayah: shown.ayah, index: shown.index, dim: shown.dim } : null;
          shown = { key, ayah, index, dim };
          changedAt = t;
        }
        shown.dim = dim;
        const raw = Math.min(1, (t - changedAt) / PASSAGE_FADE_SECONDS);
        const p = raw * raw * (3 - 2 * raw); // smoothstep
        const prevPlan = previous && p < 1 ? planFor(previous.ayah) : null;
        if (previous && prevPlan) {
          drawPassage(prevPlan.layouts[previous.index], (1 - p) * (previous.dim ? 0.6 : 1), -PASSAGE_DRIFT_PX * p);
        }
        drawPassage(plan.layouts[index], p * (dim ? 0.6 : 1), PASSAGE_DRIFT_PX * (1 - p));

        g.shadowBlur = 0;
        ayahBadge(ayah, W / 2, TEXT_BOX.y + TEXT_BOX.h + 34);
        g.shadowBlur = 14;
        if (d.timeline.repeats > 1 && seg.kind === "recitation") {
          text(
            `التكرار ${toArabicDigits(seg.repeat)} / ${toArabicDigits(d.timeline.repeats)}`,
            W / 2,
            TEXT_BOX.y + TEXT_BOX.h + 86,
            `500 22px ${d.fonts.ui}`,
            "rgba(244,234,211,0.75)"
          );
        }
      }
    }

    // Footer: reciter + brand.
    text(d.reciter.arabicName, W / 2, 1086, `600 28px ${d.fonts.ui}`, "#f4ead3");
    text(d.reciter.name, W / 2, 1122, `400 20px ${d.fonts.ui}`, "rgba(244,234,211,0.7)", "ltr");
    g.shadowBlur = 0;
    ornamentLine(1154, 110);
    g.shadowBlur = 14;
    text("فاستمعوا له", W / 2, 1194, `700 34px ${d.fonts.brand}`, "#d9b563");

    // Source credits travel with every shared copy: the Quran text/translation
    // sources, and the CC BY attribution while that background is on screen.
    g.shadowBlur = 6;
    if (!d.timeline.fullSurah) {
      const credit = d.ayahTranslations.length ? QURAN_SOURCES_CREDIT : "Quran text: Tanzil.net (Uthmani)";
      text(credit, W / 2, 1234, `400 14px ${d.fonts.ui}`, "rgba(244,234,211,0.68)", "ltr");
    }
    if (dominant.credit.licenseKind === "cc-by-4.0") {
      text(
        `Background: “${dominant.credit.title}” by ${dominant.credit.author} · CC BY 4.0`,
        W / 2,
        1260,
        `400 14px ${d.fonts.ui}`,
        "rgba(244,234,211,0.75)",
        "ltr"
      );
    }
    g.restore();

    // Fade in from black at the start.
    if (t < 0.8) {
      g.fillStyle = `rgba(0,0,0,${1 - t / 0.8})`;
      g.fillRect(0, 0, W, H);
    }
  };
}

export { VideoError };
