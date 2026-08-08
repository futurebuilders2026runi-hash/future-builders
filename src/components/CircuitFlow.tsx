"use client";

import { useRef } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";

type Node = { x: number; y: number; r?: number };

type Branch = {
  /** where the branch leaves the spine, as a fraction of the section height */
  at: number;
  /** drawing box in px — branches keep their real size so angles never distort */
  w: number;
  h: number;
  /** always starts at x=0 (on the spine) and runs outwards */
  d: string;
  nodes: Node[];
};

/**
 * Branch sets, roughly ordered by density. Later sections use the busier ones
 * so the network reads as one system that keeps growing down the page.
 */
const VARIANTS: Branch[][] = [
  // 0 — sparse
  [{ at: 0.58, w: 260, h: 70, d: "M0 14 H84 l26 26 H244", nodes: [{ x: 244, y: 40 }] }],

  // 1 — a first fork
  [
    {
      at: 0.24,
      w: 300, h: 90,
      d: "M0 22 H72 l24 24 H272",
      nodes: [{ x: 272, y: 46 }, { x: 96, y: 46, r: 2 }],
    },
    {
      at: 0.64,
      w: 240, h: 90,
      d: "M0 74 H58 l28 -28 H214",
      nodes: [{ x: 214, y: 46 }],
    },
  ],

  // 2 — two runs, one doubling back
  [
    { at: 0.26, w: 260, h: 80, d: "M0 26 H96 l22 22 H236", nodes: [{ x: 236, y: 48 }] },
    {
      at: 0.68,
      w: 330, h: 100,
      d: "M0 62 H54 l26 26 H172 l24 -24 H306",
      nodes: [{ x: 306, y: 64 }, { x: 172, y: 88, r: 2 }],
    },
  ],

  // 3 — three runs
  [
    { at: 0.16, w: 300, h: 80, d: "M0 18 H78 l24 24 H272", nodes: [{ x: 272, y: 42 }] },
    {
      at: 0.48,
      w: 360, h: 110,
      d: "M0 44 H48 l30 -30 H188 l26 26 H338",
      nodes: [{ x: 338, y: 40 }, { x: 78, y: 14, r: 2 }],
    },
    { at: 0.82, w: 250, h: 100, d: "M0 66 H104 l24 24 H226", nodes: [{ x: 226, y: 90 }] },
  ],

  // 4 — long runs that read as a bus
  [
    {
      at: 0.14,
      w: 420, h: 100,
      d: "M0 20 H92 l26 26 H262 l24 -24 H398",
      nodes: [{ x: 398, y: 22 }, { x: 262, y: 46, r: 2 }],
    },
    { at: 0.46, w: 300, h: 80, d: "M0 60 H132 l26 -26 H278", nodes: [{ x: 278, y: 34 }] },
    {
      at: 0.76,
      w: 380, h: 120,
      d: "M0 34 H66 l28 28 H208 l26 26 H356",
      nodes: [{ x: 356, y: 88 }, { x: 94, y: 62, r: 2 }],
    },
  ],

  // 5 — densest
  [
    { at: 0.1, w: 280, h: 70, d: "M0 16 H86 l24 24 H256", nodes: [{ x: 256, y: 40 }] },
    {
      at: 0.36,
      w: 400, h: 110,
      d: "M0 52 H60 l28 -28 H214 l24 24 H376",
      nodes: [{ x: 376, y: 48 }, { x: 88, y: 24, r: 2 }],
    },
    { at: 0.62, w: 300, h: 90, d: "M0 24 H118 l26 26 H276", nodes: [{ x: 276, y: 50 }] },
    {
      at: 0.86,
      w: 340, h: 110,
      d: "M0 70 H72 l26 -26 H196 l24 24 H316",
      nodes: [{ x: 316, y: 68 }, { x: 196, y: 44, r: 2 }],
    },
  ],
];

const TONES = {
  light: { stroke: "#1E6BE8", line: 0.22, node: 0.38 },
  dark: { stroke: "#4AB8FF", line: 0.3, node: 0.5 },
} as const;

function BranchGroup({
  branch,
  progress,
  tone,
  spineX,
}: {
  branch: Branch;
  progress: MotionValue<number>;
  tone: keyof typeof TONES;
  spineX: string;
}) {
  const t = TONES[tone];
  // the branch draws over the first two-thirds, its nodes pop as it lands
  const draw = useTransform(progress, [0, 0.7], [0, 1]);
  const nodeIn = useTransform(progress, [0.62, 0.92], [0, 1]);

  return (
    <svg
      aria-hidden
      width={branch.w}
      height={branch.h}
      viewBox={`0 0 ${branch.w} ${branch.h}`}
      fill="none"
      className="absolute"
      style={{ top: `${branch.at * 100}%`, left: spineX }}
    >
      <motion.path
        d={branch.d}
        stroke={t.stroke}
        strokeWidth={1}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={t.line}
        style={{ pathLength: draw }}
      />
      {branch.nodes.map((n, i) => (
        <motion.circle
          key={i}
          cx={n.x}
          cy={n.y}
          r={n.r ?? 3}
          fill={t.stroke}
          style={{
            opacity: nodeIn,
            scale: nodeIn,
            transformOrigin: `${n.x}px ${n.y}px`,
          }}
        />
      ))}
    </svg>
  );
}

/**
 * A slice of the site-wide circuit network. Every section renders one; the
 * spine sits at the same horizontal position everywhere, so the runs read as a
 * single trace that keeps being drawn as you scroll. Purely decorative.
 */
export function CircuitFlow({
  variant = 0,
  tone = "light",
  spineX = "7%",
  className = "",
}: {
  variant?: number;
  tone?: "light" | "dark";
  spineX?: string;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const t = TONES[tone];
  const branches = VARIANTS[variant % VARIANTS.length];

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const eased = useSpring(scrollYProgress, {
    stiffness: 70,
    damping: 26,
    restDelta: 0.001,
  });

  // spine draws across the middle of the section's travel through the viewport
  const spineDraw = useTransform(eased, [0.04, 0.62], [0, 1]);

  return (
    <div
      ref={ref}
      aria-hidden
      // mirrored in RTL so the trace always runs from the reading edge inwards
      className={`pointer-events-none absolute inset-0 select-none overflow-hidden rtl:-scale-x-100 ${className}`}
    >
      {/* spine */}
      <motion.span
        className="absolute inset-y-0 w-px"
        style={{
          left: spineX,
          backgroundColor: t.stroke,
          opacity: t.line,
          scaleY: reduce ? 1 : spineDraw,
          transformOrigin: "top",
          maskImage:
            "linear-gradient(to bottom, transparent, #000 8%, #000 92%, transparent)",
        }}
      />

      {branches.map((branch, i) => {
        const start = 0.06 + branch.at * 0.42;
        return (
          <BranchScope
            key={i}
            branch={branch}
            eased={eased}
            start={start}
            reduce={!!reduce}
            tone={tone}
            spineX={spineX}
          />
        );
      })}
    </div>
  );
}

/** Thin wrapper so each branch can own its slice of the scroll range. */
function BranchScope({
  branch,
  eased,
  start,
  reduce,
  tone,
  spineX,
}: {
  branch: Branch;
  eased: MotionValue<number>;
  start: number;
  reduce: boolean;
  tone: "light" | "dark";
  spineX: string;
}) {
  const local = useTransform(eased, [start, start + 0.3], [0, 1]);
  const constant = useTransform(eased, () => 1);
  return (
    <BranchGroup
      branch={branch}
      progress={reduce ? constant : local}
      tone={tone}
      spineX={spineX}
    />
  );
}
