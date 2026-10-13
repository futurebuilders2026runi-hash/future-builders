"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";

type Step = { key: string; label: string; note: string };

/**
 * The build path panel. Its content stays in English in both locales, so the
 * panel is always laid out left-to-right regardless of page direction.
 */
export function HeroPipeline({
  steps,
  label,
}: {
  steps: Step[];
  label: string;
}) {
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (reduce) {
      setActive(steps.length - 1);
      return;
    }
    const id = setInterval(() => setActive((i) => (i + 1) % steps.length), 1700);
    return () => clearInterval(id);
  }, [reduce, steps.length]);

  const progress = ((active + 0.5) / steps.length) * 100;

  return (
    <div className="relative" dir="ltr">
      <div className="glow -inset-6 bg-accent/20" aria-hidden />

      <div className="relative overflow-hidden rounded-2xl border border-line bg-white/80 p-4 shadow-[0_36px_70px_-46px_rgba(11,42,107,0.55)] backdrop-blur-xl sm:p-4">
        <div className="flex items-center justify-center gap-3 border-b border-line pb-4 md:justify-between">
          <div className="flex items-center gap-1.5" aria-hidden>
            <span className="h-2 w-2 rounded-full bg-mist" />
            <span className="h-2 w-2 rounded-full bg-mist" />
            <span className="h-2 w-2 rounded-full bg-accent-bright" />
          </div>
          <span className="text-[0.68rem] font-medium uppercase tracking-[0.18em] text-(--muted-fg)">
            {label}
          </span>
        </div>

        <ol className="relative mt-3 space-y-1">
          <span
            aria-hidden
            className="absolute inset-y-3 left-4.25 w-px bg-line"
          />
          <motion.span
            aria-hidden
            className="absolute left-4.25 top-3 w-px bg-linear-to-b from-accent-bright via-accent to-brand"
            animate={{ height: `${progress}%` }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          />

          {steps.map((step, i) => {
            const isActive = i === active;
            const isPast = i < active;
            return (
              <li key={step.key} className="relative grid grid-cols-[2.125rem_minmax(0,1fr)_2.125rem] items-start gap-2 py-2 md:flex md:gap-3">
                <span className="relative z-10 mt-0.5 grid h-8.5 w-8.5 shrink-0 place-items-center">
                  <motion.span
                    className="absolute inset-0 rounded-full border"
                    animate={{
                      borderColor: isActive
                        ? "rgba(30,107,232,0.85)"
                        : isPast
                          ? "rgba(30,107,232,0.35)"
                          : "rgba(219,230,246,1)",
                      backgroundColor: isActive
                        ? "rgba(30,107,232,0.1)"
                        : "rgba(255,255,255,1)",
                      scale: isActive ? 1 : 0.92,
                    }}
                    transition={{ duration: 0.45 }}
                  />
                  <span
                    className={`relative text-[0.7rem] font-semibold tabular-nums transition-colors duration-300 ${
                      isActive
                        ? "text-accent"
                        : isPast
                          ? "text-brand/70"
                          : "text-(--muted-fg)"
                    }`}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </span>

                <span className="min-w-0 flex-1 pt-1">
                  <span
                    className={`block text-sm font-semibold uppercase tracking-[0.14em] transition-colors duration-300 ${
                      isActive ? "text-brand" : "text-brand/55"
                    }`}
                  >
                    {step.label}
                  </span>
                  <motion.span
                    className="block text-[0.8125rem] leading-snug text-(--muted-fg)"
                    animate={{ opacity: isActive ? 1 : 0.55 }}
                    transition={{ duration: 0.4 }}
                  >
                    {step.note}
                  </motion.span>
                </span>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
