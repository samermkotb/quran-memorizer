// MP3 header parsing used for the pre-render video length. Run with `npm test`.

import { test } from "node:test";
import assert from "node:assert/strict";
import { parseMp3Head } from "../src/lib/video/mp3Duration.ts";

const hex = (s: string) => Uint8Array.from(s.match(/../g)!.map((b) => parseInt(b, 16)));

// First 256 bytes of https://everyayah.com/data/Alafasy_128kbps/001001.mp3:
// MPEG-1 Layer III 128 kbps 44.1 kHz with a LAME "Info" header (233 frames,
// encoder delay 576 + padding 1980). ffprobe reports 6.031111 s for the file.
const EVERYAYAH_1_1 = hex(
  "fffbb0000000000000000000000000000000000000000000000000000000000000000000496e666f0000000f000000e900023d0e000305070a0d0f1214171a1c1e222426292b2e313335393b3d404345484a4c505254575a5c5f616367696b6e717376787b7e808286888a8d8f929597999d9fa1a4a7a9acaeb0b4b6b8bbbec0c3c5c7cbcdcfd2d5d7dadcdfe2e4e6eaeceef1f3f6f9fbfd000000374c414d45332e39322001bb000000000000000002c024074c4500000000023d0e7517b5eb" +
    "00".repeat(64)
);

test("LAME Info header gives the exact, gapless-trimmed duration", () => {
  const r = parseMp3Head(EVERYAYAH_1_1);
  assert.equal(r.kind, "exact");
  if (r.kind === "exact") assert.ok(Math.abs(r.seconds - 6.031111) < 0.001, String(r.seconds));
});

test("ID3v2 tag is skipped, and a tag larger than the read asks for more", () => {
  const id3 = (size: number) => {
    const b = new Uint8Array(10);
    b.set([0x49, 0x44, 0x33, 3, 0, 0]);
    b[6] = (size >> 21) & 0x7f;
    b[7] = (size >> 14) & 0x7f;
    b[8] = (size >> 7) & 0x7f;
    b[9] = size & 0x7f;
    return b;
  };
  const small = new Uint8Array(4096);
  small.set(id3(100));
  small.set(EVERYAYAH_1_1, 110);
  const r = parseMp3Head(small);
  assert.equal(r.kind, "exact");

  const big = new Uint8Array(4096);
  big.set(id3(26069));
  assert.deepEqual(parseMp3Head(big), { kind: "need-more", offset: 26079 });
  // The follow-up read starts at that offset.
  const again = parseMp3Head(EVERYAYAH_1_1, 26079);
  assert.equal(again.kind, "exact");
});

test("CBR without a frame count reports bitrate and audio start for a size estimate", () => {
  // Two consecutive MPEG-1 Layer III 128 kbps 44.1 kHz frames (417 bytes each), no Xing tag.
  const frame = new Uint8Array(417);
  frame.set([0xff, 0xfb, 0x90, 0x00]);
  const buf = new Uint8Array(417 * 3);
  buf.set(frame, 0);
  buf.set(frame, 417);
  buf.set(frame, 834);
  assert.deepEqual(parseMp3Head(buf), { kind: "cbr", kbps: 128, audioStart: 0 });
});

test("garbage is rejected", () => {
  assert.equal(parseMp3Head(new Uint8Array(4096).fill(7)).kind, "invalid");
});
