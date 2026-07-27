# فاستمعوا له — Design Portfolio & Figma-Ready Specification

> **Visual direction source**: this specification and the implemented UI are derived
> from a Claude Design reference ("Quranic app interface redesign" — Claude Design
> project `1eea0b85-7629-43ba-b6f4-b5634e40dede`), cross-checked against an
> independently exported copy of the same design package. It is **not** a Figma file —
> it is the specification a designer needs to rebuild the system in Figma accurately,
> plus documentation of how it was implemented in this codebase.

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

Derived from the design reference's stated direction ("more holy, simple, and
motivating") and applied throughout:

1. **Arabic-first, fully bilingual** — Arabic reads right-to-left as the primary
   experience; English is a complete, first-class alternative, not an afterthought.
2. **Calm over busy** — one primary action per screen state, progressive disclosure
   (advanced settings — repeat/pause/speed — sit below the essentials, not competing
   with them), muted secondary text, a single accent color (gold) reserved for the
   thing that matters most right now.
3. **Quran text gets its own voice** — Amiri Quran (serif, Quranic calligraphic
   register) is reserved for Quranic/Arabic-name display text; Cairo (a clean, modern
   Arabic+Latin sans) handles all UI chrome, so the two never compete.
4. **Gentle, non-literal geometry** — a very low-opacity gold lattice/star motif in the
   background, never a busy or literal illustration competing with content.
5. **Same brand, two moods** — Adult and Child modes share one palette family and one
   set of components; Child mode differs by being lighter, warmer, larger-touch-target,
   and illustrated — not a different app.
6. **Accessible by default** — 44px minimum touch targets, visible focus rings, real
   keyboard navigation, RTL-correct logical spacing (start/end, not left/right), reduced
   motion support.
7. **Words, not abbreviations** — anywhere the UI previously might reduce a name to a
   single initial, it instead shows the first whole word ("Mishary", "مشاري"), because a
   letter doesn't identify a person and a word does.

## 3. Color palette (exact values)

| Token | Hex | Usage |
|---|---|---|
| `ink-950` | `#101512` | Adult mode page background |
| `ink-900` | `#171E1B` | Adult mode surface / cards |
| `ink-800` | `#1D2723` | Adult mode raised surface (inputs, active segment) |
| `ink-700` | `#25322D` | Adult mode borders/track backgrounds |
| `forest-700` | `#24483E` | Support green — logo mark, glows, dark-mode accents |
| `forest-500` | `#397365` | Support green — light-mode accent text |
| `gold-500` | `#C9A55A` | **Primary accent** — primary buttons, selected states, links |
| `gold-300` | `#EAD29B` | Accent text on dark surfaces (labels, active segment text) |
| `sand-100` | `#F5EFE3` | Adult-mode primary text; Child-mode page background |
| `sand-200` | `#E8DCC4` | Child-mode secondary surfaces/borders |
| `teal-500` | `#58A69A` | "Live/active" state — now-playing dot, secondary progress fill |
| `red-500` | `#D66B64` | Danger/error |
| `#AAA99F` | — | Dark-mode muted/secondary text |
| `#68736D` | — | Light-mode muted/secondary text |
| `#FBF7EF` | — | Child-mode card surface |

Semantic mapping used in this app: **Adult = dark set** (ink background, gold accent,
forest support), **Child = light set** (sand background, forest-green text, gold
accent) — i.e., the design system's "dark" and "light" modes map onto this app's
existing Adult/Child modes rather than being a separate, third toggle. See
`src/lib/themes.ts`.

## 4. Typography

| Style | Font | Weight | Notes |
|---|---|---:|---|
| UI text | **Cairo** | 400 / 500 / 600 / 700 / 800 | All chrome: labels, buttons, body copy, numerals |
| Quranic/display Arabic | **Amiri Quran** (fallback: Scheherazade New, serif) | 400 | Surah Arabic names, brand mark glyph, Now-Playing hero |

Loaded via `next/font/google` in `src/app/layout.tsx` (`Cairo`, `Amiri_Quran`), exposed
as CSS variables `--font-ui` / `--font-quran` and Tailwind utilities `font-ui` /
`font-quran` (registered in `src/app/globals.css`'s `@theme` block).

Scale (reference `figma-spec.md`, used as guidance — implemented with the app's
existing `text-xs`…`text-4xl` Tailwind scale rather than a bespoke one):

| Style | Size / line |
|---|---:|
| Display/Hero | 64/76 (48/58 mobile) |
| Heading/H1 | 48/58 |
| Heading/H2 | 32/42 |
| Heading/H3 | 20/30 |
| Body/Default | 16/27 |
| Label/Default | 14/22 |
| Meta/Small | 12/18 |
| Quran/Display | 36/72 |
| Quran/Inline | 22/44 |

## 5. Spacing, radius, breakpoints

- **Space scale**: 4, 8, 12, 16, 24, 32, 48, 64px
- **Radius scale**: sm 8px, md 12px, lg 20px, xl 28px, full (pill) — implemented with
  Tailwind's `rounded-lg`/`rounded-xl`/`rounded-2xl`/`rounded-3xl`/`rounded-full`
- **Shadow**: `0 24px 70px rgba(0,0,0,.35)` dark, `0 24px 70px rgba(47,42,31,.13)` light
  — Tailwind utility `shadow-raised` (registered in `@theme`)
- **Breakpoints**: 600px (mobile → tablet), 900px (tablet → desktop), 1240px (content
  max width) — implemented with Tailwind's default `sm`/`md`/`lg` breakpoints, close
  enough in practice that no custom breakpoint config was introduced
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
- **Selected state**: gold ring/border + filled gold checkmark badge + `aria-selected`.
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
  Each avatar is a locally rendered rounded badge showing the reciter's **first name
  word** in the active locale (e.g. "Mishary" in English, "مشاري" in Arabic), in the UI
  font, on a gold/forest gradient — never a single-letter initial. This is implemented
  once via a small `firstWord()` helper in `ReciterSelector.tsx` so the rule is trivial
  to reuse anywhere else a compact reciter label is needed.
- **Data not fabricated**: the design reference's mockup shows a reciter's home country
  as card metadata; this app's data model doesn't carry verified per-reciter location
  data, so it isn't shown, to avoid misattributing nationality. Only verified fields
  (style, bitrate, source) are displayed.

## 9. Adult theme

Dark, reverent, uncluttered: ink background, gold primary accent, forest-green support,
teal for "live/active" states (the now-playing dot, secondary progress fills), a very
low-opacity gold geometric lattice in the page background. Defined in
`src/lib/themes.ts` → `adultTheme`.

## 10. Child theme

Light and warm — sand background, forest-green text, the same gold accent as Adult mode
(same brand, not a disconnected palette), larger radii (`rounded-3xl` throughout),
bigger touch targets, and the existing hand-drawn `ChildIllustrations` characters
(reading Quran, cross-legged, from behind) kept exactly as they were — no illustration
work was needed or changed. A gold/teal segmented-control distinction (gold for mode,
teal for language) preserves a bit of the original playful variety within the new
palette. Defined in `src/lib/themes.ts` → `childTheme`.

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
- Dark and light (Adult/Child) palettes were chosen from the design system's own
  WCAG-AA-oriented semantic tokens (gold-on-ink and forest-on-sand both meet AA for
  normal text at the sizes used).

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
