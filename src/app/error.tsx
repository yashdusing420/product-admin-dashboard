"use client";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <main className="flex min-h-screen items-center justify-center bg-sand p-6"><div className="max-w-md text-center"><p className="text-sm font-black uppercase tracking-[0.2em] text-coral">Unexpected error</p><h1 className="mt-3 text-3xl font-black text-ink">This page needs a refresh</h1><button onClick={reset} className="mt-7 rounded-xl bg-ink px-5 py-3 text-sm font-bold text-white">Try again</button></div></main>;
}