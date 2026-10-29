#!/bin/bash
# Reproduces public/backgrounds/*.mp4 + *.jpg from the original Wikimedia Commons
# files (see docs/VIDEO-ASSET-LICENSES.md for each source URL and license).
#
# usage: scripts/process-backgrounds.sh <raw-dir> <out-dir>
#   <raw-dir> holds the originals named by the ids below (e.g. rain_d.webm, waves_a.ogv).
#   Each clip is trimmed, center-cropped to 9:16, scaled to 720x1280 @ 30 fps,
#   made to loop seamlessly, and encoded as H.264 (no audio).
#   Loop modes: "xfade" adds a 1 s crossfade at the loop point; "pingpong" plays
#   the segment forward then backward (used for short camera pans).
# Requires ffmpeg/ffprobe and python3.
set -u
RAW="$1"; OUT="$2"; mkdir -p "$OUT"
# id | out name | start offset | pre-crop (ffmpeg crop args, or "none") | horizontal crop anchor (0..1) | length (s, or "auto") | loop mode
while IFS='|' read id name ss pre anchor len mode; do
  f=$(ls "$RAW"/$id.*)
  dur=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$f")
  if [ "$len" = "auto" ]; then
    L=$(python3 -c "print(round(min(16.0, float('$dur')-float('$ss')-1.2),2))")
  else
    L=$len
  fi
  F=1
  if [ "$pre" = "none" ]; then PRE=""; else PRE="crop=$pre,"; fi
  CROP="${PRE}crop=ih*9/16:ih:(iw-ih*9/16)*$anchor:0,scale=720:1280:flags=lanczos,fps=30,format=yuv420p,setsar=1"
  if [ "$mode" = "pingpong" ]; then
    GRAPH="[0:v]${CROP},trim=0:${L},setpts=PTS-STARTPTS,split[a][b];[b]reverse[r];[a][r]concat=n=2:v=1:a=0,format=yuv420p[v]"
  else
    END=$(python3 -c "print($L+$F)")
    XO=$(python3 -c "print($L-$F)")
    GRAPH="[0:v]${CROP},trim=0:${END},setpts=PTS-STARTPTS,split[a][b];[a]trim=${F}:${END},setpts=PTS-STARTPTS[main];[b]trim=0:${F},setpts=PTS-STARTPTS[head];[main][head]xfade=transition=fade:duration=${F}:offset=${XO},format=yuv420p[v]"
  fi
  ffmpeg -nostdin -v error -y -ss "$ss" -i "$f" -an -filter_complex "$GRAPH" \
    -map "[v]" -c:v libx264 -profile:v high -level 4.0 -preset slow -crf 27 -maxrate 1500k -bufsize 3000k -g 60 -movflags +faststart "$OUT/$name.mp4"
  ffmpeg -nostdin -v error -y -ss 2 -i "$OUT/$name.mp4" -frames:v 1 -vf scale=270:480:flags=lanczos -q:v 4 "$OUT/$name.jpg"
  echo "$name L=$L $(stat -f%z "$OUT/$name.mp4") bytes"
done <<LIST
rain_d|river-diana-creek|0|none|0.45|auto|xfade
drone_a|ocean-aerial|0|none|0.5|auto|xfade
rain_c|rain-forest|0|none|0.5|auto|xfade
cloud_a|mountain-clouds|0|none|0.6|auto|xfade
desert_a|desert-sunset|0|1920:788:0:146|0.35|auto|xfade
waves_a|ocean-waves|0|none|0.5|auto|xfade
night_c|night-aurora|0|none|0.5|auto|xfade
valley_b|green-valley|0|none|0.5|auto|xfade
embers|embers-glow|9.5|none|0.5|8|xfade
sun|sun-sdo|2|iw:ih*0.9:0:ih*0.04|0.5|14|xfade
space|deep-space|6|none|0.5|9.5|xfade
garden|lavender-garden|1|none|0.5|12|xfade
waterfall|waterfall-nimrod|0.5|none|0.5|10|xfade
storm|lightning-storm|4|none|0.55|16|xfade
snow|snowy-mountains|1.6|none|0.5|3.4|pingpong
autumn|autumn-forest|0|none|0.5|3|pingpong
meadow|flower-meadow|124.5|none|0.5|12|xfade
dawn|golden-dawn|14|none|0.55|13|xfade
LIST
