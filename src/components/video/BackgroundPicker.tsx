"use client";

import { Dispatch, SetStateAction, useEffect, useId, useRef } from "react";
import { BACKGROUNDS, ProceduralBackground } from "@/lib/video/backgrounds";
import { drawProceduralScene } from "@/lib/video/proceduralScenes";
import { useApp } from "@/contexts/AppContext";

interface Props {
  selected: string[];
  onChange: Dispatch<SetStateAction<string[]>>;
  disabled?: boolean;
}

function ProceduralThumb({ bg }: { bg: ProceduralBackground }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    drawProceduralScene(bg.scene, ctx, canvas.width, canvas.height, 4);
  }, [bg.scene]);
  return <canvas ref={ref} width={270} height={480} className="absolute inset-0 w-full h-full object-cover" aria-hidden="true" />;
}

export default function BackgroundPicker({ selected, onChange, disabled }: Props) {
  const { theme, tr, lang } = useApp();
  const labelId = useId();

  function toggle(id: string) {
    if (disabled) return;
    // Functional update so rapid taps never act on a stale selection.
    onChange((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]));
  }

  return (
    <div role="group" aria-labelledby={labelId} className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <span id={labelId} className={`text-sm ${theme.label}`}>
          {tr("videoBackgrounds")}{" "}
          <span className={`font-normal text-xs ${theme.muted}`}>
            ({selected.length} {tr("videoSelected")})
          </span>
        </span>
        <div className="flex gap-1.5">
          <button
            type="button"
            disabled={disabled}
            onClick={() => onChange(BACKGROUNDS.map((b) => b.id))}
            className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${theme.chip}`}
          >
            {tr("videoSelectAll")}
          </button>
          <button
            type="button"
            disabled={disabled}
            onClick={() => onChange([])}
            className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${theme.chip}`}
          >
            {tr("videoClear")}
          </button>
        </div>
      </div>
      <p className={`text-xs ${theme.muted}`}>{tr("videoBackgroundsHint")}</p>

      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
        {BACKGROUNDS.map((bg) => {
          const order = selected.indexOf(bg.id);
          const isSelected = order !== -1;
          const name = lang === "ar" ? bg.nameAr : bg.nameEn;
          return (
            <button
              key={bg.id}
              type="button"
              disabled={disabled}
              onClick={() => toggle(bg.id)}
              aria-pressed={isSelected}
              aria-label={name}
              className={`relative aspect-[9/14] overflow-hidden rounded-[10px] text-start transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-600 disabled:opacity-60 ${
                isSelected ? `${theme.reciterCardActive} scale-[0.98]` : "opacity-90 hover:opacity-100"
              }`}
            >
              {bg.kind === "video" ? (
                // eslint-disable-next-line @next/next/no-img-element -- tiny static poster; next/image adds nothing here
                <img src={bg.poster} alt="" loading="lazy" className="absolute inset-0 w-full h-full object-cover" />
              ) : (
                <ProceduralThumb bg={bg} />
              )}
              <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent px-1.5 pb-1.5 pt-5 text-[11px] leading-tight font-semibold text-white">
                {name}
              </span>
              {isSelected && (
                <span
                  className="absolute top-1.5 end-1.5 min-w-6 h-6 px-1 rounded-full bg-gold-600 text-ink-900 text-xs font-bold flex items-center justify-center shadow"
                  aria-hidden="true"
                >
                  {selected.length > 1 ? order + 1 : "✓"}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
