// Reads an MP3 file's duration from its first few kilobytes.
//
// The everyayah.com files are LAME-encoded and start with a Xing/"Info" header
// that records the exact number of audio frames, so
//   duration = frames × samplesPerFrame / sampleRate
// is the real length, not a guess. Files without that header fall back to a
// constant-bitrate estimate from the file size, which callers label as
// approximate.
//
// Pure module (no DOM, no path aliases) so it runs under `node --test`.

export type Mp3HeadResult =
  /** Exact length from the Xing/Info or VBRI frame count. */
  | { kind: "exact"; seconds: number }
  /** No frame count: the caller can estimate from the file size at this bitrate. */
  | { kind: "cbr"; kbps: number; audioStart: number }
  /** The ID3 tag is larger than the bytes read; read again from this offset. */
  | { kind: "need-more"; offset: number }
  | { kind: "invalid" };

const BITRATES: Record<string, number[]> = {
  // [version][layer] → kbps by index 1..14
  "1-1": [32, 64, 96, 128, 160, 192, 224, 256, 288, 320, 352, 384, 416, 448],
  "1-2": [32, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320, 384],
  "1-3": [32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320],
  "2-1": [32, 48, 56, 64, 80, 96, 112, 128, 144, 160, 176, 192, 224, 256],
  "2-2": [8, 16, 24, 32, 40, 48, 56, 64, 80, 96, 112, 128, 144, 160],
  "2-3": [8, 16, 24, 32, 40, 48, 56, 64, 80, 96, 112, 128, 144, 160],
};
const SAMPLE_RATES: Record<number, number[]> = {
  1: [44100, 48000, 32000],
  2: [22050, 24000, 16000],
  25: [11025, 12000, 8000],
};

interface FrameHeader {
  version: 1 | 2 | 25;
  layer: 1 | 2 | 3;
  kbps: number;
  sampleRate: number;
  mono: boolean;
}

function parseFrameHeader(b: Uint8Array, i: number): FrameHeader | null {
  if (i + 4 > b.length || b[i] !== 0xff || (b[i + 1] & 0xe0) !== 0xe0) return null;
  const v = (b[i + 1] >> 3) & 3;
  const l = (b[i + 1] >> 1) & 3;
  const bitrateIndex = b[i + 2] >> 4;
  const srIndex = (b[i + 2] >> 2) & 3;
  if (v === 1 || l === 0 || bitrateIndex === 0 || bitrateIndex === 15 || srIndex === 3) return null;
  const version = v === 3 ? 1 : v === 2 ? 2 : 25;
  const layer = (4 - l) as 1 | 2 | 3;
  const table = BITRATES[`${version === 1 ? 1 : 2}-${layer}`];
  return {
    version,
    layer,
    kbps: table[bitrateIndex - 1],
    sampleRate: SAMPLE_RATES[version][srIndex],
    mono: b[i + 3] >> 6 === 3,
  };
}

function samplesPerFrame(h: FrameHeader): number {
  if (h.layer === 1) return 384;
  if (h.layer === 2) return 1152;
  return h.version === 1 ? 1152 : 576;
}

const u32 = (b: Uint8Array, i: number) => ((b[i] << 24) | (b[i + 1] << 16) | (b[i + 2] << 8) | b[i + 3]) >>> 0;
const tag = (b: Uint8Array, i: number) => String.fromCharCode(b[i], b[i + 1], b[i + 2], b[i + 3]);

/**
 * Parses the start of an MP3 file. `head` holds bytes beginning at `offset`
 * in the file (0 for the first read).
 */
export function parseMp3Head(head: Uint8Array, offset = 0): Mp3HeadResult {
  let pos = 0;
  if (offset === 0 && head.length >= 10 && head[0] === 0x49 && head[1] === 0x44 && head[2] === 0x33) {
    // ID3v2: 10-byte header + syncsafe size (+ 10 more with a footer).
    const size = ((head[6] & 0x7f) << 21) | ((head[7] & 0x7f) << 14) | ((head[8] & 0x7f) << 7) | (head[9] & 0x7f);
    pos = 10 + size + (head[5] & 0x10 ? 10 : 0);
    if (pos + 512 > head.length) return { kind: "need-more", offset: pos };
  }

  // Find the first frame with a valid header followed by another valid header
  // (or the Xing/Info tag), to skip padding or junk before the audio.
  for (let i = pos; i < Math.min(head.length - 4, pos + 8192); i++) {
    const h = parseFrameHeader(head, i);
    if (!h) continue;
    const spf = samplesPerFrame(h);
    if (h.layer === 3) {
      const sideInfo = h.version === 1 ? (h.mono ? 17 : 32) : h.mono ? 9 : 17;
      const x = i + 4 + sideInfo;
      if (x + 12 <= head.length) {
        const id = tag(head, x);
        const flags = id === "Xing" || id === "Info" ? u32(head, x + 4) : 0;
        if (flags & 1) {
          const frames = u32(head, x + 8);
          // Encoder delay + padding from the LAME tag (after the optional
          // bytes/TOC/quality fields): decoders trim these for gapless
          // playback, so the audible length is shorter by that many samples.
          const ext = x + 12 + (flags & 2 ? 4 : 0) + (flags & 4 ? 100 : 0) + (flags & 8 ? 4 : 0);
          let trim = 0;
          if (ext + 24 <= head.length && /^(LAME|Lavf|Lavc|L3.9)/.test(tag(head, ext))) {
            trim = ((head[ext + 21] << 4) | (head[ext + 22] >> 4)) + (((head[ext + 22] & 0x0f) << 8) | head[ext + 23]);
          }
          const samples = frames * spf - trim;
          if (frames > 0 && samples > 0) return { kind: "exact", seconds: samples / h.sampleRate };
        }
      }
      const vbri = i + 4 + 32;
      if (vbri + 18 <= head.length && tag(head, vbri) === "VBRI") {
        const frames = u32(head, vbri + 14);
        if (frames > 0) return { kind: "exact", seconds: (frames * spf) / h.sampleRate };
      }
    }
    // Confirm with the next frame header so random 0xFF bytes don't count.
    const frameLength =
      h.layer === 1
        ? Math.floor((12 * h.kbps * 1000) / h.sampleRate + ((head[i + 2] >> 1) & 1)) * 4
        : Math.floor(((h.layer === 3 && h.version !== 1 ? 72 : 144) * h.kbps * 1000) / h.sampleRate) +
          ((head[i + 2] >> 1) & 1);
    const next = i + frameLength;
    if (next + 4 > head.length || parseFrameHeader(head, next)) {
      return { kind: "cbr", kbps: h.kbps, audioStart: offset + i };
    }
  }
  return { kind: "invalid" };
}
