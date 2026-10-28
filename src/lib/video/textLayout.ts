// Fits Arabic ayah text into the video's text box: wraps by word, shrinks
// the font down to a readable minimum, and splits very long ayahs into pages
// shown in sequence while that ayah plays.

export interface TextLayout {
  fontSize: number;
  lineHeight: number;
  pages: string[][];
}

const LINE_HEIGHT_RATIO = 1.85;

function wrap(ctx: CanvasRenderingContext2D, words: string[], maxWidth: number): string[] {
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
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

export function layoutText(
  ctx: CanvasRenderingContext2D,
  text: string,
  fontFamily: string,
  maxWidth: number,
  maxHeight: number,
  maxSize = 68,
  minSize = 38
): TextLayout {
  const words = text.trim().split(/\s+/).filter(Boolean);
  let lines: string[] = [];
  let size = maxSize;

  for (size = maxSize; size >= minSize; size -= 2) {
    ctx.font = `${size}px ${fontFamily}`;
    lines = wrap(ctx, words, maxWidth);
    if (lines.length * size * LINE_HEIGHT_RATIO <= maxHeight) {
      return { fontSize: size, lineHeight: size * LINE_HEIGHT_RATIO, pages: [lines] };
    }
  }

  size = minSize;
  ctx.font = `${size}px ${fontFamily}`;
  lines = wrap(ctx, words, maxWidth);
  const lineHeight = size * LINE_HEIGHT_RATIO;
  const perPage = Math.max(1, Math.floor(maxHeight / lineHeight));
  const pages: string[][] = [];
  for (let i = 0; i < lines.length; i += perPage) pages.push(lines.slice(i, i + perPage));
  return { fontSize: size, lineHeight, pages };
}

const ARABIC_DIGITS = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];

export function toArabicDigits(n: number): string {
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
