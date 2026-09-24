"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { fetchProduct } from "@/lib/services/products";
import { getOverlayProduct, isDeletedProduct } from "@/lib/session";
import { Product } from "@/types/product";
import { ErrorState, LoadingState } from "@/components/ui";
import { ProductImage } from "@/components/ProductCard";

export default function ProductDetailsPage() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState("");
  const [image, setImage] = useState("");

  async function load() {
    setLoading(true); setError(""); setNotFound(false);
    if (!Number.isInteger(id) || id <= 0) { setNotFound(true); setLoading(false); return; }
    if (isDeletedProduct(id)) { setNotFound(true); setLoading(false); return; }
    const overlay = getOverlayProduct(id);
    if (overlay) { setProduct(overlay); setImage(overlay.images?.[0] || overlay.thumbnail); setLoading(false); return; }
    try {
      const result = await fetchProduct(id);
      setProduct(result); setImage(result.images?.[0] || result.thumbnail);
    } catch (caught: unknown) {
      if ((caught as { response?: { status?: number } })?.response?.status === 404) setNotFound(true);
      else setError("We couldn’t load this product right now.");
    } finally { setLoading(false); }
  }
  useEffect(() => { void load(); }, [id]);

  if (loading) return <LoadingState label="Loading product…" />;
  if (notFound) return <div className="rounded-3xl border border-dashed border-line bg-white py-20 text-center"><p className="text-sm font-bold uppercase tracking-[0.16em] text-coral">404</p><h2 className="mt-3 text-3xl font-black text-ink">Product not found</h2><p className="mx-auto mt-2 max-w-md text-sm text-slate-500">This product may have been deleted or the ID is invalid.</p><Link href="/products" className="mt-7 inline-flex rounded-xl bg-ink px-5 py-3 text-sm font-bold text-white">Back to products</Link></div>;
  if (error || !product) return <ErrorState message={error || "Product unavailable."} onRetry={() => void load()} />;

  const gallery = product.images?.length ? product.images : [product.thumbnail];
  return <><div className="mb-7 flex flex-wrap items-center justify-between gap-4"><div><Link href="/products" className="text-sm font-bold text-slate-500 hover:text-ink">← Back to products</Link><p className="mt-7 text-sm font-bold uppercase tracking-[0.16em] text-coral">Product details</p></div><div className="flex gap-2"><Link href={`/products/${product.id}/edit`} className="rounded-xl border border-line bg-white px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-sand">Edit product</Link></div></div><div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]"><section className="rounded-3xl border border-line bg-white p-5 shadow-card sm:p-7"><div className="flex aspect-square items-center justify-center overflow-hidden rounded-3xl bg-sand"><img src={image || product.thumbnail} alt={product.title} className="h-full w-full object-contain mix-blend-multiply" /></div><div className="mt-4 grid grid-cols-4 gap-3">{gallery.slice(0, 4).map((source, index) => <button key={`${source}-${index}`} onClick={() => setImage(source)} className={`aspect-square overflow-hidden rounded-xl bg-sand ${image === source ? "ring-2 ring-coral ring-offset-2" : ""}`}><img src={source} alt="" className="h-full w-full object-cover mix-blend-multiply" /></button>)}</div></section><section className="rounded-3xl border border-line bg-white p-5 shadow-card sm:p-8"><div className="flex flex-wrap items-center gap-2"><span className="rounded-full bg-sky px-3 py-1 text-xs font-bold capitalize text-navy">{product.category.replaceAll("-", " ")}</span>{product.brand && <span className="rounded-full bg-mint px-3 py-1 text-xs font-bold text-emerald-800">{product.brand}</span>}</div><h1 className="mt-5 text-4xl font-black tracking-tight text-ink">{product.title}</h1><p className="mt-4 text-sm leading-7 text-slate-500">{product.description || "No description provided."}</p><div className="mt-8 grid grid-cols-3 gap-3"><Stat label="Price" value={`$${product.price.toFixed(2)}`} /><Stat label="Rating" value={`★ ${product.rating.toFixed(1)}`} /><Stat label="Stock" value={String(product.stock)} /></div><div className="mt-8 border-t border-line pt-6"><h2 className="text-sm font-black uppercase tracking-[0.14em] text-slate-400">Customer reviews</h2>{product.reviews?.length ? <div className="mt-4 space-y-4">{product.reviews.map((review, index) => <div key={`${review.reviewerEmail}-${index}`} className="rounded-2xl bg-sand p-4"><div className="flex justify-between gap-3"><p className="text-sm font-bold">{review.reviewerName}</p><span className="text-sm font-bold text-amber-500">★ {review.rating}</span></div><p className="mt-2 text-sm leading-6 text-slate-600">{review.comment}</p></div>)}</div> : <p className="mt-4 text-sm text-slate-500">No reviews yet.</p>}</div></section></div></>;
}

function Stat({ label, value }: { label: string; value: string }) { return <div className="rounded-2xl bg-sand p-4"><p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">{label}</p><p className="mt-2 text-lg font-black text-ink">{value}</p></div>; }