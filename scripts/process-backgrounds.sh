#!/bin/bash
# Reproduces public/backgrounds/*.mp4 + *.jpg from the original Wikimedia Commons
# files (see docs/VIDEO-ASSET-LICENSES.md for each source URL and license).
#
# usage: scripts/process-backgrounds.sh <raw-dir> <out-dir>
#   <raw-dir> holds the originals named by the ids below (e.g. rain_d.webm, waves_a.ogv).
#   Each clip is trimmed, center-cropped to 9:16, scaled to 720x1280 @ 30 fps,
#   given a 1 s crossfade at the loop point, and encoded as H.264 (no audio).
# Requires ffmpeg/ffprobe and python3.
set -u
RAW="$1"; OUT="$2"; mkdir -p "$OUT"
# id | out name | start offset | pre-crop (letterbox removal, or "none") | horizontal crop anchor (0..1)
while IFS='|' read id name ss pre anchor; do
  f=$(ls "$RAW"/$id.*)
  dur=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$f")
  L=$(python3 -c "print(round(min(16.0, float('$dur')-float('$ss')-1.2),2))")
  F=1
  if [ "$pre" = "none" ]; then PRE=""; else PRE="crop=$pre,"; fi
  CROP="${PRE}crop=ih*9/16:ih:(iw-ih*9/16)*$anchor:0,scale=720:1280:flags=lanczos,fps=30,format=yuv420p,setsar=1"
  END=$(python3 -c "print($L+$F)")
  XO=$(python3 -c "print($L-$F)")
  ffmpeg -nostdin -v error -y -ss "$ss" -i "$f" -an -filter_complex \
    "[0:v]${CROP},trim=0:${END},setpts=PTS-STARTPTS,split[a][b];[a]trim=${F}:${END},setpts=PTS-STARTPTS[main];[b]trim=0:${F},setpts=PTS-STARTPTS[head];[main][head]xfade=transition=fade:duration=${F}:offset=${XO},format=yuv420p[v]" \
    -map "[v]" -c:v libx264 -profile:v high -level 4.0 -preset slow -crf 27 -maxrate 1500k -bufsize 3000k -g 60 -movflags +faststart "$OUT/$name.mp4"
  ffmpeg -nostdin -v error -y -ss 2 -i "$OUT/$name.mp4" -frames:v 1 -vf scale=270:480:flags=lanczos -q:v 4 "$OUT/$name.jpg"
  echo "$name L=$L $(stat -f%z "$OUT/$name.mp4") bytes"
done <<LIST
rain_d|river-diana-creek|0|none|0.45
drone_a|ocean-aerial|0|none|0.5
rain_c|rain-forest|0|none|0.5
cloud_a|mountain-clouds|0|none|0.6
desert_a|desert-sunset|0|1920:788:0:146|0.35
waves_a|ocean-waves|0|none|0.5
night_c|night-aurora|0|none|0.5
valley_b|green-valley|0|none|0.5
LIST
