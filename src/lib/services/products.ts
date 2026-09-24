import { api } from "@/lib/api";
import { Product, ProductDraft, ProductQueryState, ProductResponse } from "@/types/product";

export interface ProductListParams extends Pick<ProductQueryState, "limit" | "sortBy" | "order"> {
  skip: number;
  signal?: AbortSignal;
}

export async function fetchProducts(params: ProductListParams) {
  const response = await api.get<ProductResponse>("/products", {
    params: {
      limit: params.limit,
      skip: params.skip,
      sortBy: params.sortBy,
      order: params.order
    },
    signal: params.signal
  });
  return response.data;
}

export async function searchProducts(query: string, params: ProductListParams) {
  const response = await api.get<ProductResponse>("/products/search", {
    params: {
      q: query,
      limit: params.limit,
      skip: params.skip,
      sortBy: params.sortBy,
      order: params.order
    },
    signal: params.signal
  });
  return response.data;
}

export async function fetchProductsByCategory(category: string, params: ProductListParams) {
  const response = await api.get<ProductResponse>(`/products/category/${encodeURIComponent(category)}`, {
    params: {
      limit: params.limit,
      skip: params.skip,
      sortBy: params.sortBy,
      order: params.order
    },
    signal: params.signal
  });
  return response.data;
}

export async function fetchProduct(id: number) {
  const response = await api.get<Product>(`/products/${id}`);
  return response.data;
}

export async function createProduct(draft: ProductDraft) {
  const response = await api.post<Product>("/products/add", draftToPayload(draft));
  return normalizeProduct(response.data, draft);
}

export async function updateProduct(id: number, draft: ProductDraft) {
  const response = await api.put<Product>(`/products/${id}`, draftToPayload(draft));
  return normalizeProduct({ ...response.data, id }, draft);
}

export async function removeProduct(id: number) {
  await api.delete(`/products/${id}`);
}

export async function fetchCategories(signal?: AbortSignal) {
  const response = await api.get<Array<string | { slug: string; name: string }>>("/products/categories", { signal });
  return response.data
    .map((category) => typeof category === "string" ? category : category.slug || category.name)
    .filter(Boolean);
}

function draftToPayload(draft: ProductDraft) {
  return {
    title: draft.title.trim(),
    description: draft.description.trim(),
    category: draft.category.trim(),
    price: Number(draft.price),
    stock: Number(draft.stock),
    brand: draft.brand.trim(),
    images: [draft.image.trim()],
    thumbnail: draft.image.trim()
  };
}

function normalizeProduct(product: Product, draft: ProductDraft): Product {
  const image = draft.image.trim();
  return {
    ...product,
    title: draft.title.trim(),
    description: draft.description.trim(),
    category: draft.category.trim(),
    price: Number(draft.price),
    stock: Number(draft.stock),
    brand: draft.brand.trim() || product.brand,
    rating: product.rating ?? 0,
    reviews: product.reviews ?? [],
    images: image ? [image] : product.images || [],
    thumbnail: image || product.thumbnail || ""
  };
}