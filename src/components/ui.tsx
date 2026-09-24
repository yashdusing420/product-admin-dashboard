"use client";

import Link from "next/link";
import { ReactNode, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { clearAuth, getToken, getUserName } from "@/lib/session";

export function LoadingState({ label = "Loading products…" }: { label?: string }) {
  return (
    <div className="flex min-h-[280px] items-center justify-center rounded-3xl border border-line bg-white">
      <div className="flex items-center gap-3 text-sm font-medium text-slate-500">
        <span className="h-5 w-5 animate-spin rounded-full border-2 border-coral border-t-transparent" />
        {label}
      </div>
    </div>
  );
}

export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex min-h-[280px] flex-col items-center justify-center rounded-3xl border border-dashed border-line bg-white px-6 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-sand text-2xl">⌕</div>
      <h3 className="text-lg font-bold text-ink">{title}</h3>
      <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">{description}</p>
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex min-h-[280px] flex-col items-center justify-center rounded-3xl border border-red-100 bg-red-50 px-6 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">!</div>
      <h3 className="text-lg font-bold text-ink">Something went wrong</h3>
      <p className="mt-2 max-w-md text-sm text-slate-600">{message}</p>
      <button onClick={onRetry} className="mt-5 rounded-xl bg-ink px-4 py-2.5 text-sm font-bold text-white transition hover:bg-navy">Try again</button>
    </div>
  );
}

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (!getToken()) router.replace("/login");
    else setReady(true);
  }, [router]);
  if (!ready) return <div className="flex min-h-screen items-center justify-center bg-sand"><LoadingState label="Checking your session…" /></div>;
  return <>{children}</>;
}

export function DashboardShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [userName, setUserName] = useState("Admin");
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => setUserName(getUserName()), []);

  function logout() {
    clearAuth();
    router.replace("/login");
  }

  const initials = userName.slice(0, 2).toUpperCase();
  return (
    <div className="min-h-screen bg-sand text-ink">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col bg-navy px-5 py-6 text-white lg:flex">
        <Link href="/products" className="flex items-center gap-3 px-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-coral text-lg font-black">P</span>
          <span className="text-lg font-black tracking-tight">Pivotal<span className="text-coral">.</span></span>
        </Link>
        <div className="mt-14 px-3 text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">Workspace</div>
        <nav className="mt-3 space-y-1">
          <Link href="/products" className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition ${pathname === "/products" ? "bg-white/10 text-white" : "text-slate-400 hover:bg-white/5 hover:text-white"}`}>
            <span className="text-base">▦</span> Products
          </Link>
          <Link href="/products/add" className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition ${pathname === "/products/add" ? "bg-white/10 text-white" : "text-slate-400 hover:bg-white/5 hover:text-white"}`}>
            <span className="text-base">＋</span> Add product
          </Link>
        </nav>
        <div className="mt-auto rounded-2xl bg-white/5 p-4">
          <p className="text-xs font-semibold text-slate-400">Inventory overview</p>
          <p className="mt-2 text-2xl font-black">Live workspace</p>
          <p className="mt-1 text-xs leading-5 text-slate-400">Changes are kept for this browser session.</p>
        </div>
      </aside>
      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 border-b border-line/80 bg-sand/90 px-4 py-4 backdrop-blur-md sm:px-8">
          <div className="mx-auto flex max-w-[1440px] items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/products" className="flex items-center gap-2 lg:hidden">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-coral text-sm font-black text-white">P</span>
                <span className="font-black">Pivotal<span className="text-coral">.</span></span>
              </Link>
              <div className="hidden sm:block">
                <p className="text-sm font-semibold text-slate-500">Thursday, September 24, 2026</p>
                <h1 className="text-xl font-black tracking-tight">Product operations</h1>
              </div>
            </div>
            <div className="relative">
              <button onClick={() => setMenuOpen((open) => !open)} className="flex items-center gap-3 rounded-full border border-line bg-white py-1.5 pl-2 pr-3 shadow-sm">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-mint text-xs font-black text-navy">{initials}</span>
                <span className="hidden text-sm font-bold sm:block">{userName}</span>
                <span className="text-xs text-slate-400">⌄</span>
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-12 w-44 rounded-2xl border border-line bg-white p-1.5 shadow-soft">
                  <button onClick={logout} className="w-full rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-red-600 transition hover:bg-red-50">Sign out</button>
                </div>
              )}
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-[1440px] px-4 py-6 sm:px-8 sm:py-8">{children}</main>
      </div>
    </div>
  );
}

export function ButtonSpinner() {
  return <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />;
}