import Link from "next/link";
import { Product } from "@/types/product";

function formatPrice(price: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(price);
}

export function ProductImage({ product, className = "h-16 w-16" }: { product: Product; className?: string }) {
  return (
    <div className={`${className} shrink-0 overflow-hidden rounded-2xl bg-sand`}>
      {/* Product images are remote API assets, so a native img avoids forcing Next image config on dynamic URLs. */}
      <img src={product.thumbnail || product.images?.[0]} alt="" className="h-full w-full object-cover" />
    </div>
  );
}

export function ProductCard({ product }: { product: Product }) {
  return (
    <Link href={`/products/${product.id}`} className="group block rounded-3xl border border-line bg-white p-4 shadow-card transition hover:-translate-y-0.5 hover:shadow-soft">
      <div className="flex gap-4">
        <ProductImage product={product} className="h-24 w-24" />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="truncate text-base font-extrabold text-ink">{product.title}</p>
              <p className="mt-1 text-xs font-semibold capitalize text-slate-400">{product.category}</p>
            </div>
            <span className={`rounded-full px-2 py-1 text-[10px] font-bold ${product.stock > 20 ? "bg-mint text-emerald-800" : "bg-amber-50 text-amber-700"}`}>{product.stock} in stock</span>
          </div>
          <div className="mt-5 flex items-end justify-between">
            <span className="text-lg font-black">{formatPrice(product.price)}</span>
            <span className="text-sm font-bold text-amber-500">★ {product.rating.toFixed(1)}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export function ProductTable({ products, onDelete }: { products: Product[]; onDelete: (product: Product) => void }) {
  return (
    <div className="hidden overflow-hidden rounded-3xl border border-line bg-white shadow-card md:block">
      <table className="w-full text-left">
        <thead className="border-b border-line bg-[#FBFCFC]">
          <tr className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
            <th className="px-6 py-4">Product</th>
            <th className="px-4 py-4">Category</th>
            <th className="px-4 py-4">Price</th>
            <th className="px-4 py-4">Rating</th>
            <th className="px-4 py-4">Stock</th>
            <th className="px-6 py-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {products.map((product) => (
            <tr key={product.id} className="group transition hover:bg-[#FCFDFC]">
              <td className="px-6 py-4">
                <Link href={`/products/${product.id}`} className="flex min-w-[240px] items-center gap-3">
                  <ProductImage product={product} />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-extrabold text-ink group-hover:text-coral">{product.title}</p>
                    <p className="mt-1 text-xs text-slate-400">ID #{product.id}</p>
                  </div>
                </Link>
              </td>
              <td className="px-4 py-4 text-sm font-semibold capitalize text-slate-500">{product.category.replaceAll("-", " ")}</td>
              <td className="px-4 py-4 text-sm font-black">{formatPrice(product.price)}</td>
              <td className="px-4 py-4"><span className="font-bold text-amber-500">★ {product.rating.toFixed(1)}</span></td>
              <td className="px-4 py-4"><span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${product.stock > 20 ? "bg-mint text-emerald-800" : "bg-amber-50 text-amber-700"}`}>{product.stock} units</span></td>
              <td className="px-6 py-4">
                <div className="flex justify-end gap-1 opacity-0 transition group-hover:opacity-100">
                  <Link href={`/products/${product.id}/edit`} className="rounded-lg px-2.5 py-2 text-xs font-bold text-slate-500 hover:bg-sky hover:text-navy">Edit</Link>
                  <button onClick={() => onDelete(product)} className="rounded-lg px-2.5 py-2 text-xs font-bold text-red-500 hover:bg-red-50">Delete</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}