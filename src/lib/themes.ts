export type Mode = "adult" | "child";

export interface Theme {
  // Page
  pageBg: string;
  // Cards
  card: string;
  playerCard: string;
  // Text
  label: string;
  muted: string;
  primary: string;
  accent: string;
  // Buttons
  btnPrimary: string;
  btnSecondary: string;
  btnStop: string;
  transportPlay: string;
  // Chips (speed / pause toggles)
  chip: string;
  chipActive: string;
  // Form inputs
  input: string;
  // Toggle switch
  toggleOn: string;
  toggleOff: string;
  // Progress bars
  pbBg: string;
  pbFill: string;
  pb2Fill: string;
  // Player header
  playerHeader: string;
  phPrimary: string;
  phSecondary: string;
  phDot: string;
  // Pause banner
  pauseBanner: string;
  pauseText: string;
  pauseSub: string;
  pauseIconBg: string;
  pauseBtn: string;
  // Ayah dots
  dot: string;
  dotDone: string;
  dotPending: string;
  // Info chips (surah type, ayah count, etc.)
  chip1: string;
  chip2: string;
  chip3: string;
  // Logo / header
  logoBg: string;
  logoChar: string;
  titleColor: string;
  subtitleColor: string;
  // TopBar
  topBar: string;
  modeActive: string;
  modeInactive: string;
  langActive: string;
  langInactive: string;
  // Error
  errBox: string;
  // Footer
  footer: string;
  footerLink: string;
  // Dropdown / sheet
  dropdown: string;
  dropItem: string;
  dropItemActive: string;
  dropSearch: string;
  dropNum: string;
  dropNumActive: string;
  dropTrigger: string;
  // Reciter style badge colors
  reciterStyle: Record<string, string>;
  // Reciter carousel card
  reciterAvatar: string;
  reciterCardActive: string;
  reciterCheck: string;
  // Misc
  isChild: boolean;
  roundCard: string;
  // Ayah-recognition preview (inline text under Start/End Ayah)
  ayahPreviewBox: string;
  ayahPreviewText: string;
  ayahPreviewLabel: string;
  // Mushaf viewer panel (expandable ayah-by-ayah reading/selection list)
  mushafRowInRange: string;
  mushafRowBoundary: string;
  mushafBoundaryBadge: string;
}

// Rotating per-card accent covers — the reference's signature "accent per
// mushaf edition / reciter" pattern (navy → teal → plum → slate → ink),
// identical regardless of adult/child mode since it identifies the
// reciter, not the app's own theme.
export const RECITER_ACCENTS = [
  "bg-[linear-gradient(155deg,#1F3350,#241C16_150%)]",
  "bg-[linear-gradient(155deg,#1E4B44,#241C16_150%)]",
  "bg-[linear-gradient(155deg,#4A3A55,#241C16_150%)]",
  "bg-[linear-gradient(155deg,#2F4759,#241C16_150%)]",
];

// ── فاستمعوا له v2 — exact palette from quran-app-design-system-v2.html ────
// Mocha/taupe header, parchment canvas, ink text, aged gold as the single
// CTA/selection color. Adult and Child share every token except the
// "primary hue" (navy for Adult, teal for Child) — the same kind of
// accent-per-item differentiation the reference itself uses for mushaf
// editions and reciters, applied here to the two modes.
export const adultTheme: Theme = {
  pageBg: "bg-parchment-50",
  card: "bg-parchment-100 border border-mocha-300 shadow-card rounded-[18px]",
  playerCard: "bg-parchment-100 border border-mocha-300 shadow-card rounded-[18px] overflow-hidden",
  label: "text-mocha-500 font-semibold",
  muted: "text-mocha-500",
  primary: "text-ink-900",
  accent: "text-gold-600",
  btnPrimary: "bg-navy-700 hover:brightness-110 text-parchment-50 font-bold shadow-card",
  btnSecondary: "bg-transparent border-[1.5px] border-gold-600 text-mocha-900 hover:bg-gold-600/10",
  btnStop: "text-mocha-500 hover:text-red-600 hover:bg-red-600/10",
  transportPlay: "bg-gold-600 text-ink-900 shadow-lift",
  chip: "bg-parchment-100 text-ink-900 border border-mocha-300 hover:border-navy-700",
  chipActive: "bg-gold-600 text-ink-900 border-transparent font-semibold",
  input: "bg-parchment-100 border border-mocha-300 text-ink-900 focus:border-gold-600 placeholder:text-mocha-500 rounded-[12px]",
  toggleOn: "bg-gold-600",
  toggleOff: "bg-mocha-300",
  pbBg: "bg-mocha-300",
  pbFill: "bg-gold-600",
  pb2Fill: "bg-teal-700",
  playerHeader: "bg-[linear-gradient(155deg,#1E6B45,#241C16_165%)]",
  phPrimary: "text-white",
  phSecondary: "text-white/75",
  phDot: "bg-success-500",
  pauseBanner: "bg-gold-300/25 border border-gold-400/50 rounded-[18px]",
  pauseText: "text-ink-900 font-semibold",
  pauseSub: "text-mocha-500",
  pauseIconBg: "bg-gold-400/30 text-ink-900",
  pauseBtn: "bg-gold-600 text-ink-900 hover:brightness-105 rounded-[8px]",
  dot: "bg-gold-600 ring-2 ring-gold-300",
  dotDone: "bg-success-500",
  dotPending: "bg-mocha-300",
  chip1: "bg-navy-700/10 text-navy-700 border border-navy-700/25",
  chip2: "bg-gold-600/10 text-gold-600 border border-gold-600/30",
  chip3: "bg-parchment-100 text-mocha-500 border border-mocha-300",
  logoBg: "bg-[radial-gradient(circle_at_30%_20%,#1F3350,#241C16_130%)]",
  logoChar: "text-parchment-50",
  titleColor: "text-parchment-50",
  subtitleColor: "text-gold-400",
  topBar: "bg-mocha-900 border-b border-mocha-700",
  modeActive: "bg-navy-700 text-parchment-50 font-semibold rounded-full",
  modeInactive: "text-mocha-500 hover:text-ink-900 rounded-full",
  langActive: "bg-gold-600 text-ink-900 font-semibold rounded-full",
  langInactive: "text-parchment-50/70 hover:text-parchment-50 rounded-full",
  errBox: "bg-red-600/10 border border-red-600/30 text-red-700 rounded-[12px]",
  footer: "text-mocha-500",
  footerLink: "text-navy-700 hover:text-gold-600",
  dropdown: "bg-parchment-100 border border-mocha-300 shadow-card rounded-[18px]",
  dropItem: "hover:bg-parchment-300 text-ink-900",
  dropItemActive: "bg-gold-600/10 border-s-[3px] border-s-gold-600",
  dropSearch: "bg-parchment-100 border-[1.5px] border-gold-600 text-ink-900 placeholder:text-mocha-500 shadow-[0_0_0_3px_rgba(185,143,53,0.16)] rounded-[12px]",
  dropNum: "bg-navy-700 text-parchment-50",
  dropNumActive: "bg-gold-600 text-ink-900",
  dropTrigger: "bg-parchment-100 border border-mocha-300 hover:border-navy-700 focus:border-navy-700 rounded-[12px]",
  reciterStyle: {
    Murattal: "bg-success-500 text-white",
    Mujawwad: "bg-purple-600 text-white",
    Muallim: "bg-white/20 text-white",
  },
  reciterAvatar: "bg-white/15 border-2 border-white/35 text-white",
  reciterCardActive: "outline outline-2 outline-gold-600 outline-offset-2",
  reciterCheck: "bg-white text-navy-700",
  isChild: false,
  roundCard: "rounded-[12px]",
  ayahPreviewBox: "bg-parchment-50 border border-gold-600/40 rounded-[12px]",
  ayahPreviewText: "text-ink-900 font-quran",
  ayahPreviewLabel: "text-mocha-500",
  mushafRowInRange: "bg-gold-600/10",
  mushafRowBoundary: "bg-gold-600/20 border border-gold-600/50",
  mushafBoundaryBadge: "bg-gold-600 text-ink-900",
};

export const childTheme: Theme = {
  ...adultTheme,
  btnPrimary: "bg-teal-700 hover:brightness-110 text-parchment-50 font-bold shadow-card",
  logoBg: "bg-[radial-gradient(circle_at_30%_20%,#1E4B44,#241C16_130%)]",
  modeActive: "bg-teal-700 text-parchment-50 font-semibold rounded-full",
  footerLink: "text-teal-700 hover:text-gold-600",
  dropNum: "bg-teal-700 text-parchment-50",
  dropTrigger: "bg-parchment-100 border border-mocha-300 hover:border-teal-700 focus:border-teal-700 rounded-[12px]",
  reciterCheck: "bg-white text-teal-700",
  isChild: true,
};

export function getTheme(mode: Mode): Theme {
  return mode === "adult" ? adultTheme : childTheme;
}
