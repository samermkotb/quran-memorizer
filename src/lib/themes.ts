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
  // Dropdown
  dropdown: string;
  dropItem: string;
  dropItemActive: string;
  dropSearch: string;
  dropNum: string;
  dropTrigger: string;
  // Reciter style badge colors
  reciterStyle: Record<string, string>;
  // Misc
  isChild: boolean;
  roundCard: string;
}

// ── Adult theme: Kaaba black + Madinah gold-green ─────────────────────────────
export const adultTheme: Theme = {
  pageBg: "bg-gradient-to-br from-neutral-950 via-emerald-950 to-neutral-950",
  pagePattern: true,
  card: "bg-neutral-900/95 border border-yellow-700/25 shadow-2xl shadow-black/60 rounded-2xl",
  playerCard: "bg-neutral-900 border border-yellow-700/25 shadow-2xl shadow-black/60 rounded-2xl overflow-hidden",
  label: "text-yellow-200 font-semibold",
  muted: "text-neutral-500",
  primary: "text-yellow-50",
  accent: "text-yellow-400",
  btnPrimary: "bg-yellow-600 hover:bg-yellow-500 active:bg-yellow-400 text-neutral-950 font-bold shadow-lg shadow-yellow-900/40",
  btnSecondary: "border-2 border-yellow-700/40 text-yellow-400 hover:bg-yellow-900/20 hover:border-yellow-600/60",
  btnStop: "text-neutral-500 hover:text-red-400 hover:bg-red-950/50",
  chip: "bg-neutral-800 text-neutral-300 border border-neutral-700 hover:border-yellow-600/50",
  chipActive: "bg-yellow-600 text-neutral-950 border-yellow-600",
  input: "bg-neutral-800 border-2 border-yellow-700/25 text-yellow-50 focus:border-yellow-500 placeholder:text-neutral-600 rounded-xl",
  toggleOn: "bg-yellow-600",
  toggleOff: "bg-neutral-700",
  pbBg: "bg-neutral-700",
  pbFill: "bg-yellow-500",
  pb2Fill: "bg-emerald-500",
  playerHeader: "bg-gradient-to-r from-green-900 via-neutral-900 to-green-900",
  phPrimary: "text-yellow-100",
  phSecondary: "text-emerald-400",
  phDot: "bg-emerald-500",
  pauseBanner: "bg-green-950/80 border border-yellow-700/30 rounded-xl",
  pauseText: "text-yellow-300 font-semibold",
  pauseSub: "text-emerald-400",
  pauseIconBg: "bg-green-900 text-emerald-400",
  pauseBtn: "bg-yellow-900/40 text-yellow-400 hover:bg-yellow-900/70 rounded-lg",
  dot: "bg-yellow-500 ring-2 ring-yellow-900",
  dotDone: "bg-emerald-600",
  dotPending: "bg-neutral-700",
  chip1: "bg-green-950 text-emerald-400 border border-emerald-800/40",
  chip2: "bg-yellow-950/60 text-yellow-400 border border-yellow-800/40",
  chip3: "bg-neutral-800 text-neutral-400 border border-neutral-700",
  logoBg: "bg-yellow-600",
  logoChar: "text-neutral-950",
  titleColor: "text-yellow-100",
  subtitleColor: "text-emerald-400",
  topBar: "bg-neutral-950/95 border-b border-yellow-700/20 backdrop-blur-sm",
  modeActive: "bg-yellow-600 text-neutral-950 font-semibold rounded-lg",
  modeInactive: "text-yellow-500 hover:bg-neutral-800 rounded-lg",
  langActive: "bg-yellow-600 text-neutral-950 font-semibold rounded-lg",
  langInactive: "text-yellow-500 hover:bg-neutral-800 rounded-lg",
  errBox: "bg-red-950/80 border border-red-800 text-red-300 rounded-lg",
  footer: "text-neutral-600",
  footerLink: "text-yellow-700 hover:text-yellow-500",
  dropdown: "bg-neutral-900 border border-yellow-700/30 shadow-2xl shadow-black/60 rounded-xl",
  dropItem: "hover:bg-green-950/60 text-yellow-100",
  dropItemActive: "bg-green-950/80",
  dropSearch: "bg-neutral-800 border border-neutral-700 text-yellow-50 placeholder:text-neutral-600 focus:border-yellow-600 rounded-lg",
  dropNum: "bg-yellow-900/50 text-yellow-400",
  dropTrigger: "bg-neutral-800 border-2 border-yellow-700/25 hover:border-yellow-600/60 focus:border-yellow-500 rounded-xl",
  reciterStyle: {
    Murattal: "bg-green-950 text-emerald-400",
    Mujawwad: "bg-purple-950 text-purple-400",
    Muallim: "bg-orange-950 text-orange-400",
  },
  isChild: false,
  roundCard: "rounded-2xl",
};

// ── Child theme: warm teal + amber + rose — Islamic garden palette ─────────────
export const childTheme: Theme = {
  pageBg: "bg-gradient-to-br from-amber-50 via-teal-50 to-rose-50",
  pagePattern: false,
  card: "bg-white border-2 border-teal-200 shadow-xl rounded-3xl",
  playerCard: "bg-white border-2 border-teal-300 shadow-xl rounded-3xl overflow-hidden",
  label: "text-teal-700 font-bold",
  muted: "text-teal-400",
  primary: "text-teal-900",
  accent: "text-amber-500",
  btnPrimary: "bg-gradient-to-r from-orange-400 to-rose-400 hover:from-orange-500 hover:to-rose-500 active:from-orange-600 active:to-rose-600 text-white font-bold shadow-lg shadow-orange-200 rounded-2xl text-base",
  btnSecondary: "border-2 border-teal-300 text-teal-600 hover:bg-teal-50 rounded-2xl",
  btnStop: "text-teal-300 hover:text-red-500 hover:bg-red-50",
  chip: "bg-white text-teal-600 border-2 border-teal-200 hover:border-teal-400 rounded-2xl",
  chipActive: "bg-teal-500 text-white border-teal-500 rounded-2xl",
  input: "bg-teal-50 border-2 border-teal-200 text-teal-900 focus:border-teal-500 placeholder:text-teal-300 rounded-2xl",
  toggleOn: "bg-teal-500",
  toggleOff: "bg-gray-200",
  pbBg: "bg-teal-100",
  pbFill: "bg-teal-500",
  pb2Fill: "bg-amber-400",
  playerHeader: "bg-gradient-to-r from-orange-400 via-rose-400 to-pink-400",
  phPrimary: "text-white",
  phSecondary: "text-orange-100",
  phDot: "bg-white",
  pauseBanner: "bg-amber-50 border-2 border-amber-300 rounded-3xl",
  pauseText: "text-teal-700 font-bold",
  pauseSub: "text-teal-500",
  pauseIconBg: "bg-amber-100 text-amber-500",
  pauseBtn: "bg-teal-100 text-teal-600 hover:bg-teal-200 rounded-2xl",
  dot: "bg-amber-400 ring-2 ring-amber-200",
  dotDone: "bg-teal-400",
  dotPending: "bg-teal-100",
  chip1: "bg-teal-50 text-teal-700 border border-teal-200 rounded-full",
  chip2: "bg-amber-50 text-amber-700 border border-amber-200 rounded-full",
  chip3: "bg-rose-50 text-rose-700 border border-rose-200 rounded-full",
  logoBg: "bg-gradient-to-br from-orange-400 to-rose-400",
  logoChar: "text-white",
  titleColor: "text-teal-800",
  subtitleColor: "text-amber-600",
  topBar: "bg-white border-b-2 border-teal-100 shadow-sm",
  modeActive: "bg-teal-500 text-white font-bold rounded-2xl",
  modeInactive: "text-teal-500 hover:bg-teal-50 rounded-2xl",
  langActive: "bg-amber-500 text-white font-bold rounded-2xl",
  langInactive: "text-amber-600 hover:bg-amber-50 rounded-2xl",
  errBox: "bg-red-50 border border-red-200 text-red-600 rounded-2xl",
  footer: "text-teal-300",
  footerLink: "text-teal-500 hover:text-teal-700",
  dropdown: "bg-white border-2 border-teal-200 shadow-xl rounded-2xl",
  dropItem: "hover:bg-teal-50 text-teal-900",
  dropItemActive: "bg-teal-50",
  dropSearch: "bg-teal-50 border border-teal-200 text-teal-900 placeholder:text-teal-300 focus:border-teal-500 rounded-xl",
  dropNum: "bg-teal-100 text-teal-600",
  dropTrigger: "bg-white border-2 border-teal-200 hover:border-teal-400 focus:border-teal-500 rounded-2xl",
  reciterStyle: {
    Murattal: "bg-teal-100 text-teal-700",
    Mujawwad: "bg-violet-100 text-violet-700",
    Muallim: "bg-amber-100 text-amber-700",
  },
  isChild: true,
  roundCard: "rounded-3xl",
};

export function getTheme(mode: Mode): Theme {
  return mode === "adult" ? adultTheme : childTheme;
}
