import React from "react";
import { createPortal } from "react-dom";

function IeppalFaceLogo({ size = 64 }) {
  const ring = size;
  const inner = size * 0.75;
  const offset = (ring - inner) / 2;

  return (
    <div style={{ width: ring, height: ring, position: 'relative' }} className="animate-spin">
      {/* Gradient ring */}
      <div
        style={{ width: ring, height: ring, borderRadius: '9999px', background: 'linear-gradient(135deg, rgba(96,165,250,0.3), rgba(192,132,252,0.3))', position: 'absolute', inset: 0 }}
      />
      {/* White circle */}
      <div
        style={{ width: inner, height: inner, borderRadius: '9999px', background: 'white', position: 'absolute', top: offset, left: offset }}
      />
      {/* Face SVG */}
      <svg
        viewBox="0 0 500 500"
        xmlns="http://www.w3.org/2000/svg"
        style={{ width: ring, height: ring, position: 'absolute', inset: 0 }}
      >
        <g transform="translate(0,500) scale(0.1,-0.1)" fill="#000000" stroke="none">
          <path d="M2155 4859 c-257 -37 -457 -100 -710 -224 -817 -398 -1326 -1217 -1326 -2134 0 -390 76 -717 247 -1060 378 -763 1098 -1245 1969 -1320 235 -20 567 17 831 93 401 116 747 325 1044 632 377 389 592 847 661 1407 17 143 7 479 -20 630 -63 354 -180 654 -364 930 -296 442 -677 743 -1178 930 -136 51 -260 82 -451 111 -210 33 -497 35 -703 5z m525 -510 c725 -66 1349 -563 1580 -1256 195 -586 94 -1218 -271 -1706 -108 -144 -300 -327 -446 -424 -218 -146 -427 -234 -692 -290 -116 -26 -143 -28 -351 -27 -205 0 -236 3 -351 27 -416 88 -769 286 -1029 579 -328 370 -496 833 -477 1318 11 266 69 503 181 737 262 545 790 939 1377 1027 186 28 301 32 479 15z" />
          <path d="M2182 3594 c-182 -90 -218 -331 -72 -473 110 -107 290 -106 399 1 59 59 83 110 89 189 6 90 -16 154 -76 218 -64 68 -117 91 -213 91 -61 0 -85 -5 -127 -26z" />
          <path d="M3394 3596 c-60 -28 -116 -82 -144 -140 -31 -65 -28 -185 6 -254 28 -56 73 -100 137 -134 64 -34 184 -32 253 4 58 31 108 83 135 142 27 59 26 185 -1 242 -50 102 -149 164 -265 164 -53 0 -83 -6 -121 -24z" />
          <path d="M2265 2626 c-95 -44 -146 -127 -146 -238 0 -104 41 -167 154 -242 341 -225 792 -258 1151 -86 91 44 221 126 248 156 58 68 79 162 53 250 -22 76 -96 153 -168 173 -77 22 -158 10 -226 -34 -157 -101 -289 -141 -439 -132 -133 8 -237 44 -347 120 -28 18 -65 39 -84 45 -56 20 -140 15 -196 -12z" />
        </g>
      </svg>
    </div>
  );
}

export default function LoadingSpinner({ size = "md" }) {
  const sizes = { sm: 32, md: 64, lg: 96 };

  if (typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed top-0 bottom-0 left-16 right-0 flex items-center justify-center pointer-events-none z-40">
      <IeppalFaceLogo size={sizes[size]} />
    </div>,
    document.body
  );
}

export function InlineSpinner({ className = "w-4 h-4" }) {
  return (
    <span className={`inline-block ${className}`}>
      <IeppalFaceLogo size={16} />
    </span>
  );
}
