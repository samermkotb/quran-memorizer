# فاستمعوا له (Listen to Him)

A clean, shareable web app for memorizing Quran recitation. Select any Surah and ayah range, choose a reciter, set repeat options, and share your session with a link.

Visual design follows the فاستمعوا له design system — see [`docs/design-portfolio.md`](docs/design-portfolio.md) for the full Figma-ready specification.

## Features

- **Surah selector** — searchable dropdown with all 114 surahs (Arabic + English)
- **Ayah range** — pick start and end ayah; validated against surah length
- **26 reciters** — horizontally swipeable reciter cards, multiple styles (Murattal / Mujawwad / Muallim), from two structured audio sources
- **Repeat control** — repeat N times or loop infinitely
- **Speed control** — 0.5× to 2× playback rate
- **Repeat pause** — insert a fixed or recitation-length practice pause after each ayah
- **Background-aware playback** — a persistent audio session and lock-screen media controls where supported
- **Per-ayah progress** — dots indicator for up to 20 ayahs; always shows current ayah count
- **Download audio** — download the selected ayah range (or whole surah) as MP3/ZIP for offline listening
- **Shareable links** — click "Share This Session" to copy a URL that restores the exact session
- **Mobile-friendly** — responsive Tailwind CSS design

## Audio Sources

Audio is streamed from two free, publicly available, structured Quran audio CDNs:

- **[EveryAyah.com](https://everyayah.com)** — serves individual ayah MP3s
  (`https://everyayah.com/data/{folder}/{surah}{ayah}.mp3`), loaded sequentially to build
  the segment playlist. Reciters on this source support the full feature set: ayah
  ranges, per-ayah repeat, and pause-after-ayah.
- **[mp3quran.net](https://mp3quran.net)** — serves whole-surah MP3 files only
  (`https://{server}/{surah}.mp3`), via its public reciters API. Reciters on this source
  are marked **"Full Surah Only"** in the reciter picker: ayah-range playback,
  per-ayah repeat, and pause-after-ayah aren't available for them (there are no
  ayah-level files to seek within), so they get a plain full-surah audio player instead
  of the ayah-by-ayah practice engine.

No audio is downloaded or stored automatically. All playback is streamed; audio is only
saved to disk if you explicitly use the Download Audio button.

The player keeps one HTML audio element active for the session. When a repeat pause
is selected, it plays a locally generated silent media segment for the pause rather
than waiting on a background JavaScript timer. This allows the next ayah transition
to be driven by media `ended` events while the screen is locked or the browser is
backgrounded, where supported by the mobile browser and OS. (This applies to
EveryAyah-sourced reciters; mp3quran-sourced reciters use a native browser `<audio>`
element instead, since there's only one file to play.)

## Download Audio

A **Download Audio** button appears next to the Share button once a session is started.
Its behavior depends on the reciter's audio source and the selected ayah range:

- **EveryAyah reciters, single ayah selected** — downloads that one ayah's MP3 directly.
- **EveryAyah reciters, a range of ayahs selected** — fetches each ayah's MP3 (all
  everyayah.com responses are CORS-open, verified) and bundles them into a ZIP built
  entirely client-side (a small dependency-free ZIP writer in `src/lib/zip.ts` — no
  library added, no server involved). This covers both partial ranges and "whole surah"
  downloads for these reciters, since EveryAyah has no single full-surah file to offer.
- **mp3quran reciters ("Full Surah Only")** — downloads the reciter's single full-surah
  MP3 file directly. If a partial ayah range happens to be selected, the button still
  offers the full surah (that's the only file that exists) and shows a note explaining
  the range was widened.
- **Unavailable audio** — if a specific surah is missing from a reciter's mushaf (see
  Islam Sobhi below) or no audio source applies, the button is disabled with a clear
  inline message instead of guessing or faking a URL.

Everything happens in the browser: `fetch()` → `Blob` → (optional client-side ZIP) →
a temporary `<a download>` anchor. There is no backend, no database, and no server-side
processing — the app remains fully static and Vercel-deployable. If a network/CORS
error occurs mid-download, an error message is shown so you can retry rather than silently
failing.

## Legal / Source Policy

- Audio is only ever linked from **public, structured Quran audio APIs/CDNs** —
  currently everyayah.com and mp3quran.net — never scraped from YouTube or any source
  that doesn't clearly permit direct linking/streaming of its files.
- Every reciter folder/server in `src/lib/reciters.ts` was verified with a real HTTP 200
  request before being added; nothing is guessed.
- The app does not merge, re-encode, host, mirror, or redistribute audio — it streams or
  downloads the original files as-is, straight from the source CDN to your browser.
- If a requested reciter can't be verified on a reliable structured source, it's left out
  and documented under "Requested but Unavailable" rather than faked or approximated.

## Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Audio | HTML5 Audio API (programmatic) + native `<audio controls>` (full-surah reciters) |
| Quran Data | Local static dataset (all 114 surahs, hardcoded) |
| Reciters | everyayah.com CDN folders + mp3quran.net full-surah servers |
| Download | Client-side `fetch` + dependency-free ZIP writer (`src/lib/zip.ts`) |

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm / yarn / pnpm

### Install & Run

```bash
cd quran-memorizer
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
npm run build
npm start
```

### Environment Variables

None required. The app uses only public CDN endpoints.

## Deploying to Vercel

```bash
npm install -g vercel
vercel
```

Or push to GitHub and connect the repo at [vercel.com](https://vercel.com). No environment variables needed.

The app is fully static-friendly — the root route (`/`) is pre-rendered at build time.

## Project Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout, metadata
│   ├── page.tsx            # Main page — state management, form
│   └── globals.css         # Tailwind + custom animations
├── components/
│   ├── SurahSelector.tsx   # Searchable surah dropdown
│   ├── ReciterSelector.tsx # Searchable reciter dropdown
│   ├── AudioPlayer.tsx     # Ayah-by-ayah playback engine + UI (everyayah reciters)
│   ├── DownloadButton.tsx  # Download Audio button + progress/error states
│   └── ShareButton.tsx     # URL encoding + clipboard copy
└── lib/
    ├── surahData.ts        # All 114 surahs with ayah counts
    ├── reciters.ts         # Reciter definitions + audio source config
    ├── audioUtils.ts       # URL generation, playlist builder, download planning
    ├── zip.ts              # Dependency-free client-side ZIP writer
    └── shareUtils.ts       # URL encode/decode for shareable links
```

## How to Add More Reciters

**EveryAyah reciters (ayah-by-ayah, full feature set):**

1. Confirm the reciter's folder exists on everyayah.com:
   ```
   https://everyayah.com/data/{FOLDER_NAME}/001001.mp3
   ```
   Check HTTP 200 is returned.

2. Add an entry to `src/lib/reciters.ts`:
   ```ts
   {
     id: "unique-id",
     name: "Full Name",
     arabicName: "الاسم بالعربية",
     style: "Murattal",           // Murattal | Mujawwad | Muallim
     source: "everyayah",
     everyayahFolder: "FOLDER_NAME",
     bitrate: "128kbps",
   }
   ```

**mp3quran reciters (full-surah only):**

1. Look up the reciter and their `moshaf.server` in the public API:
   ```
   https://mp3quran.net/api/v3/reciters?language=eng
   ```
   Confirm `https://{server}/001.mp3` returns HTTP 200.

2. Add an entry to `src/lib/reciters.ts`:
   ```ts
   {
     id: "unique-id",
     name: "Full Name",
     arabicName: "الاسم بالعربية",
     style: "Murattal",
     source: "mp3quran",
     mp3quranServer: "https://serverN.mp3quran.net/xxxx/", // trailing slash
     bitrate: "128kbps",
     // mp3quranMissingSurahs: [ ... ], // if the mushaf skips any surah numbers
   }
   ```

3. Save — the reciter appears in the dropdown immediately (mp3quran reciters are
   automatically labeled "Full Surah Only" and restricted to whole-surah playback/download).

Never guess a folder or server name — always verify HTTP 200 first. If a requested
reciter can't be verified on either source, don't add them; list them under
"Requested but unavailable" instead.

## Verified Reciters

| ID | Name | Style | Source |
|----|------|-------|--------|
| alafasy | Mishary Rashid Alafasy | Murattal | everyayah |
| abdulbasit_murattal | Abdul Basit Abdul Samad (Murattal) | Murattal | everyayah |
| abdulbasit_mujawwad | Abdul Basit Abdul Samad (Mujawwad) | Mujawwad | everyayah |
| husary | Mahmoud Khalil Al-Husary | Murattal | everyayah |
| husary_muallim | Mahmoud Khalil Al-Husary (Muallim) | Muallim | everyayah |
| minshawi_mujawwad | Mohamed Seddiq El-Minshawi (Mujawwad) | Mujawwad | everyayah |
| minshawi_murattal | Mohamed Seddiq El-Minshawi (Murattal) | Murattal | everyayah |
| ghamdi | Saad Al-Ghamdi | Murattal | everyayah |
| shatri | Abu Bakr Al-Shatri | Murattal | everyayah |
| qatami | Nasser Al-Qatami | Murattal | everyayah |
| sudais | Abdul Rahman Al-Sudais | Murattal | everyayah |
| shuraim | Saud Al-Shuraim | Murattal | everyayah |
| maher | Maher Al-Mueaqly | Murattal | everyayah |
| yasser_dossary | Yasser Al-Dossary | Murattal | everyayah |
| al_banna | Mahmoud Ali Al-Banna | Mujawwad | everyayah |
| tunaiji | Khalifa Al-Tunaiji | Murattal | everyayah |
| ayyub | Muhammad Ayyub | Murattal | everyayah |
| **ajmy** | **Ahmad Al-Ajmy** | Murattal | everyayah |
| **islam_sobhi** | **Islam Sobhi** | Murattal | mp3quran (full surah only) |
| **idris_abkar** | **Idris Abkar** | Murattal | mp3quran (full surah only) |
| **bandar_balilah** | **Bandar Balilah** | Murattal | mp3quran (full surah only) |
| **tawfiq_sayegh** | **Tawfiq Al-Sayegh** | Murattal | mp3quran (full surah only) |
| **hatem_alwaer** | **Hatem Farid Al-Waer** | Murattal | mp3quran (full surah only) |
| **raad_alkurdi** | **Raad Al-Kurdi** | Murattal | mp3quran (full surah only) |
| **abdulrashid_sufi** | **Abdul Rashid Sufi** | Murattal | mp3quran (full surah only) |
| **luhaidan** | **Mohamed Al-Luhaidan** | Murattal | mp3quran (full surah only) |

Bold rows were added in this round, verified with `curl -I` for HTTP 200 (and
`access-control-allow-origin: *`, which is what makes client-side download/ZIP possible).
`islam_sobhi`'s mushaf is missing surahs **37, 39, 40, 45, and 65** (verified 404 on
those files) — the app disables streaming/download for those specific surahs for that
reciter and shows an inline message rather than guessing at a substitute URL.

**On `luhaidan` (Mohamed Al-Luhaidan) specifically:** this reciter was requested with
the expectation of full ayah-by-ayah playback/repetition, the app's core feature. Four
structured audio sources were checked, not just mp3quran.net, specifically looking for
a per-ayah (verse-segmented) recording:
- **everyayah.com** (this app's own ayah-by-ayah CDN) — every reciter folder in its
  `recitations.js` index was scanned; no match under any spelling.
- **api.alquran.cloud** audio editions — he is listed (`ar.muhammadalluhaidan`), but
  tagged `type: "surahbysurah"`, not present in their `"versebyverse"` (ayah-level) list
  (which does include e.g. Alafasy, Husary, Sudais).
- **api.quran.com** classic per-ayah audio API — only 12 major reciters total; not
  among them.
- **quranicaudio.com** — verified directly: `.../muhammad_alhaidan/001.mp3` returns
  HTTP 200 (full surah), `.../muhammad_alhaidan/001001.mp3` returns HTTP 404 (no
  ayah-segmented file exists).

No verified ayah-by-ayah recording of this reciter exists on any source checked. Per
the "don't fake it" policy, a full-surah file is **never** sliced into fabricated
per-ayah segments without a verified timing dataset — none exists here. He is
therefore included as **full-surah-only** (like `islam_sobhi`, `idris_abkar`, etc.):
no ayah-range playback, no per-ayah repeat, no pause-after-ayah, and no ayah-range
download. This is enforced the same way as every other `mp3quran`-source reciter —
including in the ayah-recognition preview and Mushaf viewer, which show his ayah text
for reference only and never imply per-ayah audio is available.

## Requested but Unavailable

These reciters were requested but could not be verified on everyayah.com or
mp3quran.net under any reasonable name spelling, so — per the "don't fake it" policy —
they are **not** in the app:

| Requested | Why |
|---|---|
| Bishah Al-Kurdi / Bisha Al-Kurdi | Not found on either source. The Al-Kurdi reciters that do exist there are Raad Al-Kurdi (added) and Peshawa Qadr Al-Kurdi. |
| Magdy Salem | Not found on either source under any spelling checked. |

**Note on Mohamed Siddiq El-Minshawy "new/2026" version:** no distinctly newer or
2026-dated Minshawy release was found on either source. mp3quran.net does host
Minshawy recordings, but their upload dates are 2019–2021 and they're the same
Murattal/Mujawwad/Muallim recordings already represented by the existing verified
`minshawi_murattal` / `minshawi_mujawwad` entries (via everyayah.com, which also
supports full ayah-by-ayah playback — a strictly better fit than mp3quran's
full-surah-only files). No new entry was added to avoid listing an inferior duplicate.

If any of these become available from a verifiable structured source later, add them
following "How to Add More Reciters" above.

## Known Limitations

- **Audio is from public CDNs** — if everyayah.com or mp3quran.net is unreachable or
  rate-limits, audio may fail to load. An error message is shown.
- **No offline support for streaming** — requires internet connection to stream audio;
  use Download Audio to save files for offline listening.
- **Autoplay policy** — some browsers block autoplay without a user gesture. The Play button provides the gesture.
- **Background playback is best effort** — the app keeps one audio session active,
  uses silent media for repetition gaps, and recovers after visibility interruptions.
  Mobile Safari/Chrome or the OS can still suspend playback under device policy.
  This applies to EveryAyah-sourced reciters; mp3quran-sourced reciters use a plain
  native `<audio controls>` element instead.
- **Force-closing cannot be supported** — playback cannot continue if the browser is
  force-quit, the tab is killed by the OS, or the browser app is fully closed.
- **"Full Surah Only" reciters have no ayah-range playback or download** — mp3quran.net
  only exposes one MP3 per surah, so ayah subranges, per-ayah repeat, and
  pause-after-ayah aren't possible for those reciters; only whole-surah listening/download is offered.
- **Download requires the browser to fetch the audio first** — large ranges (e.g. a
  long surah bundled as a ZIP) take longer and use more memory/bandwidth than streaming;
  a progress indicator (`n/total` files fetched) is shown while preparing.

## Testing Background Playback on a Phone

1. Open the deployed app on iPhone Safari or Android Chrome.
2. Choose Surah 36, ayahs 1 through 5, and Mishary Rashid Alafasy.
3. Set repeat count to 3 and pause duration to 10 seconds.
4. Tap Play once, then lock the phone or switch to another app.
5. Confirm playback continues through the silent repeat pause into the next ayah.
6. Unlock or return to the browser and verify the current ayah and repeat count remain correct.

## Suggested Improvements

- Add a waveform visualizer using Web Audio API
- Add translation/tafsir of the selected ayahs (via api.quran.com)
- Progressive Web App (PWA) for mobile home screen installation
- Allow saving favorite sessions in localStorage
- Add Tajweed color-coded text display
- Support multiple audio segments in a single session

## License

MIT
