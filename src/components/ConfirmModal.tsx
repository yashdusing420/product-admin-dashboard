"use client";

import { ButtonSpinner } from "@/components/ui";

export function ConfirmModal({ title, description, busy, onCancel, onConfirm }: { title: string; description: string; busy: boolean; onCancel: () => void; onConfirm: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/50 p-4 backdrop-blur-sm" role="dialog" aria-modal="true">
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-soft">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-xl text-red-500">⌫</div>
        <h2 className="mt-5 text-xl font-black text-ink">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
        <div className="mt-7 flex justify-end gap-3">
          <button disabled={busy} onClick={onCancel} className="rounded-xl border border-line px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-sand disabled:opacity-50">Cancel</button>
          <button disabled={busy} onClick={onConfirm} className="flex items-center gap-2 rounded-xl bg-red-500 px-4 py-2.5 text-sm font-bold text-white hover:bg-red-600 disabled:opacity-60">{busy && <ButtonSpinner />} Delete product</button>
        </div>
      </div>
    </div>
  );
}