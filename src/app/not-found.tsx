import Link from "next/link";

export default function NotFound() {
  return <main className="flex min-h-screen items-center justify-center bg-sand p-6"><div className="max-w-md text-center"><p className="text-sm font-black uppercase tracking-[0.2em] text-coral">404</p><h1 className="mt-3 text-4xl font-black text-ink">Page not found</h1><p className="mt-3 text-slate-500">The page you’re looking for doesn’t exist.</p><Link href="/products" className="mt-7 inline-flex rounded-xl bg-ink px-5 py-3 text-sm font-bold text-white">Back to products</Link></div></main>;
}