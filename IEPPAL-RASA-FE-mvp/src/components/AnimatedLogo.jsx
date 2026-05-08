// src/components/AnimatedLogo.jsx
// Animated IEPPAL face/logo — ported from the info-site dashboard.
// Drop into any page: <AnimatedLogo />

import React, { useEffect, useRef, useCallback } from "react";

const MESSAGES = [
  "Check out our LinkedIn!",
  "Hi! Nice to meet you!",
  "Welcome!",
  "Check out our about page!",
  "Wanna get involved? Go to our contact page!",
  "Interested? Check out our contact page!",
];

export default function AnimatedLogo() {
  const svgRef = useRef(null);
  const eyeLRef = useRef(null);
  const eyeRRef = useRef(null);
  const faceContainerRef = useRef(null);
  const haloRef = useRef(null);
  const speechBubbleRef = useRef(null);
  const speechTextRef = useRef(null);
  const faceCardRef = useRef(null);

  // Mutable refs for animation state (avoids re-renders)
  const state = useRef({
    faceCenter: { x: 0, y: 0 },
    currentOffset: { x: 0, y: 0 },
    eyeCooldownUntil: 0,
    blinkBothScale: 1,
    winkScaleLeft: 1,
    winkScaleRight: 1,
    tilting: false,
    spinning: false,
  });

  /* ---------- helpers ---------- */
  const now = () => Date.now();
  const canEyeAction = () => now() >= state.current.eyeCooldownUntil;
  const startEyeCooldown = () => {
    state.current.eyeCooldownUntil = now() + 1000;
  };

  const updateFaceCenter = useCallback(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    state.current.faceCenter.x = rect.left + rect.width / 2;
    state.current.faceCenter.y = rect.top + rect.height / 2;
  }, []);

  const updateEyes = useCallback(() => {
    const s = state.current;
    const tL = `translate(${s.currentOffset.x}px, ${s.currentOffset.y}px) scaleY(${s.blinkBothScale * s.winkScaleLeft})`;
    const tR = `translate(${s.currentOffset.x}px, ${s.currentOffset.y}px)`;
    if (eyeLRef.current) eyeLRef.current.style.transform = tL;
    if (eyeRRef.current) eyeRRef.current.style.transform = tR;
  }, []);

  /* ---------- lifecycle ---------- */
  useEffect(() => {
    const timeouts = [];
    const t = (fn, ms) => {
      const id = setTimeout(fn, ms);
      timeouts.push(id);
      return id;
    };

    updateFaceCenter();

    /* --- eye tracking --- */
    const onMouseMove = (e) => {
      const fc = state.current.faceCenter;
      const dx = e.clientX - fc.x;
      const dy = e.clientY - fc.y;
      const dist = Math.hypot(dx, dy);
      const factor = dist > 0 ? Math.min(6 / dist, 1) : 0;
      state.current.currentOffset.x = dx * factor;
      state.current.currentOffset.y = dy * factor;
      updateEyes();
    };
    window.addEventListener("mousemove", onMouseMove);

    /* --- resize --- */
    const onResize = () => {
      updateFaceCenter();
      positionAndClampBubble();
    };
    window.addEventListener("resize", onResize);

    /* --- twinkle star --- */
    function spawnStar(side) {
      const container = faceContainerRef.current;
      if (!container) return;
      const star = document.createElement("div");
      star.className = "alogo-star";
      const x = side === "left" ? 38 : 62;
      const y = 28;
      star.style.cssText = `left:${x}%;top:${y}%;`;
      container.appendChild(star);
      setTimeout(() => star.remove(), 1200);
    }

    /* --- blink (left eye only) with sparkle --- */
    function doBlink() {
      if (!canEyeAction()) return;
      startEyeCooldown();
      spawnStar("left");
      state.current.blinkBothScale = 0.05;
      updateEyes();
      t(() => {
        state.current.blinkBothScale = 1;
        updateEyes();
      }, 150);
    }

    /* --- head nod --- */
    function doHeadNod() {
      const svg = svgRef.current;
      const halo = haloRef.current;
      if (!svg || svg.classList.contains("nod")) return;
      svg.classList.add("nod");
      if (halo) halo.style.opacity = "0.8";
      t(() => {
        svg.classList.remove("nod");
        if (halo) halo.style.opacity = "0.5";
      }, 800);
    }

    /* --- wink with nod (left eye only) --- */
    function doWink() {
      if (!canEyeAction()) return;
      startEyeCooldown();
      doHeadNod();
      spawnStar("left");
      state.current.winkScaleLeft = 0.05;
      updateEyes();
      t(() => {
        state.current.winkScaleLeft = 1;
        updateEyes();
      }, 300);
    }

    /* --- schedule blink --- */
    function scheduleBlink() {
      t(() => {
        doBlink();
        scheduleBlink();
      }, 2000 + Math.random() * 3000);
    }
    t(scheduleBlink, 3000 + Math.random() * 1000);

    /* --- tilt --- */
    function tilt() {
      const svg = svgRef.current;
      const halo = haloRef.current;
      if (!svg) return;
      state.current.tilting = true;
      const angle = Math.random() < 0.5 ? -8 : 8;
      svg.style.transition = "transform 0.6s ease-in-out";
      svg.style.transform = `rotate(${angle}deg)`;
      if (halo) halo.style.opacity = "0.8";
      t(() => {
        svg.style.transform = "";
        state.current.tilting = false;
        if (halo) halo.style.opacity = "0.5";
      }, 600);
    }

    /* --- random action (mostly tilts, rare winks) --- */
    function scheduleRandomAction() {
      const picks = [tilt, tilt, tilt, doWink, doWink];
      picks[Math.floor(Math.random() * picks.length)]();
      t(scheduleRandomAction, 4000 + Math.random() * 5000);
    }
    t(scheduleRandomAction, 8000 + Math.random() * 4000);

    /* --- guaranteed early wink --- */
    t(() => doWink(), 4000 + Math.random() * 2000);

    /* --- click to spin --- */
    const container = faceContainerRef.current;
    const onClickSpin = () => {
      const svg = svgRef.current;
      const halo = haloRef.current;
      const bubble = speechBubbleRef.current;
      if (state.current.spinning || !svg) return;
      state.current.spinning = true;
      svg.classList.add("alogo-spin");
      if (halo) halo.style.opacity = "0.8";
      if (bubble) bubble.style.opacity = "0";
      t(() => {
        svg.classList.remove("alogo-spin");
        if (halo) halo.style.opacity = "0.5";
        state.current.spinning = false;
      }, 1000);
    };
    if (container) container.addEventListener("click", onClickSpin);

    /* --- halo hover --- */
    const onEnter = () => {
      if (haloRef.current) haloRef.current.style.opacity = "0.7";
    };
    const onLeave = () => {
      if (
        haloRef.current &&
        !state.current.tilting &&
        !state.current.spinning
      )
        haloRef.current.style.opacity = "0.5";
    };
    if (container) {
      container.addEventListener("mouseenter", onEnter);
      container.addEventListener("mouseleave", onLeave);
    }

    /* --- speech bubble positioning --- */
    function positionAndClampBubble() {
      const bubble = speechBubbleRef.current;
      const card = faceCardRef.current;
      const face = faceContainerRef.current;
      if (!bubble || !card || !face) return;

      const isMobile = window.innerWidth <= 768;
      if (isMobile) {
        bubble.style.transform = "translateX(50%)";
        bubble.style.maxWidth = "280px";
        return;
      }

      bubble.style.transform = "translateY(-50%)";
      bubble.style.maxWidth = "26rem";

      const cardRect = card.getBoundingClientRect();
      const faceRect = face.getBoundingClientRect();

      const cardPad = 8;
      const gap = 12;
      const tail = 22;

      const availableLeft = Math.max(
        60,
        Math.floor(faceRect.left - gap - tail - (cardRect.left + cardPad))
      );
      bubble.style.maxWidth = availableLeft + "px";

      const bubbleRect = bubble.getBoundingClientRect();

      let offsetX = 0;
      const overflowLeft = cardRect.left + cardPad - bubbleRect.left;
      if (overflowLeft > 0) offsetX += overflowLeft;

      let offsetY = 0;
      const overflowTop = cardRect.top + cardPad - bubbleRect.top;
      const overflowBottom = bubbleRect.bottom - (cardRect.bottom - cardPad);
      if (overflowTop > 0) offsetY += overflowTop;
      if (overflowBottom > 0) offsetY -= overflowBottom;

      bubble.style.transform = `translateY(calc(-50% + ${offsetY}px)) translateX(${offsetX}px)`;
    }

    /* --- speech bubble show --- */
    function showSpeech() {
      const bubble = speechBubbleRef.current;
      const textEl = speechTextRef.current;
      if (!bubble || !textEl) return;

      if (!state.current.tilting && !state.current.spinning) {
        const msg = MESSAGES[Math.floor(Math.random() * MESSAGES.length)];
        textEl.textContent = msg;

        const prevVis = bubble.style.visibility;
        bubble.style.visibility = "hidden";
        bubble.style.opacity = "0";
        requestAnimationFrame(() => {
          positionAndClampBubble();
          bubble.style.visibility = prevVis || "visible";
          bubble.style.opacity = "1";
          t(() => {
            bubble.style.opacity = "0";
          }, 3000);
        });
      }
      t(showSpeech, 10000 + Math.random() * 10000);
    }
    t(showSpeech, 8000 + Math.random() * 4000);

    /* --- cleanup --- */
    return () => {
      timeouts.forEach(clearTimeout);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("resize", onResize);
      if (container) {
        container.removeEventListener("click", onClickSpin);
        container.removeEventListener("mouseenter", onEnter);
        container.removeEventListener("mouseleave", onLeave);
      }
    };
  }, [updateEyes, updateFaceCenter]);

  /* ==================== JSX ==================== */
  return (
    <>
      <style>{animatedLogoStyles}</style>

      <div className="alogo-face-card" ref={faceCardRef}>
        <div className="alogo-relative">
          {/* hover glow */}
          <div className="alogo-hover-glow" />

          <div className="alogo-inner">
            <div
              id="alogo-face-container"
              className="alogo-face-container alogo-bobbing"
              ref={faceContainerRef}
            >
              <div className="alogo-halo" ref={haloRef} />
              <div className="alogo-face-bg" />

              {/* Speech bubble */}
              <div
                className="alogo-speech-bubble"
                ref={speechBubbleRef}
                style={{ opacity: 0 }}
              >
                <span ref={speechTextRef} />
              </div>

              {/* SVG logo */}
              <svg
                ref={svgRef}
                id="alogo-svg"
                viewBox="0 0 500 500"
                className="alogo-svg"
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
              >
                <g
                  transform="translate(0.000000,500.000000) scale(0.100000,-0.100000)"
                  fill="#000000"
                  stroke="none"
                >
                  <path d="M2155 4859 c-257 -37 -457 -100 -710 -224 -817 -398 -1326 -1217 -1326 -2134 0 -390 76 -717 247 -1060 378 -763 1098 -1245 1969 -1320 235 -20 567 17 831 93 401 116 747 325 1044 632 377 389 592 847 661 1407 17 143 7 479 -20 630 -63 354 -180 654 -364 930 -296 442 -677 743 -1178 930 -136 51 -260 82 -451 111 -210 33 -497 35 -703 5z m525 -510 c725 -66 1349 -563 1580 -1256 195 -586 94 -1218 -271 -1706 -108 -144 -300 -327 -446 -424 -218 -146 -427 -234 -692 -290 -116 -26 -143 -28 -351 -27 -205 0 -236 3 -351 27 -416 88 -769 286 -1029 579 -328 370 -496 833 -477 1318 11 266 69 503 181 737 262 545 790 939 1377 1027 186 28 301 32 479 15z" />
                  <g ref={eyeLRef} id="alogo-eye-left">
                    <path d="M2182 3594 c-182 -90 -218 -331 -72 -473 110 -107 290 -106 399 1 59 59 83 110 89 189 6 90 -16 154 -76 218 -64 68 -117 91 -213 91 -61 0 -85 -5 -127 -26z" />
                  </g>
                  <g ref={eyeRRef} id="alogo-eye-right">
                    <path d="M3394 3596 c-60 -28 -116 -82 -144 -140 -31 -65 -28 -185 6 -254 28 -56 73 -100 137 -134 64 -34 184 -32 253 4 58 31 108 83 135 142 27 59 26 185 -1 242 -50 102 -149 164 -265 164 -53 0 -83 -6 -121 -24z" />
                  </g>
                  <g id="alogo-mouth" style={{ opacity: 1 }}>
                    <path d="M2265 2626 c-95 -44 -146 -127 -146 -238 0 -104 41 -167 154 -242 341 -225 792 -258 1151 -86 91 44 221 126 248 156 58 68 79 162 53 250 -22 76 -96 153 -168 173 -77 22 -158 10 -226 -34 -157 -101 -289 -141 -439 -132 -133 8 -237 44 -347 120 -28 18 -65 39 -84 45 -56 20 -140 15 -196 -12z" />
                  </g>
                </g>
                <ellipse
                  id="alogo-tongue"
                  cx="250"
                  cy="310"
                  rx="30"
                  ry="15"
                  fill="#e74c3c"
                  style={{ opacity: 0 }}
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/* ==================== Styles (scoped via prefix) ==================== */
const animatedLogoStyles = `
  /* Bobbing */
  @keyframes alogo-bob {
    0%, 100% { transform: translateY(0); }
    50%      { transform: translateY(-6px); }
  }
  .alogo-bobbing { animation: alogo-bob 4s ease-in-out infinite; }

  /* Head nod */
  @keyframes alogo-headNod {
    0%   { transform: rotate(0deg); }
    25%  { transform: rotate(-5deg); }
    75%  { transform: rotate(5deg); }
    100% { transform: rotate(0deg); }
  }
  #alogo-svg.nod { animation: alogo-headNod 0.8s ease-in-out; }

  /* Spin */
  @keyframes alogo-logoSpin {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }
  #alogo-svg.alogo-spin { animation: alogo-logoSpin 1s ease-in-out; }

  /* Halo */
  @keyframes alogo-haloPulse {
    0%, 100% { transform: scale(1); }
    50%      { transform: scale(1.1); }
  }
  .alogo-halo {
    position: absolute; inset: 0; border-radius: 9999px; pointer-events: none;
    background: radial-gradient(circle,
      rgba(255,255,255,0.6) 0%,
      rgba(150,197,255,0.3) 40%,
      rgba(204,153,255,0.1) 60%,
      rgba(255,255,255,0) 80%);
    opacity: 0.5;
    transition: opacity 0.4s ease;
    animation: alogo-haloPulse 6s ease-in-out infinite;
  }

  /* Face card (glass) */
  .alogo-face-card {
    background: rgba(255,255,255,0.1);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255,255,255,0.2);
    border-radius: 16px;
    box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);
    padding: 3rem;
    text-align: center;
    overflow: hidden;
    transition: all 0.5s cubic-bezier(0.4,0,0.2,1);
  }
  .alogo-face-card:hover {
    transform: scale(1.05);
    background: rgba(255,255,255,0.15);
    border-color: rgba(255,255,255,0.3);
  }

  @media (max-width: 768px) {
    .alogo-face-card { overflow: visible; }
  }

  .alogo-relative { position: relative; }

  .alogo-hover-glow {
    position: absolute; inset: 0; border-radius: 16px; pointer-events: none;
    background: linear-gradient(to right, rgba(96,165,250,0.2), rgba(192,132,252,0.2), rgba(244,114,182,0.2));
    opacity: 0;
    transition: opacity 0.5s;
    filter: blur(24px);
  }
  .alogo-face-card:hover .alogo-hover-glow { opacity: 0.2; }

  .alogo-inner { position: relative; z-index: 10; }

  /* Face container — inherits size from parent font-size (1em x 1em) */
  .alogo-face-container {
    position: relative;
    width: 1em; height: 1em;
    margin: 0 auto 1.5rem;
    border-radius: 9999px;
    background: linear-gradient(to right, rgba(96,165,250,0.2), rgba(192,132,252,0.2));
    display: flex; align-items: center; justify-content: center;
    border: 1px solid rgba(255,255,255,0.2);
    cursor: pointer;
  }

  .alogo-face-bg {
    position: absolute; inset: 1rem; border-radius: 9999px;
    background: white; pointer-events: none;
  }

  /* SVG */
  .alogo-svg {
    position: relative; z-index: 10;
    width: 100%; height: 100%;
    transform: none;
  }

  /* Eye / mouth transitions */
  #alogo-mouth { transition: opacity 0.5s ease-in-out; transform-box: fill-box; transform-origin: center; }
  #alogo-eye-left, #alogo-eye-right { transition: transform 0.1s linear; transform-box: fill-box; transform-origin: center; }

  /* Twinkle star */
  @keyframes alogo-twinkle {
    0%   { opacity: 0; transform: translate(-50%, -50%) scale(0) rotate(0deg); }
    15%  { opacity: 1; transform: translate(-50%, -50%) scale(1.1) rotate(15deg); }
    40%  { opacity: 1; transform: translate(-50%, -50%) scale(1) rotate(25deg); }
    70%  { opacity: 0.8; transform: translate(-50%, -50%) scale(0.9) rotate(35deg); }
    100% { opacity: 0; transform: translate(-50%, -50%) scale(0) rotate(50deg); }
  }
  .alogo-star {
    position: absolute;
    pointer-events: none;
    z-index: 60;
    width: 22px;
    height: 22px;
    background: #fbbf24;
    clip-path: polygon(50% 0%, 62% 38%, 100% 50%, 62% 62%, 50% 100%, 38% 62%, 0% 50%, 38% 38%);
    animation: alogo-twinkle 1s ease-in-out forwards;
    filter: drop-shadow(0 0 4px rgba(251,191,36,0.6));
  }

  /* ---- Speech bubble ---- */
  .alogo-speech-bubble {
    position: absolute;
    display: inline-block;
    background: rgba(255,255,255,0.98);
    color: #000;
    padding: 8px 16px;
    border-radius: 16px;
    border: 1px solid rgba(0,0,0,0.08);
    box-shadow: 0 10px 28px rgba(0,0,0,0.18);
    backdrop-filter: saturate(140%) blur(4px);
    font-size: 0.85rem; line-height: 1.25;
    white-space: normal; overflow-wrap: break-word; hyphens: auto;
    pointer-events: none;
    transition: opacity 0.35s ease, transform 0.2s ease;
    z-index: 50;

    /* Desktop: left of face */
    top: 50%;
    right: calc(100% + 12px);
    transform: translateY(-50%);
    max-width: 32rem; min-width: 120px;
  }

  /* Mobile: above face */
  @media (max-width: 768px) {
    .alogo-speech-bubble {
      top: auto;
      bottom: calc(100% + 12px);
      right: 50%; left: auto;
      transform: translateX(50%);
      max-width: 280px; min-width: 140px;
      text-align: center;
    }
  }

  /* Tail — desktop (points right toward face) */
  .alogo-speech-bubble::before,
  .alogo-speech-bubble::after {
    content: ""; position: absolute; width: 0; height: 0; border-style: solid;
  }
  .alogo-speech-bubble::before {
    top: 50%; left: 100%; transform: translateY(-50%);
    border-width: 12px;
    border-color: transparent transparent transparent rgba(0,0,0,0.08);
  }
  .alogo-speech-bubble::after {
    top: 50%; left: 100%; transform: translateY(-50%);
    border-width: 11px;
    border-color: transparent transparent transparent rgba(255,255,255,0.98);
    margin-left: -1px;
  }

  /* Tail — mobile (points down) */
  @media (max-width: 768px) {
    .alogo-speech-bubble::before {
      top: 100%; left: 50%; transform: translateX(-50%);
      border-width: 12px;
      border-color: rgba(0,0,0,0.08) transparent transparent transparent;
    }
    .alogo-speech-bubble::after {
      top: 100%; left: 50%; transform: translateX(-50%);
      border-width: 11px;
      border-color: rgba(255,255,255,0.98) transparent transparent transparent;
      margin-top: -1px; margin-left: 0;
    }
  }
`;
