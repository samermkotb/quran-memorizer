import { Reciter } from "@/types";

// everyayah.com provides individual ayah MP3s via:
// https://everyayah.com/data/{folder}/{surah_3digits}{ayah_3digits}.mp3
// All folder names verified via HTTP 200 on everyayah.com
export const RECITERS: Reciter[] = [
  {
    id: "alafasy",
    name: "Mishary Rashid Alafasy",
    arabicName: "مشاري راشد العفاسي",
    style: "Murattal",
    everyayahFolder: "Alafasy_128kbps",
    bitrate: "128kbps",
  },
  {
    id: "abdulbasit_murattal",
    name: "Abdul Basit Abdul Samad (Murattal)",
    arabicName: "عبد الباسط عبد الصمد (مرتل)",
    style: "Murattal",
    everyayahFolder: "Abdul_Basit_Murattal_64kbps",
    bitrate: "64kbps",
  },
  {
    id: "abdulbasit_mujawwad",
    name: "Abdul Basit Abdul Samad (Mujawwad)",
    arabicName: "عبد الباسط عبد الصمد (مجود)",
    style: "Mujawwad",
    everyayahFolder: "Abdul_Basit_Mujawwad_128kbps",
    bitrate: "128kbps",
  },
  {
    id: "husary",
    name: "Mahmoud Khalil Al-Husary",
    arabicName: "محمود خليل الحصري",
    style: "Murattal",
    everyayahFolder: "Husary_128kbps",
    bitrate: "128kbps",
  },
  {
    id: "husary_muallim",
    name: "Mahmoud Khalil Al-Husary (Muallim)",
    arabicName: "محمود خليل الحصري (معلم)",
    style: "Muallim",
    everyayahFolder: "Husary_Muallim_128kbps",
    bitrate: "128kbps",
  },
  {
    id: "minshawi_mujawwad",
    name: "Mohamed Seddiq El-Minshawi (Mujawwad)",
    arabicName: "محمد صديق المنشاوي (مجود)",
    style: "Mujawwad",
    everyayahFolder: "Minshawy_Mujawwad_64kbps",
    bitrate: "64kbps",
  },
  {
    id: "minshawi_murattal",
    name: "Mohamed Seddiq El-Minshawi (Murattal)",
    arabicName: "محمد صديق المنشاوي (مرتل)",
    style: "Murattal",
    everyayahFolder: "Minshawy_Murattal_128kbps",
    bitrate: "128kbps",
  },
  {
    id: "ghamdi",
    name: "Saad Al-Ghamdi",
    arabicName: "سعد الغامدي",
    style: "Murattal",
    everyayahFolder: "Ghamadi_40kbps",
    bitrate: "40kbps",
  },
  {
    id: "shatri",
    name: "Abu Bakr Al-Shatri",
    arabicName: "أبو بكر الشاطري",
    style: "Murattal",
    everyayahFolder: "Abu_Bakr_Ash-Shaatree_128kbps",
    bitrate: "128kbps",
  },
  {
    id: "qatami",
    name: "Nasser Al-Qatami",
    arabicName: "ناصر القطامي",
    style: "Murattal",
    everyayahFolder: "Nasser_Alqatami_128kbps",
    bitrate: "128kbps",
  },
  {
    id: "sudais",
    name: "Abdul Rahman Al-Sudais",
    arabicName: "عبد الرحمن السديس",
    style: "Murattal",
    everyayahFolder: "Abdurrahmaan_As-Sudais_192kbps",
    bitrate: "192kbps",
  },
  {
    id: "shuraim",
    name: "Saud Al-Shuraim",
    arabicName: "سعود الشريم",
    style: "Murattal",
    everyayahFolder: "Saood_ash-Shuraym_128kbps",
    bitrate: "128kbps",
  },
  {
    id: "maher",
    name: "Maher Al-Mueaqly",
    arabicName: "ماهر المعيقلي",
    style: "Murattal",
    everyayahFolder: "MaherAlMuaiqly128kbps",
    bitrate: "128kbps",
  },
  // New reciters — all verified on everyayah.com
  {
    id: "yasser_dossary",
    name: "Yasser Al-Dossary",
    arabicName: "ياسر الدوسري",
    style: "Murattal",
    everyayahFolder: "Yasser_Ad-Dussary_128kbps",
    bitrate: "128kbps",
  },
  {
    id: "al_banna",
    name: "Mahmoud Ali Al-Banna",
    arabicName: "محمود علي البنا",
    style: "Mujawwad",
    everyayahFolder: "mahmoud_ali_al_banna_32kbps",
    bitrate: "32kbps",
  },
  {
    id: "tunaiji",
    name: "Khalifa Al-Tunaiji",
    arabicName: "خليفة الطنيجي",
    style: "Murattal",
    everyayahFolder: "khalefa_al_tunaiji_64kbps",
    bitrate: "64kbps",
  },
  {
    id: "ayyub",
    name: "Muhammad Ayyub",
    arabicName: "محمد أيوب",
    style: "Murattal",
    everyayahFolder: "Muhammad_Ayyoub_128kbps",
    bitrate: "128kbps",
  },
];

export function getReciter(id: string): Reciter | undefined {
  return RECITERS.find((r) => r.id === id);
}

export const DEFAULT_RECITER_ID = "alafasy";
