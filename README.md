# Quran Memorizer

A clean, shareable web app for memorizing Quran recitation. Select any Surah and ayah range, choose a reciter, set repeat options, and share your session with a link.

## Features

- **Surah selector** — searchable dropdown with all 114 surahs (Arabic + English)
- **Ayah range** — pick start and end ayah; validated against surah length
- **14 reciters** — multiple styles (Murattal / Mujawwad / Muallim)
- **Repeat control** — repeat N times or loop infinitely
- **Speed control** — 0.5× to 2× playback rate
- **Per-ayah progress** — dots indicator for up to 20 ayahs; always shows current ayah count
- **Shareable links** — click "Share This Session" to copy a URL that restores the exact session
- **Mobile-friendly** — responsive Tailwind CSS design

## Audio Source

Audio is streamed from [EveryAyah.com](https://everyayah.com) — a free, publicly available Quran audio CDN. Individual ayah MP3s are loaded sequentially to build the segment playlist.

No audio is downloaded or stored. All playback is streamed.

## Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Audio | HTML5 Audio API (programmatic) |
| Quran Data | Local static dataset (all 114 surahs, hardcoded) |
| Reciters | everyayah.com CDN folders |

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
│   ├── AudioPlayer.tsx     # Playback engine + UI
│   └── ShareButton.tsx     # URL encoding + clipboard copy
└── lib/
    ├── surahData.ts        # All 114 surahs with ayah counts
    ├── reciters.ts         # Reciter definitions + CDN folder names
    ├── audioUtils.ts       # URL generation, playlist builder, formatTime
    └── shareUtils.ts       # URL encode/decode for shareable links
```

## How to Add More Reciters

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
     everyayahFolder: "FOLDER_NAME",
     bitrate: "128kbps",
   }
   ```

3. Save — the reciter appears in the dropdown immediately.

## Verified Reciters

| ID | Name | Style |
|----|------|-------|
| alafasy | Mishary Rashid Alafasy | Murattal |
| abdulbasit_murattal | Abdul Basit Abdul Samad (Murattal) | Murattal |
| abdulbasit_mujawwad | Abdul Basit Abdul Samad (Mujawwad) | Mujawwad |
| husary | Mahmoud Khalil Al-Husary | Murattal |
| husary_muallim | Mahmoud Khalil Al-Husary (Muallim) | Muallim |
| minshawi_mujawwad | Mohamed Seddiq El-Minshawi (Mujawwad) | Mujawwad |
| minshawi_murattal | Mohamed Seddiq El-Minshawi (Murattal) | Murattal |
| ghamdi | Saad Al-Ghamdi | Murattal |
| shatri | Abu Bakr Al-Shatri | Murattal |
| qatami | Nasser Al-Qatami | Murattal |
| sudais | Abdul Rahman Al-Sudais | Murattal |
| shuraim | Saud Al-Shuraim | Murattal |
| maher | Maher Al-Mueaqly | Murattal |

## Known Limitations

- **Audio is from a public CDN** — if everyayah.com is unreachable or rate-limits, audio may fail to load. An error message is shown.
- **No offline support** — requires internet connection to stream audio.
- **Speed control** — changes take effect on the next ayah load (browser limitation with programmatic Audio).
- **Autoplay policy** — some browsers block autoplay without a user gesture. The Play button provides the gesture.

## Suggested Improvements

- Add a waveform visualizer using Web Audio API
- Add translation/tafsir of the selected ayahs (via api.quran.com)
- Progressive Web App (PWA) for mobile home screen installation
- Allow saving favorite sessions in localStorage
- Add Tajweed color-coded text display
- Support multiple audio segments in a single session

## License

MIT
