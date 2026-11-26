import { getSupabaseClient } from "./supabase";

export type StoreSettings = {
  admin_fee: number;
  updated_at: string | null;
};

/** Sama dengan nilai awal store_settings di supabase/admin.sql. */
export const DEFAULT_ADMIN_FEE = 5000;
/** Sama dengan store_settings_admin_fee_check di supabase/admin.sql. */
export const MAX_ADMIN_FEE = 100_000;

const CACHE_TTL_MS = 30_000;

let cache: { at: number; promise: Promise<StoreSettings> } | null = null;

async function fetchStoreSettings(): Promise<StoreSettings> {
  const { data, error } = await getSupabaseClient()
    .from("store_settings")
    .select("admin_fee, updated_at")
    .maybeSingle();

  if (error) {
    throw new Error(`Gagal memuat pengaturan toko: ${error.message}`);
  }

  return {
    admin_fee: Number(data?.admin_fee ?? DEFAULT_ADMIN_FEE),
    updated_at: data?.updated_at ?? null,
  };
}

/**
 * Pengaturan toko (fee admin), di-cache 30 detik.
 * Kalau tabel belum dibuat atau gagal dimuat, dipakai fee bawaan.
 * Total yang ditagih tetap dihitung ulang oleh create_order di database.
 */
export async function getStoreSettings({ fresh = false } = {}) {
  if (fresh || !cache || Date.now() - cache.at > CACHE_TTL_MS) {
    const promise = fetchStoreSettings().catch((error) => {
      console.error(error);
      cache = null;
      return { admin_fee: DEFAULT_ADMIN_FEE, updated_at: null };
    });

    cache = { at: Date.now(), promise };
  }

  return cache.promise;
}

export function clearStoreSettingsCache() {
  cache = null;
}
