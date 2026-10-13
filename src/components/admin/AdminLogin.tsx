"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import type { Dict } from "@/content";

export function AdminLogin({ dict, configured }: { dict: Dict; configured: boolean }) {
  const t = dict.admin;
  const router = useRouter();
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const password = new FormData(form).get("password");
    setSending(true);
    setError("");
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!response.ok) {
        setError(response.status === 429 ? t.loginRateLimit : response.status === 503 ? t.loginUnavailable : response.status === 401 ? t.loginError : t.networkError);
        return;
      }
      form.reset();
      router.refresh();
    } catch {
      setError(t.networkError);
    } finally {
      setSending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-md rounded-2xl border border-line bg-white p-4 sm:p-6" aria-busy={sending}>
      <h2 className="h3">{t.loginTitle}</h2>
      <p className="mt-3 text-sm leading-relaxed text-(--muted-fg)">{t.loginBody}</p>
      {configured ? (
        <>
          <label htmlFor="admin-password" className="field-label mt-4">{t.password}</label>
          <input id="admin-password" name="password" type="password" autoComplete="current-password" required maxLength={256} disabled={sending} className="field" dir="ltr" />
          {error && <p role="alert" className="mt-3 text-sm text-red-700">{error}</p>}
          <button type="submit" disabled={sending} className="btn btn-primary mt-4 w-full disabled:opacity-60">{sending ? t.loggingIn : t.login}</button>
        </>
      ) : (
        <p role="status" className="mt-4 rounded-xl bg-cloud p-4 text-sm">{t.loginUnavailable}</p>
      )}
    </form>
  );
}
