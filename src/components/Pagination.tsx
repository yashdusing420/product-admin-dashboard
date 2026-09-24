"use client";

interface PaginationProps {
  page: number;
  total: number;
  limit: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
}

export function Pagination({ page, total, limit, onPageChange, onLimitChange }: PaginationProps) {
  const pageCount = Math.max(1, Math.ceil(total / limit));
  const start = total === 0 ? 0 : (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);
  const pages = getPageNumbers(page, pageCount);
  return (
    <div className="flex flex-col gap-4 border-t border-line px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3 text-xs font-semibold text-slate-500">
        <span>Rows per page</span>
        <select value={limit} onChange={(event) => onLimitChange(Number(event.target.value))} className="rounded-lg border border-line bg-white px-2 py-1.5 font-bold text-ink outline-none focus:border-coral">
          {[10, 20, 50].map((value) => <option key={value} value={value}>{value}</option>)}
        </select>
        <span className="hidden text-slate-400 sm:inline">·</span>
        <span>Showing {start}–{end} of {total}</span>
      </div>
      <div className="flex items-center gap-1">
        <button disabled={page === 1} onClick={() => onPageChange(page - 1)} className="rounded-lg border border-line px-3 py-2 text-xs font-bold text-slate-500 transition hover:bg-sand disabled:cursor-not-allowed disabled:opacity-40">Previous</button>
        {pages.map((item, index) => item === "…" ? <span key={`ellipsis-${index}`} className="px-2 text-slate-400">…</span> : <button key={item} onClick={() => onPageChange(item)} className={`h-8 min-w-8 rounded-lg px-2 text-xs font-bold transition ${item === page ? "bg-ink text-white" : "text-slate-500 hover:bg-sand"}`}>{item}</button>)}
        <button disabled={page === pageCount} onClick={() => onPageChange(page + 1)} className="rounded-lg border border-line px-3 py-2 text-xs font-bold text-slate-500 transition hover:bg-sand disabled:cursor-not-allowed disabled:opacity-40">Next</button>
      </div>
    </div>
  );
}

function getPageNumbers(current: number, total: number): Array<number | "…"> {
  if (total <= 7) return Array.from({ length: total }, (_, index) => index + 1);
  if (current <= 4) return [1, 2, 3, 4, 5, "…", total];
  if (current >= total - 3) return [1, "…", total - 4, total - 3, total - 2, total - 1, total];
  return [1, "…", current - 1, current, current + 1, "…", total];
}