"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ProductForm, emptyDraft } from "@/components/ProductForm";
import { createProduct } from "@/lib/services/products";
import { upsertCreatedProduct } from "@/lib/session";

export default function AddProductPage() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function submit(draft: typeof emptyDraft) {
    if (busy) return;
    setBusy(true); setError("");
    try {
      const product = await createProduct(draft);
      upsertCreatedProduct(product);
      router.push(`/products/${product.id}`);
    } catch {
      setError("The product could not be created. Please check the details and try again.");
      setBusy(false);
    }
  }
  return <><div className="mb-7"><Link href="/products" className="text-sm font-bold text-slate-500 hover:text-ink">← Back to products</Link><p className="mt-7 text-sm font-bold uppercase tracking-[0.16em] text-coral">Catalog / New</p><h2 className="mt-2 text-3xl font-black tracking-tight text-ink sm:text-4xl">Add product</h2><p className="mt-2 text-sm text-slate-500">Create a new item and make it available in this workspace.</p></div><ProductForm submitLabel="Create product" busy={busy} error={error} onSubmit={submit} /></>;
}