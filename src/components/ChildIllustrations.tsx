"use client";

import type { CSSProperties } from "react";

/* Muslim children reading Quran — back-view SVG illustrations */

interface IllustrationProps {
  className?: string;
  style?: CSSProperties;
}

export function ChildBoy({ className, style }: IllustrationProps) {
  return (
    <svg
      viewBox="0 0 100 130"
      className={className}
      style={style}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
    >
      {/* ground shadow */}
      <ellipse cx="50" cy="126" rx="30" ry="4" fill="#000" fillOpacity="0.07" />

      {/* open Quran – left page */}
      <path d="M10 108 Q50 99 50 99 L50 121 Q30 121 10 127 Z" fill="#FFFDE7" />
      {/* open Quran – right page */}
      <path d="M90 108 Q50 99 50 99 L50 121 Q70 121 90 127 Z" fill="#FFF9C4" />
      {/* book border */}
      <path d="M10 108 Q50 99 90 108 L90 127 Q50 121 10 127 Z" fill="none" stroke="#F59E0B" strokeWidth="0.9" />
      {/* spine */}
      <line x1="50" y1="99" x2="50" y2="121" stroke="#D97706" strokeWidth="1.4" />
      {/* Arabic text lines – left page */}
      <path d="M18 112 L45 106" stroke="#92400E" strokeWidth="0.65" opacity="0.45" />
      <path d="M18 117 L45 111" stroke="#92400E" strokeWidth="0.65" opacity="0.45" />
      <path d="M18 122 L45 116" stroke="#92400E" strokeWidth="0.65" opacity="0.45" />
      {/* Arabic text lines – right page */}
      <path d="M55 106 L82 112" stroke="#92400E" strokeWidth="0.65" opacity="0.45" />
      <path d="M55 111 L82 117" stroke="#92400E" strokeWidth="0.65" opacity="0.45" />
      <path d="M55 116 L82 122" stroke="#92400E" strokeWidth="0.65" opacity="0.45" />

      {/* cross-legged legs */}
      <ellipse cx="30" cy="109" rx="25" ry="10" fill="#4F46E5" />
      <ellipse cx="70" cy="109" rx="25" ry="10" fill="#4338CA" />

      {/* torso / back */}
      <path d="M33 54 Q29 88 27 100 L73 100 Q71 88 67 54 Z" fill="#6366F1" />

      {/* left arm */}
      <path d="M35 67 Q17 83 13 107" stroke="#F4A261" strokeWidth="9" strokeLinecap="round" />
      {/* right arm */}
      <path d="M65 67 Q83 83 87 107" stroke="#F4A261" strokeWidth="9" strokeLinecap="round" />

      {/* neck */}
      <rect x="43" y="42" width="14" height="14" rx="4" fill="#F4A261" />

      {/* head */}
      <circle cx="50" cy="26" r="21" fill="#F4A261" />

      {/* ears */}
      <ellipse cx="29" cy="28" rx="4" ry="5" fill="#E07B5A" />
      <ellipse cx="71" cy="28" rx="4" ry="5" fill="#E07B5A" />

      {/* taqiyah cap dome */}
      <path d="M33 18 Q33 5 50 5 Q67 5 67 18 Z" fill="#F5F5F5" />
      {/* taqiyah rim */}
      <ellipse cx="50" cy="18" rx="17" ry="5.5" fill="#E0E0E0" />
    </svg>
  );
}

export function ChildGirl({ className, style }: IllustrationProps) {
  return (
    <svg
      viewBox="0 0 100 130"
      className={className}
      style={style}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
    >
      {/* ground shadow */}
      <ellipse cx="50" cy="126" rx="32" ry="4" fill="#000" fillOpacity="0.07" />

      {/* open Quran – left page */}
      <path d="M10 108 Q50 99 50 99 L50 121 Q30 121 10 127 Z" fill="#FFFDE7" />
      {/* open Quran – right page */}
      <path d="M90 108 Q50 99 50 99 L50 121 Q70 121 90 127 Z" fill="#FFF9C4" />
      {/* book border */}
      <path d="M10 108 Q50 99 90 108 L90 127 Q50 121 10 127 Z" fill="none" stroke="#F59E0B" strokeWidth="0.9" />
      {/* spine */}
      <line x1="50" y1="99" x2="50" y2="121" stroke="#D97706" strokeWidth="1.4" />
      {/* Arabic text lines – left page */}
      <path d="M18 112 L45 106" stroke="#92400E" strokeWidth="0.65" opacity="0.45" />
      <path d="M18 117 L45 111" stroke="#92400E" strokeWidth="0.65" opacity="0.45" />
      {/* Arabic text lines – right page */}
      <path d="M55 106 L82 112" stroke="#92400E" strokeWidth="0.65" opacity="0.45" />
      <path d="M55 111 L82 117" stroke="#92400E" strokeWidth="0.65" opacity="0.45" />

      {/* legs */}
      <ellipse cx="30" cy="108" rx="25" ry="10" fill="#0D9488" />
      <ellipse cx="70" cy="108" rx="25" ry="10" fill="#0F766E" />

      {/* dress / body (wider hem) */}
      <path d="M27 60 Q21 92 19 104 L81 104 Q79 92 73 60 Z" fill="#2DD4BF" />

      {/* left arm */}
      <path d="M30 73 Q13 88 10 107" stroke="#F4A261" strokeWidth="9" strokeLinecap="round" />
      {/* right arm */}
      <path d="M70 73 Q87 88 90 107" stroke="#F4A261" strokeWidth="9" strokeLinecap="round" />

      {/* hijab draping over shoulders (back visible) */}
      <path d="M19 56 Q15 30 50 20 Q85 30 81 56 Q80 67 50 71 Q20 67 19 56 Z" fill="#FB7185" />

      {/* neck (partly covered) */}
      <rect x="43" y="50" width="14" height="12" rx="3" fill="#F4A261" />

      {/* head */}
      <circle cx="50" cy="32" r="21" fill="#F4A261" />

      {/* hijab over head */}
      <path d="M22 38 Q23 13 50 9 Q77 13 78 38 Q73 54 50 57 Q27 54 22 38 Z" fill="#FB7185" />

      {/* hijab front edge */}
      <path d="M22 38 Q28 56 50 59 Q72 56 78 38" fill="none" stroke="#E11D48" strokeWidth="1.1" strokeLinecap="round" />
    </svg>
  );
}

export function ChildBoy2({ className, style }: IllustrationProps) {
  return (
    <svg
      viewBox="0 0 100 130"
      className={className}
      style={style}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
    >
      {/* ground shadow */}
      <ellipse cx="50" cy="126" rx="28" ry="4" fill="#000" fillOpacity="0.07" />

      {/* open Quran – left page */}
      <path d="M12 110 Q50 101 50 101 L50 122 Q32 122 12 127 Z" fill="#FFFDE7" />
      {/* open Quran – right page */}
      <path d="M88 110 Q50 101 50 101 L50 122 Q68 122 88 127 Z" fill="#FFF9C4" />
      {/* book border */}
      <path d="M12 110 Q50 101 88 110 L88 127 Q50 122 12 127 Z" fill="none" stroke="#F59E0B" strokeWidth="0.9" />
      {/* spine */}
      <line x1="50" y1="101" x2="50" y2="122" stroke="#D97706" strokeWidth="1.4" />
      {/* text lines */}
      <path d="M20 113 L46 108" stroke="#92400E" strokeWidth="0.65" opacity="0.4" />
      <path d="M20 118 L46 113" stroke="#92400E" strokeWidth="0.65" opacity="0.4" />
      <path d="M54 108 L80 113" stroke="#92400E" strokeWidth="0.65" opacity="0.4" />
      <path d="M54 113 L80 118" stroke="#92400E" strokeWidth="0.65" opacity="0.4" />

      {/* legs */}
      <ellipse cx="31" cy="111" rx="23" ry="9" fill="#EA580C" />
      <ellipse cx="69" cy="111" rx="23" ry="9" fill="#C2410C" />

      {/* body */}
      <path d="M34 57 Q30 90 28 102 L72 102 Q70 90 66 57 Z" fill="#F97316" />

      {/* arms */}
      <path d="M36 69 Q19 84 15 109" stroke="#FBBF8C" strokeWidth="9" strokeLinecap="round" />
      <path d="M64 69 Q81 84 85 109" stroke="#FBBF8C" strokeWidth="9" strokeLinecap="round" />

      {/* neck */}
      <rect x="43" y="44" width="14" height="15" rx="4" fill="#FBBF8C" />

      {/* head (slightly lighter skin) */}
      <circle cx="50" cy="28" r="21" fill="#FBBF8C" />

      {/* ears */}
      <ellipse cx="29" cy="30" rx="4" ry="5" fill="#F59E7A" />
      <ellipse cx="71" cy="30" rx="4" ry="5" fill="#F59E7A" />

      {/* green taqiyah */}
      <path d="M33 20 Q33 7 50 7 Q67 7 67 20 Z" fill="#34D399" />
      <ellipse cx="50" cy="20" rx="17" ry="5.5" fill="#10B981" />
    </svg>
  );
}

export function ChildGirl2({ className, style }: IllustrationProps) {
  return (
    <svg
      viewBox="0 0 100 130"
      className={className}
      style={style}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
    >
      {/* ground shadow */}
      <ellipse cx="50" cy="126" rx="30" ry="4" fill="#000" fillOpacity="0.07" />

      {/* open Quran – left page */}
      <path d="M10 108 Q50 99 50 99 L50 121 Q30 121 10 127 Z" fill="#FFFDE7" />
      {/* open Quran – right page */}
      <path d="M90 108 Q50 99 50 99 L50 121 Q70 121 90 127 Z" fill="#FFF9C4" />
      <path d="M10 108 Q50 99 90 108 L90 127 Q50 121 10 127 Z" fill="none" stroke="#F59E0B" strokeWidth="0.9" />
      <line x1="50" y1="99" x2="50" y2="121" stroke="#D97706" strokeWidth="1.4" />
      <path d="M18 112 L45 106" stroke="#92400E" strokeWidth="0.65" opacity="0.4" />
      <path d="M18 117 L45 111" stroke="#92400E" strokeWidth="0.65" opacity="0.4" />
      <path d="M55 106 L82 112" stroke="#92400E" strokeWidth="0.65" opacity="0.4" />
      <path d="M55 111 L82 117" stroke="#92400E" strokeWidth="0.65" opacity="0.4" />

      {/* legs */}
      <ellipse cx="30" cy="108" rx="25" ry="10" fill="#7C3AED" />
      <ellipse cx="70" cy="108" rx="25" ry="10" fill="#6D28D9" />

      {/* dress */}
      <path d="M27 60 Q21 92 19 104 L81 104 Q79 92 73 60 Z" fill="#A78BFA" />

      {/* arms */}
      <path d="M30 73 Q13 88 10 107" stroke="#F4A261" strokeWidth="9" strokeLinecap="round" />
      <path d="M70 73 Q87 88 90 107" stroke="#F4A261" strokeWidth="9" strokeLinecap="round" />

      {/* yellow hijab draping over shoulders */}
      <path d="M19 56 Q15 30 50 20 Q85 30 81 56 Q80 67 50 71 Q20 67 19 56 Z" fill="#FCD34D" />

      {/* neck */}
      <rect x="43" y="50" width="14" height="12" rx="3" fill="#F4A261" />

      {/* head */}
      <circle cx="50" cy="32" r="21" fill="#F4A261" />

      {/* yellow hijab over head */}
      <path d="M22 38 Q23 13 50 9 Q77 13 78 38 Q73 54 50 57 Q27 54 22 38 Z" fill="#FCD34D" />

      {/* hijab front edge */}
      <path d="M22 38 Q28 56 50 59 Q72 56 78 38" fill="none" stroke="#F59E0B" strokeWidth="1.1" strokeLinecap="round" />
    </svg>
  );
}
