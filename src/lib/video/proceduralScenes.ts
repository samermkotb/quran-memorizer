// Original procedural backgrounds (app artwork, no external footage).
// Each scene is a pure function of (canvas size, time in seconds), so the same
// code renders the video frames and the static picker thumbnails.

type Ctx = CanvasRenderingContext2D;

/** Small deterministic PRNG so every render of a scene looks identical. */
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface Bird {
  x0: number; // 0..1 starting position across the sky
  y: number; // 0..1 vertical position
  size: number; // px at 720-wide reference
  speed: number; // fraction of width per second
  flap: number; // wingbeats per second
  phase: number;
}

const birds: Bird[] = (() => {
  const rand = mulberry32(7);
  const flock: Bird[] = [];
  // Three loose V-shaped flocks at different depths, plus a few stragglers.
  const flocks = [
    { cx: 0.15, cy: 0.22, size: 15, speed: 0.022, count: 9 },
    { cx: 0.6, cy: 0.34, size: 10, speed: 0.016, count: 7 },
    { cx: 0.35, cy: 0.12, size: 7, speed: 0.012, count: 6 },
  ];
  for (const f of flocks) {
    for (let i = 0; i < f.count; i++) {
      const side = i % 2 === 0 ? 1 : -1;
      const rank = Math.ceil(i / 2);
      flock.push({
        x0: f.cx - rank * 0.035 + rand() * 0.01,
        y: f.cy + side * rank * 0.018 + rand() * 0.006,
        size: f.size * (0.85 + rand() * 0.3),
        speed: f.speed,
        flap: 1.6 + rand() * 0.8,
        phase: rand() * Math.PI * 2,
      });
    }
  }
  for (let i = 0; i < 4; i++) {
    flock.push({
      x0: rand(),
      y: 0.08 + rand() * 0.35,
      size: 6 + rand() * 5,
      speed: 0.01 + rand() * 0.01,
      flap: 1.8 + rand(),
      phase: rand() * Math.PI * 2,
    });
  }
  return flock;
})();

export function drawBirdsScene(ctx: Ctx, w: number, h: number, t: number): void {
  const scale = w / 720;

  // Calm dawn sky: deep blue at the top, warm light near the horizon.
  const sky = ctx.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, "#1d3557");
  sky.addColorStop(0.45, "#457b9d");
  sky.addColorStop(0.78, "#e9c9a0");
  sky.addColorStop(1, "#f4dcb8");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);

  // Soft sun glow low on the horizon.
  const sunX = w * 0.68;
  const sunY = h * 0.8;
  const glow = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, w * 0.7);
  glow.addColorStop(0, "rgba(255,236,200,0.85)");
  glow.addColorStop(0.25, "rgba(255,220,170,0.35)");
  glow.addColorStop(1, "rgba(255,220,170,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, w, h);

  // Slowly drifting wisps of cloud.
  ctx.save();
  for (let i = 0; i < 5; i++) {
    const y = h * (0.15 + i * 0.13);
    const drift = ((t * (6 + i * 2) * scale + i * 260 * scale) % (w + 600 * scale)) - 300 * scale;
    const g = ctx.createRadialGradient(drift, y, 0, drift, y, 260 * scale);
    g.addColorStop(0, `rgba(255,255,255,${0.14 - i * 0.015})`);
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(drift, y, 300 * scale, 50 * scale, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // Distant hills silhouette.
  ctx.fillStyle = "rgba(36,28,22,0.55)";
  ctx.beginPath();
  ctx.moveTo(0, h);
  for (let x = 0; x <= w; x += 8) {
    const y = h * 0.9 - Math.sin(x / (170 * scale)) * 22 * scale - Math.sin(x / (63 * scale) + 1.3) * 9 * scale;
    ctx.lineTo(x, y);
  }
  ctx.lineTo(w, h);
  ctx.closePath();
  ctx.fill();

  // Bird silhouettes: two curved wings flapping around a small body.
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  for (const b of birds) {
    const span = 1.4; // wrap distance, in widths
    const xn = ((b.x0 + t * b.speed) % span + span) % span - 0.2;
    const x = xn * w;
    const y = b.y * h + Math.sin(t * 0.6 + b.phase) * 6 * scale;
    const s = b.size * scale;
    const beat = Math.sin(t * b.flap * Math.PI * 2 + b.phase);
    const lift = beat * s * 0.55;
    ctx.strokeStyle = `rgba(30,24,20,${0.55 + Math.min(0.35, b.size / 40)})`;
    ctx.lineWidth = Math.max(1.2, s * 0.16);
    ctx.beginPath();
    ctx.moveTo(x - s, y - lift);
    ctx.quadraticCurveTo(x - s * 0.45, y - s * 0.35 - lift * 0.3, x, y);
    ctx.quadraticCurveTo(x + s * 0.45, y - s * 0.35 - lift * 0.3, x + s, y - lift);
    ctx.stroke();
  }
}

/** Points of an eight-pointed star (two squares rotated 45°), centered at (cx, cy). */
function starPath(ctx: Ctx, cx: number, cy: number, r: number, inner: number) {
  ctx.beginPath();
  for (let i = 0; i < 16; i++) {
    const a = (Math.PI / 8) * i - Math.PI / 2;
    const rr = i % 2 === 0 ? r : r * inner;
    const x = cx + Math.cos(a) * rr;
    const y = cy + Math.sin(a) * rr;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
}

export function drawGeometricScene(ctx: Ctx, w: number, h: number, t: number): void {
  const scale = w / 720;

  const bg = ctx.createLinearGradient(0, 0, 0, h);
  bg.addColorStop(0, "#16223b");
  bg.addColorStop(0.55, "#1e4b44");
  bg.addColorStop(1, "#16342f");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  const cell = 150 * scale;
  const breathe = 1 + Math.sin(t * 0.35) * 0.04;
  const rotation = t * 0.02;

  ctx.save();
  ctx.translate(w / 2, h / 2);
  ctx.rotate(rotation);
  ctx.scale(breathe, breathe);

  const reach = Math.hypot(w, h) / 2 / breathe + cell;
  const n = Math.ceil(reach / cell);
  for (let gy = -n; gy <= n; gy++) {
    for (let gx = -n; gx <= n; gx++) {
      const cx = gx * cell;
      const cy = gy * cell;
      // Gentle travelling shimmer across the lattice.
      const wave = 0.5 + 0.5 * Math.sin(t * 0.8 - (gx + gy) * 0.45);
      ctx.strokeStyle = `rgba(217,181,99,${0.22 + wave * 0.3})`;
      ctx.lineWidth = 1.6 * scale;
      starPath(ctx, cx, cy, cell * 0.42, 0.72);
      ctx.stroke();
      // Inner rosette.
      ctx.strokeStyle = `rgba(233,205,139,${0.12 + wave * 0.22})`;
      ctx.lineWidth = 1.1 * scale;
      starPath(ctx, cx, cy, cell * 0.22, 0.6);
      ctx.stroke();
      // Small cross-shaped links between stars, completing the lattice.
      ctx.strokeStyle = `rgba(217,181,99,${0.12 + wave * 0.12})`;
      ctx.beginPath();
      ctx.moveTo(cx + cell * 0.42, cy);
      ctx.lineTo(cx + cell * 0.58, cy);
      ctx.moveTo(cx, cy + cell * 0.42);
      ctx.lineTo(cx, cy + cell * 0.58);
      ctx.stroke();
      // Diamond at the lattice junction.
      const jx = cx + cell / 2;
      const jy = cy + cell / 2;
      const d = cell * 0.12;
      ctx.strokeStyle = `rgba(217,181,99,${0.15 + wave * 0.2})`;
      ctx.beginPath();
      ctx.moveTo(jx, jy - d);
      ctx.lineTo(jx + d, jy);
      ctx.lineTo(jx, jy + d);
      ctx.lineTo(jx - d, jy);
      ctx.closePath();
      ctx.stroke();
    }
  }
  ctx.restore();

  // Vignette keeps the center calm for the text.
  const vig = ctx.createRadialGradient(w / 2, h / 2, w * 0.2, w / 2, h / 2, h * 0.75);
  vig.addColorStop(0, "rgba(10,14,20,0)");
  vig.addColorStop(1, "rgba(10,14,20,0.6)");
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, w, h);
}

export function drawProceduralScene(
  scene: "birds" | "geometric",
  ctx: Ctx,
  w: number,
  h: number,
  t: number
): void {
  if (scene === "birds") drawBirdsScene(ctx, w, h, t);
  else drawGeometricScene(ctx, w, h, t);
}
