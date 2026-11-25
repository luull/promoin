import { BrandKey } from "../types/products";
import { getSupabaseClient } from "./supabase";

export type BrandSetting = {
  brand: BrandKey;
  is_visible: boolean;
  /** null = pakai selling_price dari database, 0 = tanpa diskon, 1-90 = override */
  discount_percent: number | null;
  updated_at: string;
};

export type BrandSettingsMap = Partial<Record<string, BrandSetting>>;

const CACHE_TTL_MS = 30_000;

let cache: { at: number; promise: Promise<BrandSettingsMap> } | null = null;

async function fetchBrandSettings(): Promise<BrandSettingsMap> {
  const { data, error } = await getSupabaseClient()
    .from("brand_settings")
    .select("brand, is_visible, discount_percent, updated_at");

  if (error) {
    throw new Error(`Gagal memuat pengaturan brand: ${error.message}`);
  }

  return Object.fromEntries(
    ((data ?? []) as BrandSetting[]).map((row) => [row.brand, row]),
  );
}

/**
 * Pengaturan brand dari tabel brand_settings, di-cache 30 detik.
 * Kalau tabel belum dibuat atau gagal dimuat, toko tetap jalan dengan
 * semua brand tampil dan harga asli dari database.
 */
export async function getBrandSettings({ fresh = false } = {}) {
  if (fresh || !cache || Date.now() - cache.at > CACHE_TTL_MS) {
    const promise = fetchBrandSettings().catch((error) => {
      console.error(error);
      cache = null;
      return {} as BrandSettingsMap;
    });
    cache = { at: Date.now(), promise };
  }

  return cache.promise;
}

export function clearBrandSettingsCache() {
  cache = null;
}

export function isBrandVisible(settings: BrandSettingsMap, brand: string) {
  return settings[brand]?.is_visible ?? true;
}

/** Harus sama dengan private.brand_selling_price() di supabase/admin.sql */
export function applyBrandPrice(
  price: { original: number; selling: number },
  discountPercent: number | null | undefined,
) {
  const original = Math.round(price.original);

  if (discountPercent === null || discountPercent === undefined) {
    return { original, selling: Math.round(price.selling) };
  }

  if (discountPercent === 0) {
    return { original, selling: original };
  }

  const discounted =
    Math.round((price.original * (100 - discountPercent)) / 50000) * 500;

  return { original, selling: Math.min(original, discounted) };
}
