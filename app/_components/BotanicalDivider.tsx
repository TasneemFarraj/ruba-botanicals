"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/* Leaf shape — watercolor style like the reference */
function Leaf({ x, y, w, h, rotate, o = 0.22 }: {
  x: number; y: number; w: number; h: number; rotate: number; o?: number;
}) {
  const d = `M 0,0
    C ${w * 0.3},${-h * 0.25} ${w * 0.7},${-h * 0.4} ${w},${-h * 0.15}
    C ${w * 0.85},${h * 0.1} ${w * 0.5},${h * 0.2} 0,0 Z`;
  return (
    <g transform={`translate(${x},${y}) rotate(${rotate})`}>
      <path d={d} fill="#7aaa80" opacity={o} />
      <path d={d} fill="none" stroke="#4a7a52" strokeWidth="0.55" opacity={o + 0.12} />
      <path d={`M 0,0 Q ${w * 0.5},${-h * 0.1} ${w},${-h * 0.15}`}
        stroke="#4a7a52" strokeWidth="0.4" fill="none" opacity={o * 0.5} />
    </g>
  );
}

/* One complete olive-style branch SVG */
function BranchSVG({ flip }: { flip?: boolean }) {
  return (
    <svg
      viewBox="0 0 180 110"
      fill="none"
      style={{
        width: 180,
        height: 110,
        display: "block",
        transform: flip ? "scaleX(-1)" : "none",
        overflow: "visible",
      }}
    >
      {/* Main diagonal stem */}
      <path
        d="M 10 95 C 40 75 75 55 110 35 C 135 22 158 14 175 10"
        stroke="#4a7a52" strokeWidth="1" strokeLinecap="round" opacity="0.45"
      />
      {/* Sub-branch 1 */}
      <path d="M 45 75 C 38 62 28 52 18 45" stroke="#4a7a52" strokeWidth="0.7" strokeLinecap="round" opacity="0.35" />
      <Leaf x={18} y={45} w={28} h={10} rotate={-30} o={0.22} />
      <Leaf x={26} y={58} w={24} h={9}  rotate={-20} o={0.2}  />

      {/* Sub-branch 2 */}
      <path d="M 75 57 C 65 44 55 35 44 28" stroke="#4a7a52" strokeWidth="0.7" strokeLinecap="round" opacity="0.35" />
      <Leaf x={44} y={28} w={30} h={10} rotate={-35} o={0.22} />
      <Leaf x={58} y={40} w={26} h={9}  rotate={-25} o={0.2}  />

      {/* Sub-branch 3 */}
      <path d="M 108 37 C 98 24 88 16 76 10" stroke="#4a7a52" strokeWidth="0.7" strokeLinecap="round" opacity="0.35" />
      <Leaf x={76} y={10} w={30} h={10} rotate={-38} o={0.21} />
      <Leaf x={90} y={22} w={25} h={9}  rotate={-28} o={0.19} />

      {/* Sub-branch 4 — tip */}
      <path d="M 138 23 C 130 14 122 8 112 4" stroke="#4a7a52" strokeWidth="0.6" strokeLinecap="round" opacity="0.3} " />
      <Leaf x={112} y={4}  w={26} h={9}  rotate={-40} o={0.18} />
      <Leaf x={124} y={14} w={22} h={8}  rotate={-30} o={0.16} />
    </svg>
  );
}

function BranchElement({ side, containerRef }: {
  side: "left" | "right";
  containerRef: React.RefObject<HTMLDivElement | null>;
}) {
  const elRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = elRef.current;
    const container = containerRef.current;
    if (!el || !container) return;

    // Step 1 — zoom in on enter
    gsap.fromTo(el,
      { scale: 0.35, opacity: 0 },
      {
        scale: 1, opacity: 1,
        duration: 1.1, ease: "power2.out",
        scrollTrigger: { trigger: container, start: "top 80%", toggleActions: "play none none reverse" },
      }
    );

    // Step 2 — slide down with scroll (like unfolding downward)
    gsap.to(el, {
      y: 380,
      ease: "none",
      scrollTrigger: {
        trigger: container,
        start: "top 60%",
        end: "bottom 20%",
        scrub: 1.8,
      },
    });
  }, [containerRef]);

  const isLeft = side === "left";

  return (
    <div
      ref={elRef}
      aria-hidden="true"
      style={{
        position: "absolute",
        top: 40,
        [isLeft ? "left" : "right"]: -20,
        pointerEvents: "none",
        zIndex: 0,
        opacity: 0,
        transform: "scale(0.35)",
      }}
    >
      <BranchSVG flip={isLeft} />
    </div>
  );
}

export default function BotanicalDivider({ containerRef }: {
  containerRef: React.RefObject<HTMLDivElement | null>;
}) {
  return (
    <>
      <BranchElement side="left"  containerRef={containerRef} />
      <BranchElement side="right" containerRef={containerRef} />
    </>
  );
}
