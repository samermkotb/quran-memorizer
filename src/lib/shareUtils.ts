import { PlayerState } from "@/types";

export function encodeShareUrl(state: PlayerState): string {
  const params = new URLSearchParams({
    s: String(state.surahNumber),
    a: String(state.startAyah),
    b: String(state.endAyah),
    r: state.reciterId,
    n: String(state.repeatCount),
    i: state.infiniteRepeat ? "1" : "0",
    sp: String(state.speed),
  });
  if (state.pauseAfterAyah !== 0) params.set("p", String(state.pauseAfterAyah));
  return `?${params.toString()}`;
}

export function decodeShareUrl(search: string): Partial<PlayerState> {
  const params = new URLSearchParams(search);
  const result: Partial<PlayerState> = {};

  const s = params.get("s");
  if (s) result.surahNumber = parseInt(s, 10);

  const a = params.get("a");
  if (a) result.startAyah = parseInt(a, 10);

  const b = params.get("b");
  if (b) result.endAyah = parseInt(b, 10);

  const r = params.get("r");
  if (r) result.reciterId = r;

  const n = params.get("n");
  if (n) result.repeatCount = parseInt(n, 10);

  const i = params.get("i");
  if (i) result.infiniteRepeat = i === "1";

  const sp = params.get("sp");
  if (sp) result.speed = parseFloat(sp);

  const p = params.get("p");
  if (p) result.pauseAfterAyah = parseInt(p, 10);

  return result;
}
