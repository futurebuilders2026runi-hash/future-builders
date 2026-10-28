"use client";

import { useState } from "react";

/** Coupon code with a one-tap copy button. */
export function CouponCode({ code, label, copied }: { code: string; label: string; copied: string }) {
  const [done, setDone] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setDone(true);
      setTimeout(() => setDone(false), 2000);
    } catch {
      // Clipboard can be blocked; the code stays visible and selectable.
    }
  }

  return (
    <button type="button" onClick={copy} className="partner-resource-code" aria-label={`${label}: ${code}`}>
      <code dir="ltr">{code}</code>
      <span aria-live="polite">{done ? copied : label}</span>
    </button>
  );
}
