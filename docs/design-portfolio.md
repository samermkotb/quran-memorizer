# فاستمعوا له — Design Portfolio & Figma-Ready Specification

> **Visual direction source (v2 — current)**: the implemented UI's colors, typography,
> and component styling are taken exactly from `quran-app-design-system-v2.html`, a
> local Claude-generated design system artifact — a warm, Mushaf-inspired palette
> (taupe/mocha header, parchment canvas, per-item accent covers in navy/teal/plum/slate,
> and aged gold as the single CTA/selection color). This **supersedes** an earlier
> ink/forest/gold "dark mode" direction explored in a prior iteration of this app; every
> hex value below comes directly from that v2 file, not from the earlier direction.
> This document is **not** a Figma file — it is the specification a designer needs to
> rebuild the system in Figma accurately, plus documentation of how it was implemented
> in this codebase.

## 1. Product overview

**فاستمعوا له** ("Listen to Him") is a static, installable web app for memorizing Quran
recitation. A user picks a Surah and ayah range, chooses a reciter, configures repeat
count / pause-between-ayahs / playback speed, and listens — with the option to download
the audio for offline use or share the exact session as a link. The app is bilingual
(Arabic-first, full English interface) and has two experiences: an **Adult** mode and a
simplified, illustrated **Child** mode, sharing one visual language.

### Target users

- **Adult memorizers (حفّاظ)** building or reviewing memorization, who want fast,
  low-friction control over repetition and pacing, in Arabic or English, on mobile.
- **Parents/teachers** setting up a listening session for a child, then handing over a
  simplified, encouraging interface.
- **Children** learning to recognize and repeat short ayahs, guided by large touch
  targets, illustration, and minimal choices on screen at once.

### Core user journeys

1. **Start a session**: pick Surah → pick reciter → (optionally narrow ayah range) →
   set repeat/pause/speed → *Start Listening* → the player takes over.
2. **Practice loop**: listen to an ayah, get an on-screen "your turn to repeat" pause
   banner, repeat aloud, tap *Skip* (or let the timed pause elapse) to continue.
3. **Take it offline**: download the selected range (single ayah, or a ZIP of a range)
   for offline listening.
4. **Share a session**: copy a link that restores the exact Surah/ayah range/reciter/
   repeat/pause/speed configuration for someone else to open.
5. **Switch context**: toggle Adult ⇄ Child mode, or English ⇄ Arabic (RTL), at any time
   without losing the current session configuration.

## 2. Design principles

Derived from the v2 reference's own stated direction ("not near-black-and-gold" —
a warm printed-Mushaf palette, not a generic dark app theme) and applied throughout:

1. **Arabic-first, fully bilingual** — Arabic reads right-to-left as the primary
   experience; English is a complete, first-class alternative, not an afterthought.
2. **Calm over busy** — one primary action per screen state, progressive disclosure
   (advanced settings — repeat/pause/speed — sit below the essentials, not competing
   with them), muted mocha secondary text, a single accent color (aged gold) reserved
   for the thing that matters most right now.
3. **Three fonts, three jobs** — Noto Naskh Arabic (calligraphic) is reserved for the
   brand wordmark and reciter-avatar initials only; Amiri Quran (recitation-grade
   script) is reserved for actual Quranic/proper-noun Arabic text (surah and reciter
   names); Cairo (clean geometric sans) handles everything else. The three never mix
   within one element.
4. **Accent per item, not one flat theme** — the reference's signature pattern (each
   Mushaf edition gets its own cover-inspired accent — navy, teal, plum, slate) is
   applied to reciter cards: cards rotate through the same four accents instead of one
   flat color, so each reciter reads as a distinct "edition."
5. **Same brand, two moods** — Adult and Child modes share the identical parchment/
   mocha/gold palette and every component; the only difference is the "primary hue"
   (navy for Adult, teal for Child — two of the same four reference accents), plus
   Child mode's larger touch targets and illustrations — not a different app.
6. **Accessible by default** — 44px minimum touch targets, visible focus rings, real
   keyboard navigation, RTL-correct logical spacing (start/end, not left/right), reduced
   motion support.
7. **Words, not abbreviations** — anywhere the UI previously might reduce a name to a
   single initial, it instead shows the first whole word ("Mishary", "مشاري"), because a
   letter doesn't identify a person and a word does.

## 3. Color palette (exact values from quran-app-design-system-v2.html)

| Token | Hex | Usage |
|---|---|---|
| `mocha-900` | `#3B2E29` | App bar / header background (both modes) |
| `mocha-700` | `#5B4A42` | (primitive; reserved) |
| `mocha-500` | `#8A7368` | Muted/secondary text, borders' text pairing |
| `mocha-300` | `#B9A99C` | Default borders, inactive toggle track |
| `parchment-50` | `#F4EAD3` | Page canvas background; text-on-dark (app bar, cards) |
| `parchment-100` | `#ECE1C6` | Card / surface background |
| `parchment-300` | `#D8CBA6` | Hover background for list rows / chips |
| `ink-900` | `#241C16` | Primary text; text-on-gold |
| `navy-700` | `#1F3350` | **Adult mode's primary hue** — CTA button, mode-active pill, logo glow, reciter-card accent #1 |
| `navy-900` | `#16223B` | (gradient end reference; app uses `ink-900` as the actual gradient stop) |
| `teal-700` | `#1E4B44` | **Child mode's primary hue** — same roles as navy-700 in Child mode; reciter-card accent #2 |
| `teal-900` | `#16342F` | (primitive; reserved) |
| `plum-700` | `#4A3A55` | Reciter-card accent #3 |
| `plum-900` | `#372A40` | (primitive; reserved) |
| `slate-700` | `#2F4759` | Reciter-card accent #4 |
| `slate-900` | `#233544` | (primitive; reserved) |
| `gold-600` | `#B98F35` | **Universal CTA/selection color** — chip-active, transport play, focus rings, selected-card outline, gold badge |
| `gold-400` | `#D9B563` | Tagline text on the dark app bar |
| `gold-300` | `#E9CD8B` | Pause-banner tint |
| `success-700` | `#1E6B45` | Now-Playing gradient start (live/playing state, not identity) |
| `success-500` | `#2E9B63` | Now-Playing live dot; "Murattal" style tag; done-ayah dot |
| `purple-600` | `#7A4FB0` | "Mujawwad" style tag |
| `page-border` / `page-bg` | `#16889A` / `#EFF6F0` | Reserved for a future literal Quran-reading page surface (not yet used in the app UI) |

Semantic mapping used in this app: **canvas, card, ink, muted, gold, borders, success,
and purple are identical between Adult and Child** — the only difference is the
"primary hue" used for the main CTA button, mode-active pill, and logo glow: **navy for
Adult, teal for Child** (two of the same four reciter-card accents). See
`src/lib/themes.ts` (`adultTheme` / `childTheme`).

## 4. Typography

| Role | Font | Weight | Used for |
|---|---|---:|---|
| Wordmark | **Noto Naskh Arabic** | 700 | Brand name "فاستمعوا له", app-bar/hero logo glyph, reciter-avatar initials |
| Ayah / proper names | **Amiri Quran** (fallback: Scheherazade New, serif) | 400 | Surah Arabic names, reciter Arabic names — anywhere real Arabic proper-noun text appears |
| UI | **Cairo** | 400 / 500 / 600 / 700 / 800 | Everything else: labels, buttons, body copy, numerals |

Loaded via `next/font/google` in `src/app/layout.tsx` (`Cairo`, `Amiri_Quran`,
`Noto_Naskh_Arabic`), exposed as CSS variables `--font-ui` / `--font-quran` /
`--font-wordmark` and Tailwind utilities `font-ui` / `font-quran` / `font-wordmark`
(registered in `src/app/globals.css`'s `@theme` block).

Note: production Quran verse text should ultimately use the true Uthmanic Hafs
Madinah-mushaf typeface — the reference itself flags that this isn't distributed on
Google Fonts and needs self-hosting under its own license. Amiri Quran remains the
closest freely-licensed substitute until that's sourced.

## 5. Spacing, radius, shadows, breakpoints

- **Space scale**: 8, 12, 16, 24px (reference's `--sp-sm/md/lg/xl`)
- **Radius scale**: sm 8px, md 12px, lg 18px, xl 24px, full (pill) — implemented as
  Tailwind arbitrary values (`rounded-[12px]`, `rounded-[18px]`) since the exact px
  values don't line up with Tailwind's default named scale
- **Shadows**: `shadow-card` = `0 14px 34px -14px rgba(59,46,41,.35), 0 2px 6px
  rgba(59,46,41,.18)` (cards, panels); `shadow-lift` = `0 20px 40px -16px
  rgba(59,46,41,.45)` (the floating transport play button) — both registered as
  Tailwind utilities in `@theme`
- **Breakpoints**: Tailwind's default `sm` (640px) is used for the mobile-sheet ⇄
  desktop-modal switch in `SurahSelector`
- **Minimum touch target**: 44×44px on every interactive control

## 6. Component inventory

Adapted from the reference `component-inventory.csv`, mapped to this codebase:

| Component | Variants / states | Implementation |
|---|---|---|
| Action/Button | Primary, Secondary, Ghost-like (chip), Disabled, Loading | `theme.btnPrimary` / `theme.btnSecondary`, used in the Start/Update button, `DownloadButton`, `ShareButton` |
| Selection/SegmentedControl | 2-item | Mode toggle (Adult/Child), Language toggle (EN/AR) in `page.tsx` |
| Selection/Chip | Default, Selected | Speed chips, pause chips, quick-range chips (`theme.chip` / `theme.chipActive`) |
| Selection/SearchPicker | Surah (bottom sheet/modal), Reciter (card carousel) | `SurahSelector` (sheet/modal), `ReciterSelector` (carousel — see §8) |
| Session/Range | From/To validated pair | Ayah range inputs in `page.tsx`, validated in `update()` |
| Session/RepeatPause | Adult/Child defaults, never silently overwritten | Repeat count + infinite toggle + pause chips |
| Session/Speed | Preset chips | Speed chip row (0.5×–2×) |
| Player/NowPlaying | Idle/Loading/Playing/Paused/Buffering/Error | `AudioPlayer`'s hero section |
| Player/Transport | Previous/Play-Pause/Next | `AudioPlayer` transport row (78px main button desktop-equivalent) |
| Player/Progress | Time + Ayah | Progress bar + ayah dots in `AudioPlayer` |
| Action/Download | Ready/Preparing/Progress/Complete/Error | `DownloadButton` (unchanged logic, restyled) |
| Action/Share | Native/Copy fallback | `ShareButton` (unchanged logic, restyled) |
| Navigation/AppBar | Desktop/Mobile | Sticky app bar in `page.tsx`: brand mark + wordmark + language toggle |
| Display/ReciterAvatar | First-word monogram | New — see §8 |

## 7. Screen-by-screen guidance

- **Home / session builder** (`page.tsx`): app bar → (Child mode only) illustrated
  greeting → session builder card in order **Mode → Surah → Reciter → Ayah range →
  Repeat/Pause → Speed → Start/Update**. This order was chosen (over the pre-redesign
  order) because selecting a full-surah-only reciter locks the ayah range, so reciter
  selection logically belongs before it.
- **Reciter carousel** (`ReciterSelector.tsx`): a horizontally swipeable row of cards,
  one per reciter, with a compact search field above it. See §8.
- **Player** (`AudioPlayer.tsx`): a "Now Playing" hero (live dot, decorative waveform,
  surah medallion, Quran-font Arabic surah name, English name, reciter + repeat count),
  ayah progress (counter, progress bar, per-ayah dots for ranges ≤20 ayahs), a pause
  banner when a practice pause is active, and transport controls.
- **Full-surah-only player**: reciters whose only source is a single whole-surah file
  (`source: "mp3quran"`) get a plain native `<audio>` element instead of the ayah-by-ayah
  engine — this is a real technical constraint (no per-ayah files exist to seek within),
  not a design choice, and is explained in-UI via `fullSurahOnlyNote`.

## 8. Reciter carousel — detailed spec

Replaces the previous dropdown as the **primary** reciter-selection UI.

- **Layout**: CSS `scroll-snap-type: x mandatory` row, no carousel library/dependency.
  Native touch swipe on mobile; mouse-wheel/trackpad horizontal scroll on desktop.
- **Card contents**: avatar, Arabic name, English/transliterated name, recitation style
  badge (Murattal/Mujawwad/Muallim), bitrate badge, and a "Full Surah Only" badge when
  the reciter's only source is `mp3quran` (i.e. ayah-range playback isn't available for
  them). All 25 currently-supported reciters and their source restrictions are
  preserved unchanged (`src/lib/reciters.ts` was not modified).
- **Accent rotation**: each card's background cycles through the same four
  navy/teal/plum/slate → ink-900 diagonal gradients used for the reference's mushaf
  library, by index (`RECITER_ACCENTS` in `src/lib/themes.ts`) — so adjacent reciters
  are visually distinct "editions," exactly the reference's signature pattern, not a
  single flat card color.
- **Selected state**: gold outline (`outline-2 outline-gold-600`) + a white circle with
  a navy (Adult) / teal (Child) checkmark icon, fading in — matching the reference's
  `.sheikh-card--sel` / `.sheikh-card__check` exactly (the check icon always uses the
  theme's primary hue, regardless of which of the four accents the card itself has).
- **Interaction**:
  - Touch: native scroll-snap swipe.
  - Pointer: click/tap any card to select it.
  - Keyboard: roving `tabIndex` (only the selected — or first — card is tab-reachable),
    Arrow-forward/Arrow-back move focus one card at a time (direction-aware: swapped in
    RTL so "forward" always feels natural), Home/End jump to the first/last card, and
    native `<button>` semantics give Enter/Space activation for free.
  - Search: a compact always-visible search field above the carousel filters the cards
    in place by Arabic or English/transliterated name — the cards remain the primary
    selector; search narrows them, it never replaces them with a plain list.
- **Avatar / first-word rule**: no reciter photos are scraped, hotlinked, or fabricated.
  Each avatar is a translucent white circle (`bg-white/15`, matching the reference's
  `.sheikh-card__avatar`) showing the reciter's **first name word** in the active locale
  (e.g. "Mishary" in English, "مشاري" in Arabic) in the wordmark font — never a
  single-letter initial. This is implemented once via a small `firstWord()` helper in
  `ReciterSelector.tsx` so the rule is trivial to reuse anywhere else a compact reciter
  label is needed.
- **Data not fabricated**: the design reference's mockup shows a reciter's home country
  as card metadata; this app's data model doesn't carry verified per-reciter location
  data, so it isn't shown, to avoid misattributing nationality. Only verified fields
  (style, bitrate, source) are displayed.

## 9. Adult theme

Warm parchment canvas, mocha app bar, ink text, aged-gold CTAs/selection — with
**navy-700** as the primary hue (main "Start Listening"/"Update Player" button,
mode-active pill, logo glow). Defined in `src/lib/themes.ts` → `adultTheme`.

## 10. Child theme

Byte-identical palette to Adult mode (same parchment canvas, card, ink text, gold
accent, borders) — the only difference is **teal-700** as the primary hue instead of
navy-700, plus larger reciter-card radii (`rounded-3xl` vs `rounded-2xl`, driven by
`theme.isChild` in `ReciterSelector.tsx`) and the existing hand-drawn
`ChildIllustrations` characters (reading Quran, cross-legged, from behind) kept exactly
as they were — no illustration work was needed or changed. Defined in
`src/lib/themes.ts` → `childTheme` (spreads `adultTheme` and overrides only the
hue-dependent fields).

## 11. Accessibility

- Every interactive control is ≥44×44px.
- Visible focus rings (`focus-visible:ring-2 ring-gold-500` on the reciter carousel;
  native focus outlines elsewhere via Tailwind's Preflight + browser defaults).
- Full keyboard support: Tab through all controls; reciter carousel supports Arrow/Home/
  End roving navigation; Surah/Reciter pickers support Escape-to-close with focus
  returned to the trigger button.
- RTL and LTR are both first-class: `dir` is set at the document root based on locale
  (`AppContext`), and logical Tailwind properties (`ps-`/`pe-`/`start-`/`end-`) are used
  instead of physical `pl-`/`pr-`/`left-`/`right-` wherever direction-sensitivity
  matters.
- `prefers-reduced-motion: reduce` disables/shortens all animations and smooth-scroll
  globally (`globals.css`).
- Body text uses ink-900 on parchment-50/100 (high contrast); the app bar's white/gold
  text sits on mocha-900 (also high contrast); gold-600 is only ever used for large/bold
  text, icons, and fills — not small body copy — since gold-on-parchment contrast is
  moderate rather than AAA-level.

## 12. Feature-to-component mapping (current app capabilities)

| Capability | Where it lives | Status |
|---|---|---|
| Surah + ayah range selection | `SurahSelector.tsx`, ayah range inputs in `page.tsx` | Preserved, restyled |
| Reciter selection (25 reciters, 2 audio sources) | `ReciterSelector.tsx`, `src/lib/reciters.ts` | Preserved, rebuilt as carousel |
| Audio playback engine (ayah-by-ayah, silent-gap pauses, media session) | `AudioPlayer.tsx`, `src/lib/audioUtils.ts` | Preserved, logic untouched |
| Repeat count / infinite loop | `page.tsx`, `AudioPlayer.tsx` | Preserved |
| Pause after ayah (fixed or "match duration") | `page.tsx`, `AudioPlayer.tsx` | Preserved |
| Playback speed | `page.tsx`, `AudioPlayer.tsx` | Preserved |
| Background playback / lock-screen controls | `AudioPlayer.tsx` (Media Session API) | Preserved |
| Download audio (single ayah / ZIP range) | `DownloadButton.tsx`, `src/lib/audioUtils.ts`, `src/lib/zip.ts` | Preserved, restyled |
| Shareable links | `ShareButton.tsx`, `src/lib/shareUtils.ts` | Preserved — URL format unchanged, backward compatible |
| Arabic/English interface | `src/lib/i18n.ts`, `AppContext` | Preserved |
| Adult/Child mode | `src/lib/themes.ts`, `AppContext` | Preserved, both redesigned |
| PWA / mobile web | `public/manifest.json`, `layout.tsx` metadata | Preserved, renamed |

## 13. Figma Frame Plan

For a designer rebuilding this system in Figma, create one file
(`فاستمعوا له — Product Design System`) with frames for:

1. **Mobile home screen** (390×844) — Adult mode, app bar + session builder card,
   collapsed/default state.
2. **Mobile reciter carousel** (390×844) — session builder scrolled to the reciter
   field, 2–3 cards visible, one mid-swipe/partially off-screen to communicate
   scrollability, search field focused state.
3. **Mobile player + repeat controls** (390×844) — Now-Playing hero, progress + ayah
   dots, pause banner active state, transport controls.
4. **Child mode** (390×844) — illustrated greeting header, session builder in the light
   palette, large touch targets called out with a spacing overlay.
5. **Adult mode** (390×844 and 1024×768) — dark palette at both a mobile and a
   tablet/desktop width, to document the responsive reflow (single column → the
   existing `max-w-2xl` centered column widens but doesn't reflow to multi-column,
   matching the app's actual responsive behavior).
6. **Arabic RTL screens** — home + player, `dir="rtl"`, annotated to show logical
   spacing (start/end) versus what would be visually mirrored (e.g. the medallion and
   avatar art itself, which is not mirrored, only layout is).
7. **English LTR screens** — the same two screens in English for direct comparison.
8. **Empty / loading / error states** — reciter search with no results
   (`noReciters`), Surah search with no results (`noSurahs`), audio loading (spinner
   main-button state), audio error banner (`audioError` / `playBlocked`), download
   error/progress states, mp3quran-source "surah unavailable" state.

Each frame should be built from the component set in §6, using the Auto-Layout
properties and states described in the original reference's `figma-spec.md` (Variant/
State/Size properties per component), with the palette from §3 wired up as Figma
Variables in Dark/Light modes matching Adult/Child.
