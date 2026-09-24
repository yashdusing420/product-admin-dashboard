"use client";

import { FormEvent, useState } from "react";
import { ButtonSpinner } from "@/components/ui";
import { ProductDraft } from "@/types/product";

export const emptyDraft: ProductDraft = { title: "", description: "", category: "", price: "", stock: "", image: "", brand: "" };

export function ProductForm({ initialValues = emptyDraft, submitLabel, busy, error, onSubmit }: { initialValues?: ProductDraft; submitLabel: string; busy: boolean; error: string; onSubmit: (draft: ProductDraft) => void }) {
  const [draft, setDraft] = useState<ProductDraft>(initialValues);
  const [validation, setValidation] = useState("");

  function update(field: keyof ProductDraft, value: string) {
    setDraft((current) => ({ ...current, [field]: value }));
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!draft.title.trim()) return setValidation("Add a product title to continue.");
    if (!draft.category.trim()) return setValidation("Choose or enter a category.");
    if (!draft.price || Number(draft.price) < 0) return setValidation("Enter a valid price.");
    if (!draft.stock || Number(draft.stock) < 0) return setValidation("Enter a valid stock count.");
    if (!draft.image.trim()) return setValidation("An image URL is required.");
    try {
      new URL(draft.image.trim());
    } catch {
      return setValidation("Use a complete image URL, including https://.");
    }
    setValidation("");
    onSubmit(draft);
  }

  return (
    <form onSubmit={submit} className="rounded-3xl border border-line bg-white p-5 shadow-card sm:p-8">
      {(validation || error) && <div className="mb-6 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{validation || error}</div>}
      <div className="grid gap-6 md:grid-cols-2">
        <Field label="Product title" required><input value={draft.title} onChange={(event) => update("title", event.target.value)} placeholder="e.g. Wireless headphones" /></Field>
        <Field label="Brand"><input value={draft.brand} onChange={(event) => update("brand", event.target.value)} placeholder="e.g. Soundcore" /></Field>
        <Field label="Category" required><input value={draft.category} onChange={(event) => update("category", event.target.value)} placeholder="e.g. smartphones" /></Field>
        <Field label="Image URL" required hint="A publicly accessible image URL"><input type="url" value={draft.image} onChange={(event) => update("image", event.target.value)} placeholder="https://images.example.com/product.jpg" /></Field>
        <Field label="Price (USD)" required><input type="number" min="0" step="0.01" value={draft.price} onChange={(event) => update("price", event.target.value)} placeholder="0.00" /></Field>
        <Field label="Stock units" required><input type="number" min="0" step="1" value={draft.stock} onChange={(event) => update("stock", event.target.value)} placeholder="0" /></Field>
        <div className="md:col-span-2"><Field label="Description"><textarea rows={5} value={draft.description} onChange={(event) => update("description", event.target.value)} placeholder="Describe the product for your customers…" /></Field></div>
      </div>
      <div className="mt-8 flex flex-col-reverse gap-3 border-t border-line pt-6 sm:flex-row sm:justify-end">
        <button type="button" onClick={() => history.back()} className="rounded-xl border border-line px-5 py-3 text-sm font-bold text-slate-600 hover:bg-sand">Cancel</button>
        <button disabled={busy} className="flex items-center justify-center gap-2 rounded-xl bg-coral px-5 py-3 text-sm font-bold text-white shadow-lg shadow-coral/20 transition hover:bg-[#df5b41] disabled:cursor-not-allowed disabled:opacity-60">{busy && <ButtonSpinner />}{submitLabel}</button>
      </div>
    </form>
  );
}

function Field({ label, required, hint, children }: { label: string; required?: boolean; hint?: string; children: React.ReactNode }) {
  return <label className="block text-sm font-bold text-ink"><span>{label}{required && <span className="ml-1 text-coral">*</span>}</span>{hint && <span className="ml-2 text-xs font-medium text-slate-400">{hint}</span>}<div className="mt-2 [&_input]:w-full [&_input]:rounded-xl [&_input]:border [&_input]:border-line [&_input]:bg-[#FCFDFC] [&_input]:px-4 [&_input]:py-3 [&_input]:text-sm [&_input]:font-medium [&_input]:outline-none [&_input]:transition [&_input]:placeholder:text-slate-400 [&_input]:focus:border-coral [&_input]:focus:ring-4 [&_input]:focus:ring-coral/10 [&_textarea]:w-full [&_textarea]:resize-none [&_textarea]:rounded-xl [&_textarea]:border [&_textarea]:border-line [&_textarea]:bg-[#FCFDFC] [&_textarea]:px-4 [&_textarea]:py-3 [&_textarea]:text-sm [&_textarea]:font-medium [&_textarea]:outline-none [&_textarea]:placeholder:text-slate-400 [&_textarea]:focus:border-coral [&_textarea]:focus:ring-4 [&_textarea]:focus:ring-coral/10">{children}</div></label>;
}