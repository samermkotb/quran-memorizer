#!/usr/bin/env python3
"""Rebuilds the bundled Quran text and English translation from their sources.

usage: python3 -I scripts/build-quran-data.py <tanzil-uthmani.xml> <tanzil-en.pickthall.txt>

Inputs (download manually, see docs/QURAN-TEXT-SOURCES.md):
  - Tanzil Quran Text, Uthmani 1.1, XML output, with pause marks, sajdah signs
    and superscript alef, without tatweel and without rub-el-hizb signs:
    https://tanzil.net/pub/download/index.php?quranType=uthmani&outType=xml&marks=true&sajdah=true&alef=true&agree=true
  - Pickthall translation, Tanzil "txt-2" format:
    https://tanzil.net/trans/?transID=en.pickthall&type=txt-2

Outputs:
  public/quran-text/{001..114}.json                  JSON array of ayah strings (index 0 = ayah 1)
  public/quran-translation/en-pickthall/{001..114}.json  same shape, English

Text is copied verbatim. The XML form keeps the Basmala in a separate
attribute, so ayah 1 of each surah is exactly the ayah (the plain-text
download prepends the Basmala to it). Nothing is normalized, trimmed or
re-spaced; the script fails if any ayah is missing or has odd whitespace.
"""

import json
import os
import re
import sys
import xml.etree.ElementTree as ET

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TOTAL_AYAHS = 6236


def fail(msg):
    sys.exit(f"build-quran-data: {msg}")


def check_spacing(where, text):
    if not text or text != text.strip() or re.search(r"\s{2,}|[\t\n\r ‏‎]", text):
        fail(f"unexpected whitespace or direction mark in {where}: {text!r}")


def read_arabic(path):
    surahs = {}
    for sura in ET.parse(path).getroot().findall("sura"):
        s = int(sura.get("index"))
        ayahs = []
        for i, aya in enumerate(sura.findall("aya"), start=1):
            if int(aya.get("index")) != i:
                fail(f"ayah order broken at {s}:{i}")
            text = aya.get("text")
            check_spacing(f"{s}:{i}", text)
            ayahs.append(text)
        surahs[s] = ayahs
    return surahs


def read_translation(path):
    surahs = {}
    with open(path, encoding="utf-8") as f:
        for line in f:
            if not line[:1].isdigit():
                continue
            s, a, text = line.rstrip("\n").split("|", 2)
            s, a = int(s), int(a)
            check_spacing(f"translation {s}:{a}", text)
            ayahs = surahs.setdefault(s, [])
            if a != len(ayahs) + 1:
                fail(f"translation ayah order broken at {s}:{a}")
            ayahs.append(text)
    return surahs


def write(dirname, surahs):
    out = os.path.join(ROOT, "public", dirname)
    os.makedirs(out, exist_ok=True)
    for s, ayahs in surahs.items():
        with open(os.path.join(out, f"{s:03d}.json"), "w", encoding="utf-8") as f:
            json.dump(ayahs, f, ensure_ascii=False, separators=(",", ":"))


def main():
    if len(sys.argv) != 3:
        fail(__doc__)
    arabic = read_arabic(sys.argv[1])
    english = read_translation(sys.argv[2])
    if sorted(arabic) != list(range(1, 115)) or sorted(english) != list(range(1, 115)):
        fail("expected 114 surahs in both sources")
    for s in range(1, 115):
        if len(arabic[s]) != len(english[s]):
            fail(f"surah {s}: {len(arabic[s])} Arabic ayahs vs {len(english[s])} English")
    total = sum(len(a) for a in arabic.values())
    if total != TOTAL_AYAHS:
        fail(f"expected {TOTAL_AYAHS} ayahs, got {total}")
    write("quran-text", arabic)
    write(os.path.join("quran-translation", "en-pickthall"), english)
    print(f"wrote 114 surahs, {total} ayahs (Arabic + English)")


if __name__ == "__main__":
    main()
