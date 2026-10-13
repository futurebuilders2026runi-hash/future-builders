"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Dict } from "@/content";

export function AdminControls({ dict }: { dict: Dict }) {
  const router = useRouter();
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  async function logout() {
    setSending(true);
    setError("");
    try {
      const response = await fetch("/api/admin/logout", { method: "POST" });
      if (!response.ok) throw new Error("logout_failed");
      // Reload discards sensitive client-side route state after signing out.
      window.location.reload();
    } catch {
      setError(dict.admin.networkError);
      setSending(false);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap gap-3">
        <button type="button" onClick={() => router.refresh()} className="btn btn-ghost" disabled={sending}>{dict.admin.refresh}</button>
        <button type="button" onClick={logout} className="btn btn-primary" disabled={sending}>{dict.admin.logout}</button>
      </div>
      {error && <p role="alert" className="mt-3 text-sm text-red-700">{error}</p>}
    </div>
  );
}
