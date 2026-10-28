// Browser capability + output-format detection for the video creator.

export type UnsupportedReason = "no-mediarecorder" | "no-canvas-stream" | "no-webaudio";

export interface VideoSupport {
  supported: boolean;
  reason?: UnsupportedReason;
  /** The MediaRecorder mime type we'll request, or "" to let the browser choose. */
  mimeType: string;
  /** What we expect to get, before the actual bytes confirm it. */
  expectedContainer: VideoContainer | null;
}

export type VideoContainer = "mp4" | "webm";

// MP4 first: it's what phones, WhatsApp, and iOS Photos accept most reliably.
// Safari records MP4 natively; recent Chrome can too; older Chrome/Firefox fall back to WebM.
const MIME_CANDIDATES = [
  "video/mp4;codecs=avc1.42E01E,mp4a.40.2",
  "video/mp4;codecs=avc1,mp4a.40.2",
  "video/mp4",
  "video/webm;codecs=vp9,opus",
  "video/webm;codecs=vp8,opus",
  "video/webm",
];

export function getAudioContextCtor(): typeof AudioContext | undefined {
  if (typeof window === "undefined") return undefined;
  return (
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  );
}

export function detectVideoSupport(): VideoSupport {
  if (typeof window === "undefined") {
    return { supported: false, reason: "no-mediarecorder", mimeType: "", expectedContainer: null };
  }
  if (typeof window.MediaRecorder === "undefined") {
    return { supported: false, reason: "no-mediarecorder", mimeType: "", expectedContainer: null };
  }
  const canvas = document.createElement("canvas");
  if (typeof (canvas as HTMLCanvasElement).captureStream !== "function") {
    return { supported: false, reason: "no-canvas-stream", mimeType: "", expectedContainer: null };
  }
  const AC = getAudioContextCtor();
  if (!AC || typeof AC.prototype.createMediaStreamDestination !== "function") {
    return { supported: false, reason: "no-webaudio", mimeType: "", expectedContainer: null };
  }

  const isSupported = (m: string) => {
    try {
      return MediaRecorder.isTypeSupported(m);
    } catch {
      return false;
    }
  };
  const mimeType = MIME_CANDIDATES.find(isSupported) ?? "";
  return {
    supported: true,
    mimeType,
    expectedContainer: mimeType ? containerFromMime(mimeType) : null,
  };
}

export function containerFromMime(mime: string): VideoContainer | null {
  const m = mime.toLowerCase();
  if (m.includes("mp4")) return "mp4";
  if (m.includes("webm")) return "webm";
  return null;
}

/**
 * Identify the container from the file's own bytes, so the download is never
 * labeled as something it isn't. MP4/ISO-BMFF has "ftyp" at offset 4. WebM
 * (EBML) starts with 1A 45 DF A3.
 */
export async function sniffContainer(blob: Blob): Promise<VideoContainer | null> {
  const head = new Uint8Array(await blob.slice(0, 12).arrayBuffer());
  if (head.length >= 4 && head[0] === 0x1a && head[1] === 0x45 && head[2] === 0xdf && head[3] === 0xa3) {
    return "webm";
  }
  if (head.length >= 8 && String.fromCharCode(head[4], head[5], head[6], head[7]) === "ftyp") {
    return "mp4";
  }
  return null;
}

export function canShareFiles(file: File): boolean {
  if (typeof navigator === "undefined" || typeof navigator.share !== "function") return false;
  if (typeof navigator.canShare !== "function") return false;
  try {
    return navigator.canShare({ files: [file] });
  } catch {
    return false;
  }
}
