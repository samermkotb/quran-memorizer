import { Reciter } from "@/types";

// everyayah.com provides individual ayah MP3s via:
// https://everyayah.com/data/{folder}/{surah_3digits}{ayah_3digits}.mp3
// All folder names verified via HTTP 200 on everyayah.com
//
// mp3quran.net provides full-surah MP3s via:
// https://{mp3quranServer}/{surah_3digits}.mp3
// These reciters do not have ayah-by-ayah files, so ayah-range playback,
// per-ayah repeat, and pause-after-ayah are not available for them —
// only whole-surah streaming/download. See mp3quranMissingSurahs for any
// surahs absent from a particular mushaf.
export const RECITERS: Reciter[] = [
  {
    id: "alafasy",
    name: "Mishary Rashid Alafasy",
    arabicName: "مشاري راشد العفاسي",
    style: "Murattal",
    source: "everyayah",
    everyayahFolder: "Alafasy_128kbps",
    bitrate: "128kbps",
  },
  {
    id: "abdulbasit_murattal",
    name: "Abdul Basit Abdul Samad (Murattal)",
    arabicName: "عبد الباسط عبد الصمد (مرتل)",
    style: "Murattal",
    source: "everyayah",
    everyayahFolder: "Abdul_Basit_Murattal_64kbps",
    bitrate: "64kbps",
  },
  {
    id: "abdulbasit_mujawwad",
    name: "Abdul Basit Abdul Samad (Mujawwad)",
    arabicName: "عبد الباسط عبد الصمد (مجود)",
    style: "Mujawwad",
    source: "everyayah",
    everyayahFolder: "Abdul_Basit_Mujawwad_128kbps",
    bitrate: "128kbps",
  },
  {
    id: "husary",
    name: "Mahmoud Khalil Al-Husary",
    arabicName: "محمود خليل الحصري",
    style: "Murattal",
    source: "everyayah",
    everyayahFolder: "Husary_128kbps",
    bitrate: "128kbps",
  },
  {
    id: "husary_muallim",
    name: "Mahmoud Khalil Al-Husary (Muallim)",
    arabicName: "محمود خليل الحصري (معلم)",
    style: "Muallim",
    source: "everyayah",
    everyayahFolder: "Husary_Muallim_128kbps",
    bitrate: "128kbps",
  },
  {
    id: "minshawi_mujawwad",
    name: "Mohamed Seddiq El-Minshawi (Mujawwad)",
    arabicName: "محمد صديق المنشاوي (مجود)",
    style: "Mujawwad",
    source: "everyayah",
    everyayahFolder: "Minshawy_Mujawwad_64kbps",
    bitrate: "64kbps",
  },
  {
    id: "minshawi_murattal",
    name: "Mohamed Seddiq El-Minshawi (Murattal)",
    arabicName: "محمد صديق المنشاوي (مرتل)",
    style: "Murattal",
    source: "everyayah",
    everyayahFolder: "Minshawy_Murattal_128kbps",
    bitrate: "128kbps",
  },
  {
    id: "ghamdi",
    name: "Saad Al-Ghamdi",
    arabicName: "سعد الغامدي",
    style: "Murattal",
    source: "everyayah",
    everyayahFolder: "Ghamadi_40kbps",
    bitrate: "40kbps",
  },
  {
    id: "shatri",
    name: "Abu Bakr Al-Shatri",
    arabicName: "أبو بكر الشاطري",
    style: "Murattal",
    source: "everyayah",
    everyayahFolder: "Abu_Bakr_Ash-Shaatree_128kbps",
    bitrate: "128kbps",
  },
  {
    id: "qatami",
    name: "Nasser Al-Qatami",
    arabicName: "ناصر القطامي",
    style: "Murattal",
    source: "everyayah",
    everyayahFolder: "Nasser_Alqatami_128kbps",
    bitrate: "128kbps",
  },
  {
    id: "sudais",
    name: "Abdul Rahman Al-Sudais",
    arabicName: "عبد الرحمن السديس",
    style: "Murattal",
    source: "everyayah",
    everyayahFolder: "Abdurrahmaan_As-Sudais_192kbps",
    bitrate: "192kbps",
  },
  {
    id: "shuraim",
    name: "Saud Al-Shuraim",
    arabicName: "سعود الشريم",
    style: "Murattal",
    source: "everyayah",
    everyayahFolder: "Saood_ash-Shuraym_128kbps",
    bitrate: "128kbps",
  },
  {
    id: "maher",
    name: "Maher Al-Mueaqly",
    arabicName: "ماهر المعيقلي",
    style: "Murattal",
    source: "everyayah",
    everyayahFolder: "MaherAlMuaiqly128kbps",
    bitrate: "128kbps",
  },
  {
    id: "yasser_dossary",
    name: "Yasser Al-Dossary",
    arabicName: "ياسر الدوسري",
    style: "Murattal",
    source: "everyayah",
    everyayahFolder: "Yasser_Ad-Dussary_128kbps",
    bitrate: "128kbps",
  },
  {
    id: "al_banna",
    name: "Mahmoud Ali Al-Banna",
    arabicName: "محمود علي البنا",
    style: "Mujawwad",
    source: "everyayah",
    everyayahFolder: "mahmoud_ali_al_banna_32kbps",
    bitrate: "32kbps",
  },
  {
    id: "tunaiji",
    name: "Khalifa Al-Tunaiji",
    arabicName: "خليفة الطنيجي",
    style: "Murattal",
    source: "everyayah",
    everyayahFolder: "khalefa_al_tunaiji_64kbps",
    bitrate: "64kbps",
  },
  {
    id: "ayyub",
    name: "Muhammad Ayyub",
    arabicName: "محمد أيوب",
    style: "Murattal",
    source: "everyayah",
    everyayahFolder: "Muhammad_Ayyoub_128kbps",
    bitrate: "128kbps",
  },

  // ── Newly added reciters (verified HTTP 200, see README "Requested reciters" table) ──

  {
    // everyayah.com — ayah-by-ayah, verified https://everyayah.com/data/Ahmed_ibn_Ali_al-Ajamy_128kbps_ketaballah.net/001001.mp3
    id: "ajmy",
    name: "Ahmad Al-Ajmy",
    arabicName: "أحمد بن علي العجمي",
    style: "Murattal",
    source: "everyayah",
    everyayahFolder: "Ahmed_ibn_Ali_al-Ajamy_128kbps_ketaballah.net",
    bitrate: "128kbps",
  },
  {
    // mp3quran.net — full-surah only, verified https://server14.mp3quran.net/islam/Rewayat-Hafs-A-n-Assem/001.mp3
    // Mushaf is missing surahs 37, 39, 40, 45, 65 (verified via HTTP 404 on those files).
    id: "islam_sobhi",
    name: "Islam Sobhi",
    arabicName: "إسلام صبحي",
    style: "Murattal",
    source: "mp3quran",
    mp3quranServer: "https://server14.mp3quran.net/islam/Rewayat-Hafs-A-n-Assem/",
    mp3quranMissingSurahs: [37, 39, 40, 45, 65],
    bitrate: "128kbps",
  },
  {
    // mp3quran.net — full-surah only, verified https://server6.mp3quran.net/abkr/001.mp3
    id: "idris_abkar",
    name: "Idris Abkar",
    arabicName: "إدريس أبكر",
    style: "Murattal",
    source: "mp3quran",
    mp3quranServer: "https://server6.mp3quran.net/abkr/",
    bitrate: "128kbps",
  },
  {
    // mp3quran.net — full-surah only, verified https://server6.mp3quran.net/balilah/001.mp3
    id: "bandar_balilah",
    name: "Bandar Balilah",
    arabicName: "بندر بليلة",
    style: "Murattal",
    source: "mp3quran",
    mp3quranServer: "https://server6.mp3quran.net/balilah/",
    bitrate: "128kbps",
  },
  {
    // mp3quran.net — full-surah only, verified https://server6.mp3quran.net/twfeeq/001.mp3
    id: "tawfiq_sayegh",
    name: "Tawfiq Al-Sayegh",
    arabicName: "توفيق الصايغ",
    style: "Murattal",
    source: "mp3quran",
    mp3quranServer: "https://server6.mp3quran.net/twfeeq/",
    bitrate: "128kbps",
  },
  {
    // mp3quran.net — full-surah only, verified https://server11.mp3quran.net/hatem/001.mp3
    id: "hatem_alwaer",
    name: "Hatem Farid Al-Waer",
    arabicName: "حاتم فريد الواعر",
    style: "Murattal",
    source: "mp3quran",
    mp3quranServer: "https://server11.mp3quran.net/hatem/",
    bitrate: "128kbps",
  },
  {
    // mp3quran.net — full-surah only, verified https://server6.mp3quran.net/kurdi/001.mp3
    id: "raad_alkurdi",
    name: "Raad Al-Kurdi",
    arabicName: "رعد الكردي",
    style: "Murattal",
    source: "mp3quran",
    mp3quranServer: "https://server6.mp3quran.net/kurdi/",
    bitrate: "128kbps",
  },
  {
    // mp3quran.net — full-surah only, verified https://server16.mp3quran.net/soufi/Rewayat-Hafs-A-n-Assem/001.mp3
    id: "abdulrashid_sufi",
    name: "Abdul Rashid Sufi",
    arabicName: "عبد الرشيد صوفي",
    style: "Murattal",
    source: "mp3quran",
    mp3quranServer: "https://server16.mp3quran.net/soufi/Rewayat-Hafs-A-n-Assem/",
    bitrate: "128kbps",
  },
];

export function getReciter(id: string): Reciter | undefined {
  return RECITERS.find((r) => r.id === id);
}

export const DEFAULT_RECITER_ID = "alafasy";
