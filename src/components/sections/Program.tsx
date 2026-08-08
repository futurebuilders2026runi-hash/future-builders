"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useSpring } from "framer-motion";
import { Molecules } from "../BrandDecor";
import { CircuitFlow } from "../CircuitFlow";
import { Reveal } from "../Reveal";
import type { Dict } from "@/content";

export function Program({ dict }: { dict: Dict }) {
  const { program } = dict;
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 78%", "end 65%"],
  });
  const fill = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 24,
    restDelta: 0.001,
  });
  const scale = reduce ? 1 : fill;

  return (
    <section id="program" className="on-dark section relative overflow-hidden bg-navy">
      <div className="grid-veil" aria-hidden />
      <CircuitFlow variant={4} tone="dark" />
      <Molecules tone="dark" className="end-4 top-16 opacity-40" />
      <div
        className="glow top-1/4 start-1/2 h-96 w-96 -translate-x-1/2 bg-accent/20"
        aria-hidden
      />

      <div className="shell relative">
        <div className="max-w-2xl">
          <Reveal>
            <p className="eyebrow">{program.eyebrow}</p>
            <h2 className="h2 mt-5 text-white">{program.title}</h2>
            <p className="lede mt-5 text-white/55">{program.body}</p>
          </Reveal>
        </div>

        <div ref={ref} className="mt-16 lg:mt-24">
          {/* Desktop: horizontal rail */}
          <div className="relative hidden lg:block">
            <div
              aria-hidden
              className="absolute inset-x-0 top-[0.5625rem] h-px bg-white/12"
            />
            <motion.div
              aria-hidden
              className="absolute inset-x-0 top-[0.5625rem] h-px origin-[left_center] bg-linear-to-r from-accent-bright via-accent-sky to-accent rtl:origin-[right_center]"
              style={{ scaleX: scale }}
            />

            <ol className="relative grid grid-cols-7 gap-4">
              {program.steps.map((step, i) => (
                <li key={step.title}>
                  <span className="relative z-10 block h-4.5 w-4.5">
                    <span className="absolute inset-0 rounded-full border border-white/20 bg-navy" />
                    <span className="absolute inset-[3px] rounded-full bg-linear-to-br from-accent-bright to-accent" />
                  </span>

                  <Reveal delay={0.12 + i * 0.07}>
                    <h3 className="mt-6 text-base font-semibold tracking-tight text-white">
                      {step.title}
                    </h3>
                    <ul className="mt-3 space-y-1.5">
                      {step.items.map((item) => (
                        <li
                          key={item}
                          className="text-[0.8125rem] leading-snug text-white/45"
                        >
                          {item}
                        </li>
                      ))}
                    </ul>
                  </Reveal>
                </li>
              ))}
            </ol>
          </div>

          {/* Mobile / tablet: vertical rail */}
          <ol className="relative lg:hidden">
            <span
              aria-hidden
              className="absolute inset-y-2 inset-s-[0.5rem] w-px bg-white/12"
            />
            <motion.span
              aria-hidden
              className="absolute top-2 inset-s-[0.5rem] h-full w-px origin-top bg-linear-to-b from-accent-bright via-accent-sky to-accent"
              style={{ scaleY: scale }}
            />

            {program.steps.map((step, i) => (
              <li key={step.title} className="relative flex gap-6 pb-10 last:pb-0">
                <span className="relative z-10 mt-1.5 h-4.5 w-4.5 shrink-0">
                  <span className="absolute inset-0 rounded-full border border-white/20 bg-navy" />
                  <span className="absolute inset-[3px] rounded-full bg-linear-to-br from-accent-bright to-accent" />
                </span>

                <Reveal delay={i * 0.03} className="flex-1">
                  <h3 className="text-lg font-semibold tracking-tight text-white">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/45">
                    {step.items.join(" · ")}
                  </p>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
