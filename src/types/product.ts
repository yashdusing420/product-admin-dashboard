export interface ProductReview {
  rating: number;
  comment: string;
  date: string;
  reviewerName: string;
  reviewerEmail: string;
}

export interface Product {
  id: number;
  title: string;
  description: string;
  category: string;
  price: number;
  discountPercentage?: number;
  rating: number;
  stock: number;
  tags?: string[];
  brand?: string;
  sku?: string;
  weight?: number;
  warrantyInformation?: string;
  shippingInformation?: string;
  availabilityStatus?: string;
  reviews?: ProductReview[];
  returnPolicy?: string;
  minimumOrderQuantity?: number;
  images: string[];
  thumbnail: string;
}

export interface ProductResponse {
  products: Product[];
  total: number;
  skip: number;
  limit: number;
}

export interface ProductDraft {
  title: string;
  description: string;
  category: string;
  price: string;
  stock: string;
  image: string;
  brand: string;
}

export type SortField = "title" | "price" | "rating";
export type SortOrder = "asc" | "desc";

export interface ProductQueryState {
  search: string;
  category: string;
  sortBy: SortField;
  order: SortOrder;
  page: number;
  limit: number;
}

export interface MutationOverlay {
  created: Product[];
  updated: Record<string, Product>;
  deleted: number[];
}