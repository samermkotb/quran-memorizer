# Video Creator — Background Asset Sources & Licenses

This is the repository record for the 10 built-in backgrounds used by the video creator.
The in-app picker and credits read from `src/lib/video/backgrounds.ts`, so keep this file
and that manifest in sync.

**Policy.** Only legally reusable assets are used: CC0, U.S. federal public domain, CC BY,
or original app artwork. Each license was read from the file page's own license template on
Wikimedia Commons (`action=raw`), not inferred from search results. Nothing was scraped from
YouTube or stock sites. YouTube-sourced "CC BY" re-uploads were rejected because their
ownership is unclear.

**Processing.** Applied to every video clip, reproducible with `scripts/process-backgrounds.sh`:

- trimmed to one segment
- center-cropped to 9:16 and scaled to 720×1280 at 30 fps (Lanczos)
- 1-second crossfade added at the loop point so the clip loops seamlessly
- re-encoded as H.264 High (CRF 27, max 1.5 Mbps), with the audio track removed
- a 270×480 JPEG poster frame extracted for the picker

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

## CC BY 4.0 attribution (asset 9)

> “Pasture in Tay Valley - timelapse” by Rose Abrams, licensed under CC BY 4.0
> (https://creativecommons.org/licenses/by/4.0/). Source:
> https://commons.wikimedia.org/wiki/File:Pasture_in_Tay_Valley_-_timelapse.webm.
> Modified: trimmed to 16 s, center-cropped to 9:16, scaled to 720×1280, re-encoded as H.264
> without audio, with a 1 s loop crossfade.

The app provides this attribution in three places:

1. **In-app credits.** The "Background credits & licenses" panel in the video creator, plus a
   "Backgrounds in this video" box after each render.
2. **Inside the video itself.** A small caption, *Background: “Pasture in Tay Valley -
   timelapse” by Rose Abrams · CC BY 4.0*, is burned in while that background is on screen,
   so the credit travels with every shared copy.
3. **In the share text.** The text attached when the user taps Share Video or Send as Message.

## Notes

- The approval request listed asset 4 as "CC BY 4.0". The file page actually carries `{{cc-zero}}`
  (CC0), and it is recorded here as CC0. The author is still credited as a courtesy.
- Asset 5 carries both `{{PD-USGov-BLM}}` and a Flickr CC BY-SA 2.0 tag. As a work of the U.S.
  federal government it is public domain in the U.S. BLM is still credited.
- A mosque-exterior clip was not included because its rights could not be cleanly confirmed.
  Original geometric motion artwork (asset 10) is used instead.
- Licenses were verified on 2026-10-28.
