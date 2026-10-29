// Splits one ayah into on-screen passages: an Arabic chunk with the matching
// slice of its English translation beneath it.
//
// Integrity rules (release-critical, covered by tests/passages.test.ts):
// - Chunks are contiguous slices of the original string, cut only at the
//   spaces between words. Joining the Arabic chunks with a single space gives
//   back the ayah exactly, and the same holds for the English chunks. Nothing
//   is normalized, reordered, dropped or re-spaced.
// - In the Tanzil Uthmani text, pause marks (ۖ ۗ ۚ ۛ …) and the sajdah sign (۩)
//   are separate space-delimited tokens. They stay glued to the word before
//   them, so a chunk or a line never starts with a bare mark.
//
// Timing honesty: audio is split per ayah, so ayah boundaries are exact. Inside
// an ayah there is no verified word timing for these recordings, so each
// passage's share of the ayah's duration is approximated by its share of the
// Arabic letters. Likewise the English is cut at the punctuation nearest to the
// matching proportion of its length. Both are approximations and are documented
// as such; the full text is always shown, in order.
//
// Pure module (no DOM, no path aliases) so it runs under `node --test`.

export interface Passage {
  arabic: string;
  /** Matching slice of the translation, or "" when no translation is shown. */
  english: string;
  /** Fraction (0..1) of the ayah's recitation where this passage starts. */
  start: number;
  /** Fraction (0..1) of the ayah's recitation where this passage ends. */
  end: number;
}

/** Base Arabic letters (no diacritics, no Quranic annotation marks). */
const ARABIC_LETTER = /[ء-غف-يٱ-ۓەۮۯۺ-ۼ]/;
const ARABIC_LETTERS_G = new RegExp(ARABIC_LETTER.source, "g");
/** Signs that belong to the word that follows them (rub el hizb). */
const LEADING_SIGNS = new Set(["۞"]);

// How good a place each pause mark is to end a passage. ۙ (U+06D9, "lā")
// means "do not stop here", so breaking after it is discouraged.
const WAQF_BREAK: Record<string, number> = {
  "ۘ": 1, // ۘ  mandatory stop (mīm)
  "ۗ": 0.9, // ۗ  stopping preferred (qilā)
  "ۚ": 0.8, // ۚ  stopping permitted (jīm)
  "ۖ": 0.7, // ۖ  continuing preferred, stopping permitted (ṣilā)
  "ۛ": 0.3, // ۛ  paired stop (muʿānaqa)
  "ۙ": -1, // ۙ  do not stop (lā)
};

/**
 * Groups an Arabic ayah into words. Each unit is a substring of the ayah, and
 * units.join(" ") === text. A token with no base letter (a pause mark or the
 * sajdah sign) is attached to the previous word.
 */
export function arabicUnits(text: string): string[] {
  const tokens = text.split(" ");
  const units: string[] = [];
  let carry = "";
  for (const token of tokens) {
    if (LEADING_SIGNS.has(token)) {
      carry = carry ? `${carry} ${token}` : token;
      continue;
    }
    const hasLetter = ARABIC_LETTER.test(token);
    if (!hasLetter && units.length > 0 && !carry) {
      units[units.length - 1] += ` ${token}`;
      continue;
    }
    units.push(carry ? `${carry} ${token}` : token);
    carry = "";
  }
  if (carry) {
    if (units.length > 0) units[units.length - 1] += ` ${carry}`;
    else units.push(carry);
  }
  return units;
}

export function englishUnits(text: string): string[] {
  return text.split(" ");
}

export function arabicLetterCount(text: string): number {
  return text.match(ARABIC_LETTERS_G)?.length ?? 0;
}

function waqfBonus(unit: string): number {
  let best = 0;
  for (const ch of unit) {
    const v = WAQF_BREAK[ch];
    if (v !== undefined && (best === 0 || Math.abs(v) > Math.abs(best))) best = v;
  }
  return best;
}

function englishBonus(unit: string): number {
  if (/[.;:!?]["'’”)]*$/.test(unit)) return 1;
  if (/,["'’”)]*$/.test(unit)) return 0.7;
  if (/[)\]]$/.test(unit)) return 0.3;
  return 0;
}

/**
 * Cuts `sizes` into targets.length contiguous, non-empty groups whose sums are
 * close to the targets, preferring cuts after units with a high bonus.
 * Returns the exclusive end index of each group.
 */
function partition(sizes: number[], bonus: number[], targets: number[]): number[] {
  const m = sizes.length;
  const n = targets.length;
  if (n <= 1) return [m];
  const prefix = [0];
  for (const s of sizes) prefix.push(prefix[prefix.length - 1] + s);
  const scale = Math.max(1, prefix[m] / n);
  const BONUS = 0.35;
  const INF = Number.POSITIVE_INFINITY;
  const dp: number[][] = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(INF));
  const from: number[][] = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(-1));
  dp[0][0] = 0;
  for (let k = 1; k <= n; k++) {
    // Leave at least one unit for each remaining group.
    for (let j = k; j <= m - (n - k); j++) {
      for (let i = k - 1; i < j; i++) {
        if (dp[k - 1][i] === INF) continue;
        const dev = (prefix[j] - prefix[i] - targets[k - 1]) / scale;
        const cut = j < m ? BONUS * bonus[j - 1] : 0;
        const cost = dp[k - 1][i] + dev * dev - cut;
        if (cost < dp[k][j]) {
          dp[k][j] = cost;
          from[k][j] = i;
        }
      }
    }
  }
  const ends: number[] = [];
  let j = m;
  for (let k = n; k >= 1; k--) {
    ends.unshift(j);
    j = from[k][j];
  }
  return ends;
}

function slices(units: string[], ends: number[]): string[] {
  const out: string[] = [];
  let start = 0;
  for (const end of ends) {
    out.push(units.slice(start, end).join(" "));
    start = end;
  }
  return out;
}

/** Splits the ayah (and its translation) into exactly n passages. */
export function splitIntoPassages(arabic: string, english: string, n: number): Passage[] {
  const ar = arabicUnits(arabic);
  const en = english ? englishUnits(english) : [];
  const count = Math.max(1, Math.min(n, ar.length, en.length || ar.length));
  // Words without base letters still take reading time; count them as one letter.
  const arSizes = ar.map((u) => Math.max(1, arabicLetterCount(u)));
  const arTotal = arSizes.reduce((a, b) => a + b, 0);
  const arEnds = partition(
    arSizes,
    ar.map(waqfBonus),
    new Array(count).fill(arTotal / count)
  );
  const arChunks = slices(ar, arEnds);

  const shares: number[] = [];
  let prev = 0;
  for (const end of arEnds) {
    shares.push(arSizes.slice(prev, end).reduce((a, b) => a + b, 0) / arTotal);
    prev = end;
  }

  let enChunks: string[] = new Array(count).fill("");
  if (en.length > 0) {
    const enSizes = en.map((w) => w.length + 1);
    const enTotal = enSizes.reduce((a, b) => a + b, 0);
    enChunks = slices(en, partition(enSizes, en.map(englishBonus), shares.map((s) => s * enTotal)));
  }

  const passages: Passage[] = [];
  let acc = 0;
  for (let i = 0; i < count; i++) {
    const start = acc;
    acc = i === count - 1 ? 1 : acc + shares[i];
    passages.push({ arabic: arChunks[i], english: enChunks[i], start, end: acc });
  }
  return passages;
}

/** True when the passages reproduce both texts exactly, in order. */
export function passagesReconstruct(arabic: string, english: string, passages: Passage[]): boolean {
  if (passages.length === 0) return false;
  if (passages.map((p) => p.arabic).join(" ") !== arabic) return false;
  if (english && passages.map((p) => p.english).join(" ") !== english) return false;
  if (passages.some((p) => p.arabic === "" || (english && p.english === ""))) return false;
  return passages.every((p, i) => p.start <= p.end && (i === 0 ? p.start === 0 : p.start === passages[i - 1].end));
}

export interface PlanOptions {
  /** Ayahs longer than this many words are shown as several phrases. */
  maxWordsPerPassage?: number;
}

/**
 * Picks the smallest number of passages that keeps each one phrase-sized and
 * lets every passage fit on screen (`fits` measures with the real fonts).
 * Falls back to the whole ayah as one passage if a split ever fails the
 * integrity check, so text is never shown altered.
 */
export function planPassages(
  arabic: string,
  english: string,
  fits: (p: Passage) => boolean,
  options: PlanOptions = {}
): Passage[] {
  const maxWords = options.maxWordsPerPassage ?? 14;
  const units = arabicUnits(arabic).length;
  const limit = Math.max(1, Math.min(units, english ? englishUnits(english).length : units));
  const first = Math.min(limit, units > maxWords ? Math.ceil(units / maxWords) : 1);
  const whole: Passage[] = [{ arabic, english, start: 0, end: 1 }];

  let last: Passage[] = whole;
  for (let n = first; n <= limit; n++) {
    const passages = splitIntoPassages(arabic, english, n);
    if (!passagesReconstruct(arabic, english, passages)) return whole;
    last = passages;
    if (passages.every(fits)) return passages;
  }
  return last;
}

/** Index of the passage being recited at `progress` (0..1) through the ayah. */
export function passageIndexAt(passages: Passage[], progress: number): number {
  for (let i = passages.length - 1; i > 0; i--) {
    if (progress >= passages[i].start) return i;
  }
  return 0;
}
