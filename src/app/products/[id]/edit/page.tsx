"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ProductForm } from "@/components/ProductForm";
import { ErrorState, LoadingState } from "@/components/ui";
import { fetchProduct, updateProduct } from "@/lib/services/products";
import { getOverlayProduct, isDeletedProduct, upsertUpdatedProduct } from "@/lib/session";
import { Product, ProductDraft } from "@/types/product";

export default function EditProductPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = Number(params.id);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notFound, setNotFound] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    async function load() {
      if (!Number.isInteger(id) || id <= 0) { setNotFound(true); setLoading(false); return; }
      if (isDeletedProduct(id)) { setNotFound(true); setLoading(false); return; }
      const overlay = getOverlayProduct(id);
      if (overlay) { setProduct(overlay); setLoading(false); return; }
      try { setProduct(await fetchProduct(id)); } catch { setNotFound(true); } finally { setLoading(false); }
    }
    void load();
  }, [id]);

  async function submit(draft: ProductDraft) {
    if (!product || busy) return;
    setBusy(true); setError("");
    try { const updated = await updateProduct(product.id, draft); upsertUpdatedProduct(updated); router.push(`/products/${product.id}`); } catch { setError("The product could not be updated. Please try again."); setBusy(false); }
  }
  if (loading) return <LoadingState label="Loading product…" />;
  if (notFound || !product) return <ErrorState message="This product could not be found." onRetry={() => router.push("/products")} />;
  const initial: ProductDraft = { title: product.title, description: product.description || "", category: product.category, price: String(product.price), stock: String(product.stock), image: product.images?.[0] || product.thumbnail, brand: product.brand || "" };
  return <><div className="mb-7"><Link href={`/products/${product.id}`} className="text-sm font-bold text-slate-500 hover:text-ink">← Back to product</Link><p className="mt-7 text-sm font-bold uppercase tracking-[0.16em] text-coral">Catalog / Edit</p><h2 className="mt-2 text-3xl font-black tracking-tight text-ink sm:text-4xl">Edit product</h2><p className="mt-2 text-sm text-slate-500">Update the details for {product.title}.</p></div><ProductForm initialValues={initial} submitLabel="Save changes" busy={busy} error={error} onSubmit={submit} /></>;
}