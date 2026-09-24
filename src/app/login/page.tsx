"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/lib/services/auth";
import { saveAuth } from "@/lib/session";
import { ButtonSpinner } from "@/components/ui";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("emilys");
  const [password, setPassword] = useState("emilyspass");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("expired")) setError("Your session expired. Sign in again to continue.");
  }, []);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (busy) return;
    if (!username.trim() || !password) return setError("Enter both your username and password.");
    setBusy(true);
    setError("");
    try {
      const user = await login(username.trim(), password);
      saveAuth(user.accessToken || user.token || "", user.username || username.trim());
      router.replace("/products");
    } catch (caught: unknown) {
      const status = (caught as { response?: { status?: number } })?.response?.status;
      setError(status === 400 || status === 401 ? "Those credentials didn’t work. Check your username and password." : "We couldn’t reach DummyJSON. Please try again.");
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen bg-navy">
      <div className="mx-auto grid min-h-screen max-w-7xl lg:grid-cols-[1.05fr_0.95fr]">
        <section className="hidden flex-col justify-between p-12 text-white lg:flex xl:p-20">
          <div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-coral text-lg font-black">P</span><span className="text-lg font-black">Pivotal<span className="text-coral">.</span></span></div>
          <div><p className="max-w-lg text-6xl font-black leading-[1.02] tracking-[-0.05em]">Make every product decision count.</p><p className="mt-6 max-w-md text-base leading-7 text-slate-300">A calm, focused workspace for keeping your catalog accurate and your team moving.</p></div>
          <p className="text-xs font-semibold text-slate-500">PRODUCT OPERATIONS / 2026</p>
        </section>
        <section className="flex items-center justify-center bg-sand px-5 py-12 sm:px-10">
          <div className="w-full max-w-md">
            <div className="mb-10 lg:hidden"><div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-coral text-lg font-black text-white">P</span><span className="text-lg font-black text-ink">Pivotal<span className="text-coral">.</span></span></div></div>
            <div className="mb-8"><p className="text-sm font-bold uppercase tracking-[0.18em] text-coral">Welcome back</p><h1 className="mt-3 text-4xl font-black tracking-tight text-ink">Sign in to your workspace</h1><p className="mt-3 text-sm leading-6 text-slate-500">Use your DummyJSON admin credentials to continue.</p></div>
            <form onSubmit={submit} className="rounded-3xl border border-line bg-white p-6 shadow-soft sm:p-8">
              {error && <div className="mb-5 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold leading-5 text-red-700">{error}</div>}
              <label className="block text-sm font-bold text-ink">Username<input value={username} onChange={(event) => setUsername(event.target.value)} autoComplete="username" className="mt-2 w-full rounded-xl border border-line bg-[#FCFDFC] px-4 py-3 text-sm outline-none focus:border-coral focus:ring-4 focus:ring-coral/10" /></label>
              <label className="mt-5 block text-sm font-bold text-ink">Password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" className="mt-2 w-full rounded-xl border border-line bg-[#FCFDFC] px-4 py-3 text-sm outline-none focus:border-coral focus:ring-4 focus:ring-coral/10" /></label>
              <button disabled={busy} className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-coral px-5 py-3.5 text-sm font-black text-white shadow-lg shadow-coral/20 transition hover:bg-[#df5b41] disabled:opacity-60">{busy && <ButtonSpinner />} {busy ? "Signing in…" : "Continue to dashboard"}</button>
              <p className="mt-5 text-center text-xs text-slate-400">Demo login: <span className="font-bold text-slate-600">emilys</span> / <span className="font-bold text-slate-600">emilyspass</span></p>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}