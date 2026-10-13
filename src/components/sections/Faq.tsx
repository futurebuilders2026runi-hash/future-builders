"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CircuitFlow } from "../CircuitFlow";
import { Reveal } from "../Reveal";
import type { Dict } from "@/content";

export function Faq({ dict }: { dict: Dict }) {
  const { faq } = dict;
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="section relative overflow-hidden bg-cloud">
      <CircuitFlow variant={0} />
      <div className="shell relative grid gap-6 lg:grid-cols-[0.8fr_1.2fr] lg:gap-10">
        <Reveal>
          <p className="eyebrow">{faq.eyebrow}</p>
          <h2 className="h2 mt-3">{faq.title}</h2>
        </Reveal>

        <ul className="border-t border-line">
          {faq.items.map((item, i) => {
            const isOpen = open === i;
            return (
              <li key={item.q} className="border-b border-line">
                <h3>
                  <button
                    type="button"
                    onClick={() => setOpen(isOpen ? null : i)}
                    aria-expanded={isOpen}
                    aria-controls={`faq-panel-${i}`}
                    className="grid w-full grid-cols-[1.75rem_minmax(0,1fr)_1.75rem] items-center gap-2 py-4 text-center md:flex md:justify-between md:gap-4 md:text-start"
                  >
                    <span className="col-start-2 text-[1.0625rem] font-medium tracking-tight">
                      {item.q}
                    </span>
                    <span
                      aria-hidden
                      className={`relative col-start-3 grid h-7 w-7 shrink-0 place-items-center rounded-full border transition-colors duration-300 ${
                        isOpen ? "border-accent bg-accent/8" : "border-line"
                      }`}
                    >
                      <span className="absolute h-px w-3 bg-current" />
                      <span
                        className={`absolute h-3 w-px bg-current transition-transform duration-300 ${
                          isOpen ? "scale-y-0" : "scale-y-100"
                        }`}
                      />
                    </span>
                  </button>
                </h3>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      id={`faq-panel-${i}`}
                      key="panel"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden"
                    >
                      <p className="pb-4 text-[0.9375rem] leading-relaxed text-(--muted-fg) md:pe-10">
                        {item.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
