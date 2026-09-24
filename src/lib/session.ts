import { Product, MutationOverlay } from "@/types/product";

const AUTH_TOKEN_KEY = "product-admin-token";
const AUTH_USER_KEY = "product-admin-user";
const MUTATIONS_KEY = "product-admin-mutations";

export function isBrowser() {
  return typeof window !== "undefined";
}

export function getToken(): string | null {
  return isBrowser() ? window.sessionStorage.getItem(AUTH_TOKEN_KEY) : null;
}

export function getUserName(): string {
  if (!isBrowser()) return "Admin";
  return window.sessionStorage.getItem(AUTH_USER_KEY) || "Admin";
}

export function saveAuth(token: string, username: string) {
  if (!isBrowser()) return;
  window.sessionStorage.setItem(AUTH_TOKEN_KEY, token);
  window.sessionStorage.setItem(AUTH_USER_KEY, username);
}

export function clearAuth() {
  if (!isBrowser()) return;
  window.sessionStorage.removeItem(AUTH_TOKEN_KEY);
  window.sessionStorage.removeItem(AUTH_USER_KEY);
}

function emptyOverlay(): MutationOverlay {
  return { created: [], updated: {}, deleted: [] };
}

export function getMutationOverlay(): MutationOverlay {
  if (!isBrowser()) return emptyOverlay();
  const stored = window.sessionStorage.getItem(MUTATIONS_KEY);
  if (!stored) return emptyOverlay();
  try {
    const parsed = JSON.parse(stored) as Partial<MutationOverlay>;
    return {
      created: Array.isArray(parsed.created) ? parsed.created : [],
      updated: parsed.updated && typeof parsed.updated === "object" ? parsed.updated : {},
      deleted: Array.isArray(parsed.deleted) ? parsed.deleted : []
    };
  } catch {
    return emptyOverlay();
  }
}

export function saveMutationOverlay(overlay: MutationOverlay) {
  if (!isBrowser()) return;
  window.sessionStorage.setItem(MUTATIONS_KEY, JSON.stringify(overlay));
  window.dispatchEvent(new Event("product-mutations-changed"));
}

export function upsertCreatedProduct(product: Product) {
  const overlay = getMutationOverlay();
  overlay.created = [product, ...overlay.created.filter((item) => item.id !== product.id)];
  overlay.deleted = overlay.deleted.filter((id) => id !== product.id);
  saveMutationOverlay(overlay);
}

export function upsertUpdatedProduct(product: Product) {
  const overlay = getMutationOverlay();
  overlay.updated[String(product.id)] = product;
  saveMutationOverlay(overlay);
}

export function markDeletedProduct(id: number) {
  const overlay = getMutationOverlay();
  overlay.created = overlay.created.filter((product) => product.id !== id);
  delete overlay.updated[String(id)];
  if (!overlay.deleted.includes(id)) overlay.deleted.push(id);
  saveMutationOverlay(overlay);
}

export function applyMutationOverlay(products: Product[]): Product[] {
  const overlay = getMutationOverlay();
  const deleted = new Set(overlay.deleted);
  const base = products
    .filter((product) => !deleted.has(product.id))
    .map((product) => overlay.updated[String(product.id)] || product);
  const existingIds = new Set(base.map((product) => product.id));
  const created = overlay.created
    .filter((product) => !deleted.has(product.id) && !existingIds.has(product.id))
    .map((product) => overlay.updated[String(product.id)] || product);
  return [...created, ...base];
}

export function getOverlayProduct(id: number): Product | null {
  const overlay = getMutationOverlay();
  if (overlay.deleted.includes(id)) return null;
  const updated = overlay.updated[String(id)];
  if (updated) return updated;
  return overlay.created.find((product) => product.id === id) || null;
}

export function isDeletedProduct(id: number) {
  return getMutationOverlay().deleted.includes(id);
}