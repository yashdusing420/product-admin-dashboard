"use client";

import Link from "next/link";
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { fetchCategories, fetchProducts, fetchProductsByCategory, searchProducts } from "@/lib/services/products";
import { applyMutationOverlay, getMutationOverlay } from "@/lib/session";
import { Product, ProductQueryState, SortField, SortOrder } from "@/types/product";
import { EmptyState, ErrorState, LoadingState } from "@/components/ui";
import { ProductCard, ProductTable } from "@/components/ProductCard";
import { Pagination } from "@/components/Pagination";
import { ConfirmModal } from "@/components/ConfirmModal";
import { removeProduct } from "@/lib/services/products";
import { markDeletedProduct } from "@/lib/session";

const LIMITS = [10, 20, 50];

export default function ProductsPage() {
  return <Suspense fallback={<LoadingState />}><ProductsContent /></Suspense>;
}

function ProductsContent() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [error, setError] = useState("");
  const [queryInput, setQueryInput] = useState(params.get("search") || "");
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);
  const requestVersion = useRef(0);
  const abortRef = useRef<AbortController | null>(null);
  const searchRef = useRef(params.get("search") || "");

  const query = useMemo<ProductQueryState>(() => ({
    search: params.get("search") || "",
    category: params.get("category") || "",
    sortBy: isSortField(params.get("sortBy")) ? params.get("sortBy") as SortField : "title",
    order: params.get("order") === "desc" ? "desc" : "asc",
    page: safePositiveInt(params.get("page"), 1),
    limit: LIMITS.includes(Number(params.get("limit"))) ? Number(params.get("limit")) : 10
  }), [params]);
  const rawPage = params.get("page");

  const updateQuery = useCallback((changes: Partial<ProductQueryState>, resetPage = false) => {
    const next = { ...query, ...changes, ...(resetPage ? { page: 1 } : {}) };
    const nextParams = new URLSearchParams();
    if (next.search) nextParams.set("search", next.search);
    if (next.category) nextParams.set("category", next.category);
    if (next.sortBy !== "title") nextParams.set("sortBy", next.sortBy);
    if (next.order !== "asc") nextParams.set("order", next.order);
    nextParams.set("page", String(next.page));
    nextParams.set("limit", String(next.limit));
    router.replace(`${pathname}?${nextParams.toString()}`, { scroll: false });
  }, [pathname, query, router]);

  useEffect(() => {
    setQueryInput(query.search);
  }, [query.search]);

  useEffect(() => {
    let mounted = true;
    fetchCategories().then((items) => mounted && setCategories(items.sort())).catch(() => mounted && setCategories([])).finally(() => mounted && setCategoriesLoading(false));
    return () => { mounted = false; };
  }, []);

  const loadProducts = useCallback(async () => {
    const currentVersion = ++requestVersion.current;
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setLoading(true);
    setError("");
    try {
      const skip = (query.page - 1) * query.limit;
      const listParams = {
        limit: query.limit,
        skip,
        sortBy: query.sortBy,
        order: query.order,
        signal: controller.signal
      };
      let result: Product[];
      if (query.category && query.search) {
        // DummyJSON has no combined endpoint. Search is usually the narrower result set, so filter category locally.
        const response = await searchProducts(query.search, { ...listParams, limit: 0, skip: 0 });
        const overlay = getMutationOverlay();
        result = applyMutationOverlay([...response.products, ...overlay.created, ...Object.values(overlay.updated)])
          .filter((product) => matchesQuery(product, query.search, query.category));
        result = sortProducts(result, query.sortBy, query.order);
        setTotalCount(result.length);
      } else if (query.category) {
        const response = await fetchProductsByCategory(query.category, listParams);
        result = applyMutationOverlay(response.products).filter((product) => matchesQuery(product, query.search, query.category)).slice(0, query.limit);
        setTotalCount(response.total);
      } else if (query.search) {
        const response = await searchProducts(query.search, listParams);
        result = applyMutationOverlay(response.products).filter((product) => matchesQuery(product, query.search, query.category)).slice(0, query.limit);
        setTotalCount(response.total);
      } else {
        const response = await fetchProducts(listParams);
        result = applyMutationOverlay(response.products).slice(0, query.limit);
        setTotalCount(response.total);
      }
      if (currentVersion !== requestVersion.current) return;
      setProducts(result);
    } catch (caught: unknown) {
      if ((caught as { code?: string })?.code === "ERR_CANCELED" || controller.signal.aborted) return;
      if (currentVersion === requestVersion.current) setError("We couldn’t load the catalog. Check your connection and try again.");
    } finally {
      if (currentVersion === requestVersion.current) setLoading(false);
    }
  }, [query.category, query.limit, query.order, query.page, query.search, query.sortBy]);

  useEffect(() => {
    abortRef.current?.abort();
    requestVersion.current += 1;
    const searchChanged = searchRef.current !== query.search;
    searchRef.current = query.search;
    const timer = window.setTimeout(() => { void loadProducts(); }, searchChanged ? 450 : 0);
    return () => window.clearTimeout(timer);
  }, [loadProducts, query.search]);

  useEffect(() => {
    const lastPage = Math.max(1, Math.ceil(totalCount / query.limit));
    const rawPageInvalid = rawPage !== null && (!Number.isInteger(Number(rawPage)) || Number(rawPage) < 1);
    if (rawPageInvalid || (!loading && query.page > lastPage)) {
      updateQuery({ page: lastPage });
    }
  }, [loading, query.limit, query.page, rawPage, totalCount, updateQuery]);

  const sortedProducts = useMemo(() => [...products].sort((a, b) => {
    let comparison = 0;
    if (query.sortBy === "title") comparison = a.title.localeCompare(b.title);
    if (query.sortBy === "price") comparison = a.price - b.price;
    if (query.sortBy === "rating") comparison = a.rating - b.rating;
    return query.order === "desc" ? -comparison : comparison;
  }), [products, query.order, query.sortBy]);
  const isHybrid = Boolean(query.category && query.search);
  const pageCount = Math.max(1, Math.ceil(totalCount / query.limit));
  const safePage = Math.min(query.page, pageCount);
  const visibleProducts = isHybrid ? sortedProducts.slice((safePage - 1) * query.limit, safePage * query.limit) : sortedProducts;

  async function confirmDelete() {
    if (!deleteTarget || deleting) return;
    setDeleting(true);
    try {
      await removeProduct(deleteTarget.id);
      markDeletedProduct(deleteTarget.id);
      setProducts((current) => current.filter((product) => product.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch {
      setError("The product could not be deleted. Please try again.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div><p className="text-sm font-bold uppercase tracking-[0.16em] text-coral">Catalog</p><h2 className="mt-2 text-3xl font-black tracking-tight text-ink sm:text-4xl">All products</h2><p className="mt-2 text-sm text-slate-500">Keep your catalog tidy, searchable, and ready for action.</p></div>
        <Link href="/products/add" className="inline-flex items-center justify-center gap-2 rounded-xl bg-coral px-4 py-3 text-sm font-black text-white shadow-lg shadow-coral/20 transition hover:bg-[#df5b41]">＋ Add product</Link>
      </div>
      <div className="mt-7 rounded-3xl border border-line bg-white p-4 shadow-card sm:p-5">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
          <div className="relative flex-1">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg text-slate-400">⌕</span>
            <input value={queryInput} onChange={(event) => { setQueryInput(event.target.value); updateQuery({ search: event.target.value }, true); }} placeholder="Search products by name or description…" className="w-full rounded-xl border border-line bg-[#FCFDFC] py-3 pl-11 pr-4 text-sm font-medium outline-none focus:border-coral focus:ring-4 focus:ring-coral/10" />
          </div>
          <div className="grid grid-cols-2 gap-3 sm:flex">
            <select value={query.category} onChange={(event) => updateQuery({ category: event.target.value }, true)} disabled={categoriesLoading} className="min-w-0 rounded-xl border border-line bg-[#FCFDFC] px-3 py-3 text-sm font-bold capitalize text-slate-600 outline-none focus:border-coral sm:min-w-[170px]"><option value="">All categories</option>{categories.map((category) => <option key={category} value={category}>{category.replaceAll("-", " ")}</option>)}</select>
            <select value={`${query.sortBy}-${query.order}`} onChange={(event) => { const [sortBy, order] = event.target.value.split("-") as [SortField, SortOrder]; updateQuery({ sortBy, order }, true); }} className="min-w-0 rounded-xl border border-line bg-[#FCFDFC] px-3 py-3 text-sm font-bold text-slate-600 outline-none focus:border-coral sm:min-w-[170px]"><option value="title-asc">Title A–Z</option><option value="title-desc">Title Z–A</option><option value="price-asc">Price low–high</option><option value="price-desc">Price high–low</option><option value="rating-desc">Rating high–low</option><option value="rating-asc">Rating low–high</option></select>
          </div>
        </div>
      </div>
      <div className="mt-6">
        {loading ? <LoadingState /> : error ? <ErrorState message={error} onRetry={() => void loadProducts()} /> : visibleProducts.length === 0 ? <EmptyState title="No products found" description={query.search || query.category ? "Try a different search or clear one of your filters." : "Your catalog is empty. Add your first product to get started."} /> : <>
          <ProductTable products={visibleProducts} onDelete={setDeleteTarget} />
          <div className="space-y-3 md:hidden">{visibleProducts.map((product) => <ProductCard key={product.id} product={product} />)}</div>
          <div className="mt-4 overflow-hidden rounded-3xl border border-line bg-white shadow-card"><Pagination page={safePage} total={isHybrid ? sortedProducts.length : totalCount} limit={query.limit} onPageChange={(page) => updateQuery({ page })} onLimitChange={(limit) => updateQuery({ limit }, true)} /></div>
        </>}
      </div>
      {deleteTarget && <ConfirmModal title={`Delete ${deleteTarget.title}?`} description="This removes the product from the current browser session. DummyJSON mutations are simulated, so the session overlay keeps your decision consistent while you work." busy={deleting} onCancel={() => setDeleteTarget(null)} onConfirm={() => void confirmDelete()} />}
    </>
  );
}

function safePositiveInt(value: string | null, fallback: number) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function isSortField(value: string | null): value is SortField {
  return value === "title" || value === "price" || value === "rating";
}

function matchesQuery(product: Product, search: string, category: string) {
  const searchable = `${product.title} ${product.description} ${product.brand || ""}`.toLowerCase();
  return (!search || searchable.includes(search.toLowerCase())) && (!category || product.category === category);
}

function sortProducts(products: Product[], sortBy: SortField, order: SortOrder) {
  return [...products].sort((a, b) => {
    let comparison = 0;
    if (sortBy === "title") comparison = a.title.localeCompare(b.title);
    if (sortBy === "price") comparison = a.price - b.price;
    if (sortBy === "rating") comparison = a.rating - b.rating;
    return order === "desc" ? -comparison : comparison;
  });
}