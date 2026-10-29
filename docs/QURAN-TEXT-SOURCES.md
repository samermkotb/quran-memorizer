# Quran Text, Translation, Font and Timing — Sources & Integrity

The Quran text is release-critical. This file records where every word shown in the app
and in generated videos comes from, how it was verified, and what is (and is not) exact
about its timing.

## Arabic text — Tanzil Uthmani 1.1

- **Source:** Tanzil Quran Text (Uthmani, Version 1.1), Madina Mushaf, Hafs ʿan ʿĀṣim —
  https://tanzil.net. Downloaded 2026-10-29 in the XML form with pause marks, sajdah signs
  and superscript alef enabled, without tatweel or rub-el-hizb signs:
  `https://tanzil.net/pub/download/index.php?quranType=uthmani&outType=xml&marks=true&sajdah=true&alef=true&agree=true`
- **License:** Creative Commons Attribution 3.0, with Tanzil's terms: verbatim copies only
  ("CHANGING IT IS NOT ALLOWED"), the source must be clearly indicated, and tanzil.net must
  be linked. The full notice ships beside the data in `public/quran-text/LICENSE.txt`.
- **How the terms are met:** the text is written out unchanged by
  `scripts/build-quran-data.py`. The XML form keeps the Basmala in a separate attribute,
  so ayah 1 of each surah is exactly the ayah, with nothing stripped. Credits linking to
  tanzil.net appear in the video creator's "Quran text & translation" panel. Every
  generated video carries a burned-in line: *Quran text: Tanzil.net (Uthmani)*.
- **Files:** `public/quran-text/{001..114}.json`, each a JSON array of ayah strings.

### Verification

1. **Independent cross-check.** Every ayah was compared, letter by letter (diacritics and
   orthographic marks removed, alef/hamza seats normalized), against the King Fahd Glorious
   Quran Printing Complex QPC Hafs text from the quran.com API (`text_qpc_hafs`). 6,235 of
   6,236 ayahs match exactly. The one difference, 2:72 *fa-iddāraʾtum*, is the same letters
   with the hamza encoded differently (a combining hamza above in Tanzil, a spacing ء in QPC).
   Three ayahs (15:7, 27:20, 36:22) split one word differently (لَّوْ مَا / لَّوۡمَا,
   مَا لِىَ / مَالِيَ), a known convention difference with identical letters.
2. **Font coverage.** All 69 code points in the text exist in the bundled font's cmap.
3. **Automated tests** (`npm test`, `tests/passages.test.ts`):
   - SHA-256 lock over the 114 files (`b4639ee9…2b18`), so any edit to the text fails CI
   - 6,236 ayahs, with per-surah counts matching `src/lib/surahData.ts`
   - no stray whitespace or direction marks; 1:1 is the Basmala, and no other surah's ayah 1
     starts with it
   - every passage split, for every ayah, joins back to the exact original string

### Why the previous dataset was replaced

The earlier bundle (the "ara-quranuthmanihaf" edition of fawazahmed0/quran-api) had defects:

- spaces inserted after open-tanween marks (U+08F0–U+08F2), splitting words, e.g. `هُدࣰ ى`
  and `رِّزۡقࣰ ا`
- stray U+200F (right-to-left mark) characters in 820 ayahs
- a Basmala fragment glued to the start of 97:1 (`ٱلرَّحِيمِإِنَّآ …`)

Its letters otherwise matched Tanzil, but text with altered word boundaries is not acceptable.

## English translation — Pickthall (1930)

- **Translation:** Mohammed Marmaduke Pickthall, *The Meaning of the Glorious Koran* (1930).
- **Status:** Public domain. The translator died in 1936, so life + 70 years ran out in 2007.
  Works first published in 1930 entered the U.S. public domain on 1 January 2026.
- **Digital text:** Tanzil.net, `en.pickthall` (txt-2), copied verbatim. It was cross-checked
  against a second copy (fawazahmed0/quran-api `eng-mohammedmarmadu`): 0 word differences
  across 6,236 verses. Source notes are in `public/quran-translation/en-pickthall/SOURCE.txt`.
- **Files:** `public/quran-translation/en-pickthall/{001..114}.json`, SHA-256 locked in tests.
- **Why not Saheeh International:** it is a copyrighted translation (Abul-Qasim Publishing
  House / Al-Muntada Al-Islami) with no published license that permits bundling it in an
  app, so it was not used. No translation text is generated, paraphrased or edited by AI or
  by this app.
- **Presentation:** English always sits below the Arabic, in a smaller face (≤ 0.42× the
  Arabic size, 19–27 px) and a dimmer color, so it stays secondary.

## Quran font — Amiri Quran 1.003

- **Font:** Amiri Quran 1.003 by Khaled Hosny, https://github.com/aliftype/amiri (release
  1.003). SIL Open Font License 1.1 (`src/fonts/AmiriQuran-OFL.txt`).
- **Bundling:** converted losslessly from TTF to WOFF2 (`src/fonts/AmiriQuran-1.003.woff2`,
  62 KB) and loaded with `next/font/local`, so it is served from the app's own origin with
  no runtime or build-time font download.
- **Why not KFGQPC Uthmanic Hafs:** its redistribution terms could not be confirmed as
  permitting bundling, so it was not used. Amiri Quran is a Mushaf-style naskh designed for
  Quran text and was verified to cover every character in the bundled text.
- **Rendering:** the video canvas draws with `direction = "rtl"` and the same font, so the
  browser's shaping engine joins letters and stacks diacritics and Quranic marks. Lines use
  1.8× leading so stacked marks never collide.

## Passages and timing in the video

- **Splitting.** Ayahs longer than about 14 words, or too long to fit the text box at a
  readable size, are shown as several passages. Arabic is cut only between words. Pause
  marks (ۖ ۗ ۚ ۛ ۘ) and the sajdah sign (۩), which Tanzil writes as separate tokens, stay
  attached to their word, and cuts prefer the stronger pause marks (and avoid ۙ, "do not
  stop"). The English is cut at the punctuation nearest to the same proportion. The text
  is never cropped, abbreviated or re-spaced: if a split ever failed to rebuild the exact
  ayah, the whole ayah would be shown instead.
- **What is exact:**
  - *Ayah-by-ayah reciters (everyayah.com):* each ayah is a separate audio file, so each
    ayah appears exactly when its recitation starts and leaves when it ends.
  - *Full-surah reciters (mp3quran.net):* there is no timing data, so the video shows the
    surah title rather than guessing which ayah is being recited (unchanged behavior).
- **What is approximate:** passage changes *within* an ayah. No verified word-level timing
  exists for these recordings, so each passage's share of the ayah's audio is estimated from
  its share of the Arabic letters. The English split is approximate in the same way. The UI
  says so ("the timing within an ayah is approximate").

## Duration before rendering

- For each ayah file, the first 4 KB is fetched with an HTTP Range request. everyayah.com
  files carry a LAME "Info" header, so the exact frame count and the encoder delay and padding
  give the exact playback length (it matches ffprobe to the millisecond on the files tested).
  This is labelled "Measured from the audio files".
- If a file has no frame count, its length comes from its size and bitrate (HEAD
  Content-Length), labelled "Approximate". This is the normal case for the mp3quran.net
  full-surah files, and the fallback when a browser needs a CORS preflight for the Range
  request, which mp3quran's redirect would block.
- If neither works, a letter-count estimate scaled from the measured ayahs (or a nominal
  pace) is labelled "Rough estimate".
- The total goes through the renderer's own `buildTimeline()`, so speed, repeats, pauses
  (including "match"), intro and outro are all counted. Results are cached per file for the
  session. Header reads stop as soon as the selection is known to exceed the 10-minute cap,
  and Create Video is disabled when a measured or approximate length is over it. The renderer
  still enforces the cap while downloading.
