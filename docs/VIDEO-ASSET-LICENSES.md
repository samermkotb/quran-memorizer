# Video Creator — Background Asset Sources & Licenses

This is the repository record for the 20 built-in backgrounds used by the video creator.
The in-app picker and credits read from `src/lib/video/backgrounds.ts`, so keep this file
and that manifest in sync.

**Policy.** Only legally reusable assets are used: CC0, U.S. federal public domain, CC BY,
or original app artwork. Each license was read from the file page's own license template on
Wikimedia Commons (`action=raw`), not inferred from search results. Nothing was scraped from
YouTube or stock sites. YouTube-sourced "CC BY" re-uploads were rejected because their
ownership is unclear.

**Content policy.** Scenes show nature only: no people, faces, text, logos or brands (every
clip was checked frame by frame at several points, and segments with on-screen labels or
timestamps were cut or cropped out). The fire/embers, sun and garden scenes are presented as
natural or symbolic imagery. They are not depictions of Hell or Paradise, and no scene claims
to depict Allah, angels, prophets, Paradise or Hell.

**Processing.** Applied to every video clip, reproducible with `scripts/process-backgrounds.sh`:

- trimmed to one segment
- center-cropped to 9:16 and scaled to 720×1280 at 30 fps (Lanczos)
- made to loop seamlessly: a 1-second crossfade at the loop point, or, for two short camera
  pans (assets 17 and 18), the segment played forward then in reverse
- re-encoded as H.264 High (CRF 27, max 1.5 Mbps), with the audio track removed
- a 270×480 JPEG poster frame extracted for the picker

**Payload.** All 20 backgrounds (18 MP4 clips + 18 posters; 2 are procedural) total
28.7 MB (28,691,306 bytes), within the ~35 MB mobile/Vercel budget.

**Resilience.** If a clip fails to load or times out (25 s), the renderer leaves it out and
keeps going with the rest; previously one failed clip failed the whole render. If every
selected clip fails, it falls back to the procedural geometric scene. A poster that fails to
load shows a plain tile in the picker.

| # | Background (app name) | File(s) | Source title | Author | License | Source URL | Modifications |
|---|---|---|---|---|---|---|---|
| 1 | Birds in the sky / طيور في السماء | — (procedural, `src/lib/video/proceduralScenes.ts`) | Birds over a calm sky (animated) | Original app artwork (فاستمعوا له) | Original artwork, part of this app (MIT) | — | Generated in the browser at render time; no external footage. |
| 2 | River flowing / نهر جارٍ | `public/backgrounds/river-diana-creek.{mp4,jpg}` | Golden hour rays break through mist on Diana Creek | Extemporalist | CC0 1.0 | https://commons.wikimedia.org/wiki/File:Golden_hour_rays_break_through_mist_on_Diana_Creek.webm | 16 s segment; processing above. |
| 3 | Drone over ocean / تحليق فوق المحيط | `public/backgrounds/ocean-aerial.{mp4,jpg}` | Aerial Shot Of Sea With Speedboat | bellergy | CC0 1.0 (originally Pixabay, CC0 at upload; archived 2019-01-18) | https://commons.wikimedia.org/wiki/File:Aerial_Shot_Of_Sea_With_Speedboat.webm (orig. https://pixabay.com/en/videos/island-motorboat-sea-ocean-2946/) | 12.9 s segment; processing above. |
| 4 | Rain in forest / مطر في الغابة | `public/backgrounds/rain-forest.{mp4,jpg}` | Typhoon in Forest Park, Jiading, Shanghai (20240916) | Fumikas Sagisavas | CC0 1.0 (`{{cc-zero}}` on the file page) | https://commons.wikimedia.org/wiki/File:Typhoon_in_Forest_Park,_Jiading,_Shanghai_(20240916).webm | 8.7 s segment; 59 → 30 fps; processing above. |
| 5 | Mountain clouds / غيوم فوق الجبال | `public/backgrounds/mountain-clouds.{mp4,jpg}` | Time Lapse Clouds above Steens Mountain | Bureau of Land Management Oregon & Washington | Public domain: U.S. federal government work (`{{PD-USGov-BLM}}`; also tagged CC BY-SA 2.0 on Flickr) | https://commons.wikimedia.org/wiki/File:Time_Lapse_Clouds_above_Steens_Mountain_(36203941112).webm (orig. https://www.flickr.com/photos/blmoregon/36203941112) | 16 s segment; processing above. |
| 6 | Desert sunset / غروب الصحراء | `public/backgrounds/desert-sunset.{mp4,jpg}` | Mojave Desert Sunset | Bureau of Land Management California | Public domain: U.S. federal government work (`{{PD-USGov-BLM}}`) | https://commons.wikimedia.org/wiki/File:Mojave_Desert_Sunset_(40480403760).webm (orig. https://www.flickr.com/photos/blmcalifornia/40480403760) | Letterbox bars removed; 12.3 s segment; processing above. |
| 7 | Ocean waves / أمواج البحر | `public/backgrounds/ocean-waves.{mp4,jpg}` | Ocean surface waves 06 | Mostafameraji | CC0 1.0 | https://commons.wikimedia.org/wiki/File:Ocean_surface_waves_06.ogv | 5.2 s segment; processing above. |
| 8 | Night sky and stars / سماء الليل والنجوم | `public/backgrounds/night-aurora.{mp4,jpg}` | Alaskan Aurora Time Lapse (SVS15077) | NASA's Scientific Visualization Studio — Amentum Services, Inc./Mike Toillion | Public domain: NASA media (`{{PD-USGov-NASA}}`) | https://commons.wikimedia.org/wiki/File:Alaskan_Aurora_Time_Lapse_(SVS15077).webm (orig. https://svs.gsfc.nasa.gov/15077) | 16 s segment; processing above. |
| 9 | Green valley / وادٍ أخضر | `public/backgrounds/green-valley.{mp4,jpg}` | Pasture in Tay Valley - timelapse | Rose Abrams | **CC BY 4.0** (https://creativecommons.org/licenses/by/4.0/) | https://commons.wikimedia.org/wiki/File:Pasture_in_Tay_Valley_-_timelapse.webm | 16 s segment; processing above. |
| 10 | Islamic geometric motion / زخرفة هندسية إسلامية | — (procedural, `src/lib/video/proceduralScenes.ts`) | Eight-fold star lattice (animated) | Original app artwork (فاستمعوا له) | Original artwork, part of this app (MIT) | — | Generated in the browser at render time; no external footage. |
| 11 | Glowing embers / جمر متوهج | `public/backgrounds/embers-glow.{mp4,jpg}` | Fire آتش 02 | Mostafameraji | CC0 1.0 (`{{self\|cc-zero}}`) | https://commons.wikimedia.org/wiki/File:Fire_%D8%A2%D8%AA%D8%B4_02.ogv | 8 s segment from 0:09.5 (defocused embers only; the parts showing a metal can were excluded); 25 → 30 fps; processing above. Natural fire, not a depiction of Hell. |
| 12 | Blazing sun / الشمس المتوهجة | `public/backgrounds/sun-sdo.{mp4,jpg}` | SDO Sun This Week (SVS5577 – 4hr 2048p30) | NASA's Scientific Visualization Studio (SSAI/AJ Christensen et al.), NASA SDO | Public domain: NASA media (`{{PD-USGov-NASA}}`) | https://commons.wikimedia.org/wiki/File:SDO_Sun_This_Week_(SVS5577_-_4hr_2048p30).webm (orig. https://svs.gsfc.nasa.gov/5577) | 14 s segment from 0:02; cropped to the middle 90 % of the height first to remove the burned-in UTC timestamp; processing above. |
| 13 | Deep space / أعماق الفضاء | `public/backgrounds/deep-space.{mp4,jpg}` | Circinus Galaxy Zoom (SVS31362) | NASA's Scientific Visualization Studio — Global Science and Technology, Inc./Mark Malanoski | Public domain: NASA media (`{{PD-USGov-NASA}}`) | https://commons.wikimedia.org/wiki/File:Circinus_Galaxy_Zoom_(SVS31362).webm (orig. https://svs.gsfc.nasa.gov/31362) | 9.5 s segment from 0:06 (after the labelled-constellation intro, before the telescope-frame ending); processing above. |
| 14 | Peaceful garden / حديقة هادئة | `public/backgrounds/lavender-garden.{mp4,jpg}` | Lavender - 17156 | Tetzemann | CC0 1.0 (`{{self\|cc-zero}}`) | https://commons.wikimedia.org/wiki/File:Lavender_-_17156.webm | 12 s segment from 0:01; processing above. Peaceful garden scenery, not a portrayal of Jannah. |
| 15 | Waterfall / شلال | `public/backgrounds/waterfall-nimrod.{mp4,jpg}` | Mt Nimrod Scenic Reserve - Waterfall on Nimrod Stream (video) | David Nind | CC0 1.0 (`{{self\|cc-zero}}`) | https://commons.wikimedia.org/wiki/File:Mt_Nimrod_Scenic_Reserve_-_Waterfall_on_Nimrod_Stream_(video).webm | Vertical original; 10 s segment from 0:00.5; 60 → 30 fps; processing above. |
| 16 | Storm and lightning / عاصفة وبرق | `public/backgrounds/lightning-storm.{mp4,jpg}` | Lightning storm over Colorado, USA | NathanScientific | CC0 1.0 (`{{self\|cc-zero}}`) | https://commons.wikimedia.org/wiki/File:Lightning_storm_over_Colorado,_USA.ogg | 16 s segment from 0:04; 25 → 30 fps; processing above. |
| 17 | Snowy mountains / جبال مكسوة بالثلج | `public/backgrounds/snowy-mountains.{mp4,jpg}` | Snow-capped Himalayan mountains Rasuwa | Pustam.EGR | **CC BY 4.0** (`{{self\|cc-by-4.0}}`, https://creativecommons.org/licenses/by/4.0/) | https://commons.wikimedia.org/wiki/File:Snow-capped_Himalayan_mountains_Rasuwa.webm | Vertical original; 3.4 s segment from 0:01.6 (after the sun-glare opening), looped forward then reverse (6.7 s); processing above. |
| 18 | Autumn forest / غابة الخريف | `public/backgrounds/autumn-forest.{mp4,jpg}` | Karjalašt londust sügüzen augotišes. Карельская природа в начале осени (Karelian nature in early autumn) | Eniisi Lisika | CC0 1.0 (`{{self\|cc-zero}}`) | https://commons.wikimedia.org/wiki/File:Karjala%C5%A1t_londust_s%C3%BCg%C3%BCzen_augoti%C5%A1es._%D0%9A%D0%B0%D1%80%D0%B5%D0%BB%D1%8C%D1%81%D0%BA%D0%B0%D1%8F_%D0%BF%D1%80%D0%B8%D1%80%D0%BE%D0%B4%D0%B0_%D0%B2_%D0%BD%D0%B0%D1%87%D0%B0%D0%BB%D0%B5_%D0%BE%D1%81%D0%B5%D0%BD%D0%B8.webm | First 3 s only (the pan later reaches a road and a building), looped forward then reverse (6 s); processing above. |
| 19 | Flower meadow / مرج الأزهار | `public/backgrounds/flower-meadow.{mp4,jpg}` | Flowers (20210715-FPAC-KLS-0002) | U.S. Department of Agriculture (USDA) | Public domain: U.S. federal government work (`{{PD-USGov-USDA}}`, Flickr-reviewed) | https://commons.wikimedia.org/wiki/File:Flowers_(20210715-FPAC-KLS-0002).webm (orig. https://www.flickr.com/photos/usdagov/51314421730) | 12 s segment from 2:04.5 (the wide shot of the field; no captions in this segment); processing above. |
| 20 | Golden dawn / فجر ذهبي | `public/backgrounds/golden-dawn.{mp4,jpg}` | Sunrise Timelapse (30174294051) | Shenandoah National Park (U.S. National Park Service) | Public domain: U.S. federal government work (`{{PD-USGov-NPS}}`; also tagged CC BY 2.0 on Flickr) | https://commons.wikimedia.org/wiki/File:Sunrise_Timelapse_(30174294051).webm (orig. https://www.flickr.com/photos/snpphotos/30174294051) | 13 s segment from 0:14; processing above. |

## CC BY 4.0 attribution (assets 9 and 17)

> “Pasture in Tay Valley - timelapse” by Rose Abrams, licensed under CC BY 4.0
> (https://creativecommons.org/licenses/by/4.0/). Source:
> https://commons.wikimedia.org/wiki/File:Pasture_in_Tay_Valley_-_timelapse.webm.
> Modified: trimmed to 16 s, center-cropped to 9:16, scaled to 720×1280, re-encoded as H.264
> without audio, with a 1 s loop crossfade.

> “Snow-capped Himalayan mountains Rasuwa” by Pustam.EGR, licensed under CC BY 4.0
> (https://creativecommons.org/licenses/by/4.0/). Source:
> https://commons.wikimedia.org/wiki/File:Snow-capped_Himalayan_mountains_Rasuwa.webm.
> Modified: trimmed to 3.4 s, center-cropped to 9:16, scaled to 720×1280, re-encoded as
> H.264 without audio, looped forward then in reverse.

The app provides this attribution in three places:

1. **In-app credits.** The "Background credits & licenses" panel in the video creator, plus a
   "Backgrounds in this video" box after each render.
2. **Inside the video itself.** A small caption, e.g. *Background: “Pasture in Tay Valley -
   timelapse” by Rose Abrams · CC BY 4.0*, is burned in while that background is on screen,
   so the credit travels with every shared copy.
3. **In the share text.** The text attached when the user taps Share Video.

## Notes

- The approval request listed asset 4 as "CC BY 4.0". The file page actually carries `{{cc-zero}}`
  (CC0), and it is recorded here as CC0. The author is still credited as a courtesy.
- Asset 5 carries both `{{PD-USGov-BLM}}` and a Flickr CC BY-SA 2.0 tag. As a work of the U.S.
  federal government it is public domain in the U.S. BLM is still credited.
- A mosque-exterior clip was not included because its rights could not be cleanly confirmed.
  Original geometric motion artwork (asset 10) is used instead.
- Asset 20 also carries a Flickr CC BY 2.0 tag. As a work of the U.S. federal government
  (NPS) it is public domain in the U.S. Shenandoah National Park is still credited.
- Candidates rejected during the 2026-10-29 review: two fire clips showing a tent or a
  person's arm, a USDA flower clip with burned-in captions, waterfall footage with railings,
  and "CC BY 3.0" clips that are YouTube re-uploads with unclear ownership.
- Each original was downloaded from Commons and checked against the SHA-1 Commons publishes
  for it before processing.
- Licenses for assets 1–10 were verified on 2026-10-28, and for assets 11–20 on 2026-10-29,
  from each file page's raw wikitext (`action=raw`).
