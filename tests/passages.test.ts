// Quran text integrity checks. Run with `npm test`.
//
// These guard the release-critical rule that the video shows the Quran text
// exactly as bundled: every passage split must join back to the original ayah,
// pause marks must never be stranded at the start of a passage, and the bundled
// data must be the verified Tanzil / Pickthall text (locked by checksum).

import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import {
  arabicUnits,
  passageIndexAt,
  passagesReconstruct,
  planPassages,
  splitIntoPassages,
  type Passage,
} from "../src/lib/video/passages.ts";

const ROOT = new URL("../", import.meta.url);
const pad = (n: number) => String(n).padStart(3, "0");
const load = (dir: string, s: number): string[] =>
  JSON.parse(readFileSync(new URL(`public/${dir}/${pad(s)}.json`, ROOT), "utf8"));

const ARABIC = Array.from({ length: 114 }, (_, i) => load("quran-text", i + 1));
const ENGLISH = Array.from({ length: 114 }, (_, i) => load("quran-translation/en-pickthall", i + 1));

// SHA-256 over the 114 files in order, as written by scripts/build-quran-data.py.
const ARABIC_SHA256 = "b4639ee928ecd69181f8cdbe49af4e93827ae6fbf8d0cbe2683c779872cb2b18";
const ENGLISH_SHA256 = "1e632dc137bb7e8e854e2885d02f6fe3fca68310b0525c2e7df86da8bf75de8c";

const HAS_LETTER = /[ء-غف-يٱ-ۓ]/;

function digest(dir: string): string {
  const h = createHash("sha256");
  for (let s = 1; s <= 114; s++) h.update(readFileSync(new URL(`public/${dir}/${pad(s)}.json`, ROOT)));
  return h.digest("hex");
}

function* everyAyah() {
  for (let s = 0; s < 114; s++) {
    for (let a = 0; a < ARABIC[s].length; a++) {
      yield { key: `${s + 1}:${a + 1}`, arabic: ARABIC[s][a], english: ENGLISH[s][a] };
    }
  }
}

function assertWellFormed(key: string, arabic: string, english: string, passages: Passage[]) {
  assert.ok(passagesReconstruct(arabic, english, passages), `${key}: passages do not rebuild the ayah`);
  assert.equal(passages[passages.length - 1].end, 1, `${key}: timing must end at 1`);
  for (const p of passages) {
    const firstToken = p.arabic.split(" ")[0];
    assert.ok(HAS_LETTER.test(firstToken), `${key}: passage starts with a bare mark: ${p.arabic}`);
  }
}

test("bundled data matches the verified sources (checksums)", () => {
  assert.equal(digest("quran-text"), ARABIC_SHA256, "Arabic Quran text changed; re-verify before updating");
  assert.equal(digest("quran-translation/en-pickthall"), ENGLISH_SHA256, "Translation changed; re-verify");
});

test("ayah counts: 6236 total and per surah match src/lib/surahData.ts", () => {
  const src = readFileSync(new URL("src/lib/surahData.ts", ROOT), "utf8");
  const counts = [...src.matchAll(/numberOfAyahs: (\d+)/g)].map((m) => Number(m[1]));
  assert.equal(counts.length, 114);
  assert.deepEqual(
    ARABIC.map((a) => a.length),
    counts
  );
  assert.deepEqual(
    ENGLISH.map((a) => a.length),
    counts
  );
  assert.equal(
    counts.reduce((a, b) => a + b, 0),
    6236
  );
});

test("text has no stray whitespace, direction marks, or glued Basmala", () => {
  for (const { key, arabic, english } of everyAyah()) {
    for (const [label, t] of [
      ["arabic", arabic],
      ["english", english],
    ]) {
      assert.ok(t.length > 0, `${key} ${label} empty`);
      assert.equal(t, t.trim(), `${key} ${label} has edge whitespace`);
      assert.ok(!/\s{2,}|[\t\n\r ‎‏]/.test(t), `${key} ${label} has odd whitespace`);
    }
  }
  // Regression: the previous dataset had "ٱلرَّحِيمِ" glued to the start of 97:1.
  // Written as escapes so editors can't silently reorder the combining marks.
  assert.equal(
    ARABIC[96][0],
    "إِنَّآ أَنزَلْنَٰهُ " +
      "فِى لَيْلَةِ ٱلْقَدْرِ"
  );
  const basmala =
    "بِسْمِ ٱللَّهِ " +
    "ٱلرَّحْمَٰنِ ٱلرَّحِيمِ";
  assert.equal(ARABIC[0][0], basmala, "1:1 is the Basmala");
  for (let s = 2; s <= 114; s++) {
    assert.ok(!ARABIC[s - 1][0].startsWith(basmala), `${s}:1 must not carry the Basmala`);
  }
});

test("arabicUnits rebuilds every ayah and never strands a pause mark", () => {
  for (const { key, arabic } of everyAyah()) {
    const units = arabicUnits(arabic);
    assert.equal(units.join(" "), arabic, key);
    for (const u of units) assert.ok(HAS_LETTER.test(u.split(" ")[0]), `${key}: unit starts with a mark: ${u}`);
  }
});

test("every ayah splits losslessly into 1..6 passages (Arabic and English)", () => {
  for (const { key, arabic, english } of everyAyah()) {
    for (let n = 1; n <= 6; n++) {
      const passages = splitIntoPassages(arabic, english, n);
      assertWellFormed(key, arabic, english, passages);
    }
  }
});

test("planPassages: phrase-sized, lossless, monotonic timing for all 6236 ayahs", () => {
  // Approximates the renderer's fit check without a canvas.
  const fits = (p: Passage) => p.arabic.length <= 140 && p.english.length <= 260;
  let split = 0;
  for (const { key, arabic, english } of everyAyah()) {
    const passages = planPassages(arabic, english, fits);
    assertWellFormed(key, arabic, english, passages);
    assert.ok(passages.every(fits) || passages.length === arabicUnits(arabic).length, `${key}: does not fit`);
    if (passages.length > 1) split++;
    // Without an English translation the Arabic alone must still rebuild exactly.
    const arOnly = planPassages(arabic, "", fits);
    assert.equal(arOnly.map((p) => p.arabic).join(" "), arabic, key);
  }
  assert.ok(split > 0, "long ayahs should be split into phrases");
});

test("Ayat al-Kursi (2:255) splits at pause marks into phrases", () => {
  const arabic = ARABIC[1][254];
  const english = ENGLISH[1][254];
  const passages = planPassages(arabic, english, (p) => p.arabic.length <= 140);
  assertWellFormed("2:255", arabic, english, passages);
  assert.ok(passages.length >= 3);
  // All but the last passage should end on a pause mark here (the ayah has many).
  const endsOnMark = passages.slice(0, -1).filter((p) => /[ۖ-ۛ]$/.test(p.arabic)).length;
  assert.ok(endsOnMark >= passages.length - 2, `only ${endsOnMark} of ${passages.length - 1} cuts on pause marks`);
});

test("passageIndexAt follows the timing fractions", () => {
  const passages = splitIntoPassages(ARABIC[1][281], ENGLISH[1][281], 4);
  assert.equal(passageIndexAt(passages, 0), 0);
  assert.equal(passageIndexAt(passages, 1), passages.length - 1);
  let last = 0;
  for (let p = 0; p <= 1; p += 0.01) {
    const i = passageIndexAt(passages, p);
    assert.ok(i >= last);
    last = i;
  }
});
