"use client";

import { Background, BACKGROUNDS } from "@/lib/video/backgrounds";
import { useApp } from "@/contexts/AppContext";

function CreditItem({ bg }: { bg: Background }) {
  const { theme, tr, lang } = useApp();
  const c = bg.credit;
  return (
    <li className="space-y-0.5">
      <div className={`font-semibold ${theme.primary}`}>{lang === "ar" ? bg.nameAr : bg.nameEn}</div>
      <div dir="ltr" className={`text-start ${theme.muted}`}>
        “<bdi>{c.title}</bdi>” — <bdi>{c.author}</bdi>
      </div>
      <div className={theme.muted}>
        {tr("videoCreditLicense")}:{" "}
        {c.licenseUrl ? (
          <a href={c.licenseUrl} target="_blank" rel="noopener noreferrer" className={theme.footerLink} dir="ltr">
            {c.license}
          </a>
        ) : (
          <span dir="ltr">{c.license}</span>
        )}
        {c.sourceUrl && (
          <>
            {" · "}
            <a href={c.sourceUrl} target="_blank" rel="noopener noreferrer" className={theme.footerLink}>
              {tr("videoCreditSource")}
            </a>
          </>
        )}
      </div>
      <div dir="ltr" className={`text-start ${theme.muted}`}>
        {tr("videoCreditChanges")}: {c.modifications}
      </div>
    </li>
  );
}

/** Full attribution list for the built-in backgrounds (required for CC BY assets). */
export default function VideoCredits({ inVideo }: { inVideo?: Background[] }) {
  const { theme, tr } = useApp();
  return (
    <div className="space-y-3 text-xs">
      {inVideo && inVideo.length > 0 && (
        <div className={`p-3 ${theme.ayahPreviewBox}`}>
          <div className={`mb-2 font-semibold ${theme.label}`}>{tr("videoCreditsInVideo")}</div>
          <ul className="space-y-2">
            {inVideo.map((bg) => (
              <CreditItem key={bg.id} bg={bg} />
            ))}
          </ul>
        </div>
      )}
      <details className="group">
        <summary className={`cursor-pointer select-none font-medium ${theme.footerLink}`}>{tr("videoCredits")}</summary>
        <ul className="mt-2 space-y-2.5">
          {BACKGROUNDS.map((bg) => (
            <CreditItem key={bg.id} bg={bg} />
          ))}
        </ul>
      </details>
    </div>
  );
}
