// Built-in backgrounds for the video creator.
//
// This manifest is the single source of truth for the background picker and the
// in-app credits. The repository record lives in docs/VIDEO-ASSET-LICENSES.md and
// must be kept in sync with it.
//
// Every clip was taken from Wikimedia Commons under CC0, a U.S. federal
// public-domain tag, or CC BY 4.0. Each one was checked against the file page's
// license template, never inferred. Clips were processed with
// scripts/process-backgrounds.sh: trimmed, center-cropped to 9:16, scaled to
// 720×1280, re-encoded as H.264 with no audio, and given a 1 s crossfade at the
// loop point. Two backgrounds are original procedural artwork drawn on the canvas
// at render time (see proceduralScenes.ts).

export type LicenseKind = "original" | "cc0" | "public-domain-us" | "cc-by-4.0";

export interface BackgroundCredit {
  title: string;
  author: string;
  license: string;
  licenseKind: LicenseKind;
  licenseUrl?: string;
  sourceUrl?: string;
  /** Upstream source behind the Commons copy, when there is one. */
  originalSource?: string;
  modifications: string;
}

interface BackgroundBase {
  id: string;
  nameEn: string;
  nameAr: string;
  credit: BackgroundCredit;
}

export interface VideoBackground extends BackgroundBase {
  kind: "video";
  src: string;
  poster: string;
}

export interface ProceduralBackground extends BackgroundBase {
  kind: "procedural";
  scene: "birds" | "geometric";
}

export type Background = VideoBackground | ProceduralBackground;

const CC0_URL = "https://creativecommons.org/publicdomain/zero/1.0/";
const CC_BY_4_URL = "https://creativecommons.org/licenses/by/4.0/";

const processed = (seconds: number, extra = "") =>
  `Trimmed to a ${seconds}-second segment${extra}, center-cropped to 9:16, scaled to 720×1280, ` +
  "re-encoded as H.264 (no audio track), and a 1-second crossfade added at the loop point.";

export const BACKGROUNDS: Background[] = [
  {
    id: "birds",
    kind: "procedural",
    scene: "birds",
    nameEn: "Birds in the sky",
    nameAr: "طيور في السماء",
    credit: {
      title: "Birds over a calm sky (animated)",
      author: "Original app artwork (فاستمعوا له)",
      license: "Original artwork, part of this app (MIT)",
      licenseKind: "original",
      modifications: "Generated procedurally in the browser at render time; no external footage.",
    },
  },
  {
    id: "river",
    kind: "video",
    src: "/backgrounds/river-diana-creek.mp4",
    poster: "/backgrounds/river-diana-creek.jpg",
    nameEn: "River flowing",
    nameAr: "نهر جارٍ",
    credit: {
      title: "Golden hour rays break through mist on Diana Creek",
      author: "Extemporalist",
      license: "CC0 1.0 (public domain dedication)",
      licenseKind: "cc0",
      licenseUrl: CC0_URL,
      sourceUrl: "https://commons.wikimedia.org/wiki/File:Golden_hour_rays_break_through_mist_on_Diana_Creek.webm",
      modifications: processed(16),
    },
  },
  {
    id: "ocean-aerial",
    kind: "video",
    src: "/backgrounds/ocean-aerial.mp4",
    poster: "/backgrounds/ocean-aerial.jpg",
    nameEn: "Drone over ocean",
    nameAr: "تحليق فوق المحيط",
    credit: {
      title: "Aerial Shot Of Sea With Speedboat",
      author: "bellergy",
      license: "CC0 1.0 (public domain dedication)",
      licenseKind: "cc0",
      licenseUrl: CC0_URL,
      sourceUrl: "https://commons.wikimedia.org/wiki/File:Aerial_Shot_Of_Sea_With_Speedboat.webm",
      originalSource: "https://pixabay.com/en/videos/island-motorboat-sea-ocean-2946/ (CC0 at time of upload, archived 2019-01-18)",
      modifications: processed(12.9),
    },
  },
  {
    id: "rain-forest",
    kind: "video",
    src: "/backgrounds/rain-forest.mp4",
    poster: "/backgrounds/rain-forest.jpg",
    nameEn: "Rain in forest",
    nameAr: "مطر في الغابة",
    credit: {
      title: "Typhoon in Forest Park, Jiading, Shanghai (20240916)",
      author: "Fumikas Sagisavas",
      license: "CC0 1.0 (public domain dedication)",
      licenseKind: "cc0",
      licenseUrl: CC0_URL,
      sourceUrl: "https://commons.wikimedia.org/wiki/File:Typhoon_in_Forest_Park,_Jiading,_Shanghai_(20240916).webm",
      modifications: processed(8.7, " (frame rate reduced from 59 to 30 fps)"),
    },
  },
  {
    id: "mountain-clouds",
    kind: "video",
    src: "/backgrounds/mountain-clouds.mp4",
    poster: "/backgrounds/mountain-clouds.jpg",
    nameEn: "Mountain clouds",
    nameAr: "غيوم فوق الجبال",
    credit: {
      title: "Time Lapse Clouds above Steens Mountain",
      author: "Bureau of Land Management (BLM) Oregon & Washington",
      license: "Public domain — work of the U.S. federal government (PD-USGov-BLM)",
      licenseKind: "public-domain-us",
      sourceUrl: "https://commons.wikimedia.org/wiki/File:Time_Lapse_Clouds_above_Steens_Mountain_(36203941112).webm",
      originalSource: "https://www.flickr.com/photos/blmoregon/36203941112 (also tagged CC BY-SA 2.0 on Flickr)",
      modifications: processed(16),
    },
  },
  {
    id: "desert-sunset",
    kind: "video",
    src: "/backgrounds/desert-sunset.mp4",
    poster: "/backgrounds/desert-sunset.jpg",
    nameEn: "Desert sunset",
    nameAr: "غروب الصحراء",
    credit: {
      title: "Mojave Desert Sunset",
      author: "Bureau of Land Management (BLM) California",
      license: "Public domain — work of the U.S. federal government (PD-USGov-BLM)",
      licenseKind: "public-domain-us",
      sourceUrl: "https://commons.wikimedia.org/wiki/File:Mojave_Desert_Sunset_(40480403760).webm",
      originalSource: "https://www.flickr.com/photos/blmcalifornia/40480403760",
      modifications: processed(12.3, " with letterbox bars removed"),
    },
  },
  {
    id: "ocean-waves",
    kind: "video",
    src: "/backgrounds/ocean-waves.mp4",
    poster: "/backgrounds/ocean-waves.jpg",
    nameEn: "Ocean waves",
    nameAr: "أمواج البحر",
    credit: {
      title: "Ocean surface waves 06",
      author: "Mostafameraji",
      license: "CC0 1.0 (public domain dedication)",
      licenseKind: "cc0",
      licenseUrl: CC0_URL,
      sourceUrl: "https://commons.wikimedia.org/wiki/File:Ocean_surface_waves_06.ogv",
      modifications: processed(5.2),
    },
  },
  {
    id: "night-sky",
    kind: "video",
    src: "/backgrounds/night-aurora.mp4",
    poster: "/backgrounds/night-aurora.jpg",
    nameEn: "Night sky and stars",
    nameAr: "سماء الليل والنجوم",
    credit: {
      title: "Alaskan Aurora Time Lapse (SVS15077)",
      author: "NASA's Scientific Visualization Studio — Amentum Services, Inc./Mike Toillion",
      license: "Public domain — NASA media (PD-USGov-NASA)",
      licenseKind: "public-domain-us",
      sourceUrl: "https://commons.wikimedia.org/wiki/File:Alaskan_Aurora_Time_Lapse_(SVS15077).webm",
      originalSource: "https://svs.gsfc.nasa.gov/15077",
      modifications: processed(16),
    },
  },
  {
    id: "green-valley",
    kind: "video",
    src: "/backgrounds/green-valley.mp4",
    poster: "/backgrounds/green-valley.jpg",
    nameEn: "Green valley",
    nameAr: "وادٍ أخضر",
    credit: {
      title: "Pasture in Tay Valley - timelapse",
      author: "Rose Abrams",
      license: "CC BY 4.0",
      licenseKind: "cc-by-4.0",
      licenseUrl: CC_BY_4_URL,
      sourceUrl: "https://commons.wikimedia.org/wiki/File:Pasture_in_Tay_Valley_-_timelapse.webm",
      modifications: processed(16),
    },
  },
  {
    id: "geometric",
    kind: "procedural",
    scene: "geometric",
    nameEn: "Islamic geometric motion",
    nameAr: "زخرفة هندسية إسلامية",
    credit: {
      title: "Eight-fold star lattice (animated)",
      author: "Original app artwork (فاستمعوا له)",
      license: "Original artwork, part of this app (MIT)",
      licenseKind: "original",
      modifications: "Generated procedurally in the browser at render time; no external footage.",
    },
  },
];

export const DEFAULT_BACKGROUND_IDS = ["river"];

export function getBackground(id: string): Background | undefined {
  return BACKGROUNDS.find((b) => b.id === id);
}

/** A one-line attribution suitable for credits ("Title" by Author — License). */
export function attributionLine(credit: BackgroundCredit): string {
  return `“${credit.title}” by ${credit.author} — ${credit.license}`;
}
