export type Mode = "adult" | "child";

export interface Theme {
  // Page
  pageBg: string;
  pagePattern: boolean;
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
  dropTrigger: string;
  // Reciter style badge colors
  reciterStyle: Record<string, string>;
  // Reciter carousel card
  reciterCard: string;
  reciterCardActive: string;
  reciterAvatar: string;
  reciterAvatarActive: string;
  // Misc
  isChild: boolean;
  roundCard: string;
}

// ── Adult theme: "فاستمعوا له" dark mode — ink, forest green, aged gold ──────
// Palette + tokens sourced from the فاستمعوا له design system (design-tokens.json).
export const adultTheme: Theme = {
  pageBg: "bg-gradient-to-br from-ink-950 via-ink-900 to-ink-950",
  pagePattern: true,
  card: "bg-ink-900 border border-gold-500/15 shadow-raised rounded-2xl",
  playerCard: "bg-ink-900 border border-gold-500/15 shadow-raised rounded-2xl overflow-hidden",
  label: "text-[#AAA99F] font-semibold",
  muted: "text-[#AAA99F]",
  primary: "text-sand-100",
  accent: "text-gold-500",
  btnPrimary: "bg-gold-500 hover:bg-gold-300 active:bg-gold-500 text-[#18130b] font-bold shadow-lg shadow-black/30",
  btnSecondary: "bg-ink-700 border border-gold-500/20 text-sand-100 hover:bg-ink-800",
  btnStop: "text-[#AAA99F] hover:text-red-500 hover:bg-red-500/10",
  chip: "bg-transparent text-[#AAA99F] border border-sand-200/15 hover:border-gold-500/50",
  chipActive: "bg-gold-500 text-[#17130c] border-gold-500 font-semibold",
  input: "bg-ink-800 border border-sand-200/15 text-sand-100 focus:border-gold-500 placeholder:text-[#6b756f] rounded-xl",
  toggleOn: "bg-gold-500",
  toggleOff: "bg-ink-700",
  pbBg: "bg-ink-700",
  pbFill: "bg-gold-500",
  pb2Fill: "bg-teal-500",
  playerHeader: "bg-[radial-gradient(circle_at_50%_35%,rgba(36,72,62,0.45),transparent_45%)]",
  phPrimary: "text-sand-100",
  phSecondary: "text-[#AAA99F]",
  phDot: "bg-teal-500",
  pauseBanner: "bg-forest-700/20 border border-gold-500/20 rounded-2xl",
  pauseText: "text-gold-300 font-semibold",
  pauseSub: "text-teal-500",
  pauseIconBg: "bg-forest-700/40 text-teal-500",
  pauseBtn: "bg-gold-500/15 text-gold-300 hover:bg-gold-500/25 rounded-lg",
  dot: "bg-gold-500 ring-2 ring-gold-500/30",
  dotDone: "bg-teal-500",
  dotPending: "bg-ink-700",
  chip1: "bg-forest-700/20 text-teal-500 border border-forest-500/30",
  chip2: "bg-gold-500/10 text-gold-300 border border-gold-500/25",
  chip3: "bg-ink-800 text-[#AAA99F] border border-sand-200/10",
  logoBg: "bg-gradient-to-br from-forest-700 to-ink-900",
  logoChar: "text-gold-300",
  titleColor: "text-sand-100",
  subtitleColor: "text-gold-500",
  topBar: "bg-ink-950/90 border-b border-sand-200/10 backdrop-blur-xl",
  modeActive: "bg-ink-700 text-gold-300 font-semibold rounded-lg shadow-sm",
  modeInactive: "text-[#AAA99F] hover:bg-ink-800 rounded-lg",
  langActive: "bg-ink-700 text-gold-300 font-semibold rounded-lg shadow-sm",
  langInactive: "text-[#AAA99F] hover:bg-ink-800 rounded-lg",
  errBox: "bg-red-500/10 border border-red-500/40 text-[#f2a8a3] rounded-lg",
  footer: "text-[#6b756f]",
  footerLink: "text-gold-500 hover:text-gold-300",
  dropdown: "bg-ink-900 border border-gold-500/20 shadow-raised rounded-xl",
  dropItem: "hover:bg-ink-800 text-sand-100",
  dropItemActive: "bg-ink-800",
  dropSearch: "bg-ink-800 border border-sand-200/15 text-sand-100 placeholder:text-[#6b756f] focus:border-gold-500 rounded-lg",
  dropNum: "bg-gold-500/15 text-gold-300",
  dropTrigger: "bg-ink-900 border border-sand-200/15 hover:border-gold-500/40 focus:border-gold-500 rounded-xl",
  reciterStyle: {
    Murattal: "bg-forest-700/25 text-teal-500",
    Mujawwad: "bg-gold-500/15 text-gold-300",
    Muallim: "bg-ink-700 text-[#AAA99F]",
  },
  reciterCard: "bg-ink-900 border border-sand-200/15 hover:border-gold-500/40 rounded-2xl",
  reciterCardActive: "bg-ink-800 border-2 border-gold-500 shadow-raised",
  reciterAvatar: "bg-gradient-to-br from-forest-700 to-ink-800 text-gold-300 ring-1 ring-gold-500/20",
  reciterAvatarActive: "bg-gold-500 text-[#17130c] ring-2 ring-gold-300",
  isChild: false,
  roundCard: "rounded-2xl",
};

// ── Child theme: "فاستمعوا له" light/day mode — sand, forest green, gold ────
// Same brand family as adult mode (not a disconnected palette), just the
// design system's "light" semantic tokens plus larger radii/touch targets.
export const childTheme: Theme = {
  pageBg: "bg-gradient-to-br from-sand-100 via-sand-200/50 to-sand-100",
  pagePattern: false,
  card: "bg-[#FBF7EF] border-2 border-gold-500/30 shadow-xl rounded-3xl",
  playerCard: "bg-[#FBF7EF] border-2 border-gold-500/30 shadow-xl rounded-3xl overflow-hidden",
  label: "text-forest-700 font-bold",
  muted: "text-[#68736D]",
  primary: "text-[#1C2823]",
  accent: "text-gold-500",
  btnPrimary: "bg-gold-500 hover:bg-gold-300 active:bg-gold-500 text-[#2b2110] font-bold shadow-lg shadow-gold-500/25 rounded-3xl text-base",
  btnSecondary: "border-2 border-forest-700/25 text-forest-700 hover:bg-forest-700/5 rounded-3xl",
  btnStop: "text-[#68736D] hover:text-red-500 hover:bg-red-500/10",
  chip: "bg-white text-forest-700 border-2 border-gold-500/25 hover:border-gold-500/60 rounded-3xl",
  chipActive: "bg-gold-500 text-[#2b2110] border-gold-500 rounded-3xl font-bold",
  input: "bg-sand-100 border-2 border-gold-500/25 text-[#1C2823] focus:border-gold-500 placeholder:text-[#a39a86] rounded-3xl",
  toggleOn: "bg-gold-500",
  toggleOff: "bg-[#e4d8c3]",
  pbBg: "bg-sand-200",
  pbFill: "bg-gold-500",
  pb2Fill: "bg-teal-500",
  playerHeader: "bg-[radial-gradient(circle_at_50%_35%,rgba(88,166,154,0.18),transparent_45%)]",
  phPrimary: "text-[#1C2823]",
  phSecondary: "text-forest-700",
  phDot: "bg-teal-500",
  pauseBanner: "bg-gold-500/10 border-2 border-gold-500/30 rounded-3xl",
  pauseText: "text-forest-700 font-bold",
  pauseSub: "text-teal-500",
  pauseIconBg: "bg-gold-500/15 text-gold-500",
  pauseBtn: "bg-forest-700/10 text-forest-700 hover:bg-forest-700/20 rounded-2xl",
  dot: "bg-gold-500 ring-2 ring-gold-300/60",
  dotDone: "bg-teal-500",
  dotPending: "bg-sand-200",
  chip1: "bg-teal-500/10 text-teal-600 border border-teal-500/25",
  chip2: "bg-gold-500/10 text-[#9A722E] border border-gold-500/30",
  chip3: "bg-sand-100 text-forest-700 border border-forest-700/15",
  logoBg: "bg-gradient-to-br from-gold-500 to-gold-300",
  logoChar: "text-[#2b2110]",
  titleColor: "text-forest-700",
  subtitleColor: "text-gold-500",
  topBar: "bg-[#FBF7EF]/95 border-b-2 border-gold-500/15 backdrop-blur-sm",
  modeActive: "bg-gold-500 text-[#2b2110] font-bold rounded-2xl",
  modeInactive: "text-forest-700 hover:bg-gold-500/10 rounded-2xl",
  langActive: "bg-teal-500 text-white font-bold rounded-2xl",
  langInactive: "text-teal-600 hover:bg-teal-500/10 rounded-2xl",
  errBox: "bg-red-500/10 border border-red-500/30 text-red-500 rounded-2xl",
  footer: "text-[#a39a86]",
  footerLink: "text-forest-700 hover:text-gold-500",
  dropdown: "bg-[#FBF7EF] border-2 border-gold-500/25 shadow-xl rounded-2xl",
  dropItem: "hover:bg-gold-500/10 text-[#1C2823]",
  dropItemActive: "bg-gold-500/10",
  dropSearch: "bg-sand-100 border-2 border-gold-500/20 text-[#1C2823] placeholder:text-[#a39a86] focus:border-gold-500 rounded-xl",
  dropNum: "bg-gold-500/15 text-[#9A722E]",
  dropTrigger: "bg-[#FBF7EF] border-2 border-gold-500/25 hover:border-gold-500/50 focus:border-gold-500 rounded-3xl",
  reciterStyle: {
    Murattal: "bg-teal-500/15 text-teal-600",
    Mujawwad: "bg-violet-100 text-violet-700",
    Muallim: "bg-gold-500/15 text-[#9A722E]",
  },
  reciterCard: "bg-[#FBF7EF] border-2 border-gold-500/20 hover:border-gold-500/50 rounded-3xl",
  reciterCardActive: "bg-white border-2 border-gold-500 shadow-xl shadow-gold-500/20",
  reciterAvatar: "bg-gradient-to-br from-gold-300 to-gold-500 text-[#2b2110] ring-1 ring-gold-500/30",
  reciterAvatarActive: "bg-gold-500 text-[#2b2110] ring-2 ring-forest-700/40",
  isChild: true,
  roundCard: "rounded-3xl",
};

export function getTheme(mode: Mode): Theme {
  return mode === "adult" ? adultTheme : childTheme;
}
