// Fits one passage (an Arabic chunk with its English translation beneath it)
// into the video's text box. Lines wrap only between whole words. Arabic wraps
// on arabicUnits(), so a pause mark always stays on the line of its word. The
// font shrinks to a readable minimum. If a passage still doesn't fit,
// layoutPassage returns null and the caller splits the ayah into more passages
// (see passages.ts) instead of cropping or dropping text.

import { arabicUnits, englishUnits } from "./passages";

export interface PassageLayout {
  arabicSize: number;
  arabicLineHeight: number;
  arabicLines: string[];
  englishSize: number;
  englishLineHeight: number;
  englishLines: string[];
  /** Space between the Arabic block and the English block. */
  gap: number;
  height: number;
}

export interface PassageFonts {
  quran: string;
  ui: string;
}

// Quran text needs tall leading so stacked marks (shadda + vowel, small high
// letters, pause signs) never touch the line above.
const ARABIC_LINE_HEIGHT = 1.8;
const ENGLISH_LINE_HEIGHT = 1.38;
const ARABIC_MAX = 64;
const ARABIC_MIN = 36;

export const arabicFont = (size: number, family: string) => `${size}px ${family}`;
export const englishFont = (size: number, family: string) => `400 ${size}px ${family}`;

/** English stays visually secondary: well under half the Arabic size. */
function englishSizeFor(arabicSize: number): number {
  return Math.max(19, Math.min(27, Math.round(arabicSize * 0.42)));
}

/** Greedy word wrap. Returns null if a single word is wider than the line. */
function wrap(ctx: CanvasRenderingContext2D, words: string[], maxWidth: number): string[] | null {
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    if (ctx.measureText(word).width > maxWidth) return null;
    const candidate = line ? `${line} ${word}` : word;
    if (line && ctx.measureText(candidate).width > maxWidth) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function measure(
  ctx: CanvasRenderingContext2D,
  arabic: string,
  english: string,
  fonts: PassageFonts,
  maxWidth: number,
  arabicSize: number
): PassageLayout | null {
  ctx.save();
  ctx.direction = "rtl";
  ctx.font = arabicFont(arabicSize, fonts.quran);
  const arabicLines = wrap(ctx, arabicUnits(arabic), maxWidth);
  ctx.direction = "ltr";
  const englishSize = englishSizeFor(arabicSize);
  ctx.font = englishFont(englishSize, fonts.ui);
  const englishLines = english ? wrap(ctx, englishUnits(english), maxWidth) : [];
  ctx.restore();
  if (!arabicLines || !englishLines) return null;

  const arabicLineHeight = arabicSize * ARABIC_LINE_HEIGHT;
  const englishLineHeight = englishSize * ENGLISH_LINE_HEIGHT;
  const gap = englishLines.length ? Math.round(arabicSize * 0.35) : 0;
  return {
    arabicSize,
    arabicLineHeight,
    arabicLines,
    englishSize,
    englishLineHeight,
    englishLines,
    gap,
    height: arabicLines.length * arabicLineHeight + gap + englishLines.length * englishLineHeight,
  };
}

/**
 * Largest layout of the passage that fits the box, or null if it doesn't fit
 * even at the minimum size. With `force`, returns the minimum-size layout
 * regardless (only used when a passage can't be split any further).
 */
export function layoutPassage(
  ctx: CanvasRenderingContext2D,
  arabic: string,
  english: string,
  fonts: PassageFonts,
  maxWidth: number,
  maxHeight: number,
  force = false
): PassageLayout | null {
  for (let size = ARABIC_MAX; size >= ARABIC_MIN; size -= 2) {
    const layout = measure(ctx, arabic, english, fonts, maxWidth, size);
    if (layout && layout.height <= maxHeight) return layout;
  }
  if (!force) return null;
  return (
    measure(ctx, arabic, english, fonts, maxWidth, ARABIC_MIN) ?? {
      // A single word wider than the box: show it on its own line anyway.
      arabicSize: ARABIC_MIN,
      arabicLineHeight: ARABIC_MIN * ARABIC_LINE_HEIGHT,
      arabicLines: arabicUnits(arabic),
      englishSize: englishSizeFor(ARABIC_MIN),
      englishLineHeight: englishSizeFor(ARABIC_MIN) * ENGLISH_LINE_HEIGHT,
      englishLines: english ? [english] : [],
      gap: english ? 12 : 0,
      height: maxHeight,
    }
  );
}

const ARABIC_DIGITS = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];

export function toArabicDigits(n: number | string): string {
  return String(n).replace(/\d/g, (d) => ARABIC_DIGITS[Number(d)]);
}

/** Resolve the actual (next/font hashed) family name behind a Tailwind font class. */
export function resolveFontFamily(className: string, fallback: string): string {
  if (typeof document === "undefined") return fallback;
  const el = document.createElement("span");
  el.className = className;
  el.style.position = "absolute";
  el.style.visibility = "hidden";
  document.body.appendChild(el);
  const family = getComputedStyle(el).fontFamily;
  el.remove();
  return family || fallback;
}
