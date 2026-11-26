import { BrandKey } from "../types/products";
import { BrandSetting } from "./brandSettings";
import { StoreSettings } from "./storeSettings";
import { getSupabaseClient } from "./supabase";

/** Alur: new -> paid -> processing -> done. cancelled = dibatalkan. */
export type OrderStatus = "new" | "paid" | "processing" | "done" | "cancelled";

export type AdminSession = {
  token: string;
  username: string;
  expires_at: string;
};

export type DashboardBrandRow = {
  brand: string;
  paid_orders: number;
  cups: number;
  revenue: number;
};

export type DashboardData = {
  totals: {
    /** Pesanan yang sudah dibayar: paid + processing + done. */
    paid_orders: number;
    paid_revenue: number;
    /** Tidak ada jika supabase/admin.sql belum dijalankan ulang. */
    status_counts?: Record<OrderStatus, number>;
  };
  brands: DashboardBrandRow[];
};

export type AdminOrder = {
  id: number;
  customer_name: string;
  /** Format 628xxxxxxxxx. null untuk pesanan sebelum nomor HP diwajibkan. */
  customer_phone: string | null;
  status: OrderStatus;
  subtotal: number;
  admin_fee: number;
  total: number;
  outlets: Partial<Record<BrandKey, { id: number; name: string }>>;
  created_at: string;
  items: {
    brand: string;
    name: string;
    qty: number;
    unit_price: number;
    subtotal: number;
    options: { name: string; value: string }[];
  }[];
};

/** Sesi tidak valid atau kedaluwarsa. Halaman admin kembali ke login. */
export class AdminAuthError extends Error {
  constructor() {
    super("Sesi admin berakhir. Silakan login lagi.");
    this.name = "AdminAuthError";
  }
}

const SESSION_KEY = "promoin_admin_session";

export function loadAdminSession(): AdminSession | null {
  if (typeof window === "undefined") return null;

  try {
    const session = JSON.parse(
      localStorage.getItem(SESSION_KEY) ?? "null",
    ) as AdminSession | null;

    if (!session?.token || new Date(session.expires_at) <= new Date()) {
      localStorage.removeItem(SESSION_KEY);
      return null;
    }

    return session;
  } catch {
    localStorage.removeItem(SESSION_KEY);
    return null;
  }
}

export function saveAdminSession(session: AdminSession) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearAdminSession() {
  localStorage.removeItem(SESSION_KEY);
}

async function callAdminRpc<T>(fn: string, params: Record<string, unknown>) {
  const { data, error } = await getSupabaseClient().rpc(fn, params);

  if (error) {
    if (error.message?.includes("UNAUTHORIZED") || error.code === "28000") {
      throw new AdminAuthError();
    }

    if (error.code === "PGRST202") {
      throw new Error(
        "Fungsi admin belum ada di database. Jalankan supabase/admin.sql di Supabase SQL Editor.",
      );
    }

    if (error.code === "23514") {
      if (error.message?.includes("orders_status_check")) {
        throw new Error(
          "Database belum mengenal status Diproses/Selesai. Jalankan ulang supabase/admin.sql di Supabase SQL Editor.",
        );
      }
      throw new Error(
        error.message?.includes("brand_settings_brand_check")
          ? "Database masih memakai aturan brand lama. Jalankan ulang supabase/admin.sql di Supabase SQL Editor."
          : "Nilai tidak valid. Diskon harus 0 sampai 90.",
      );
    }

    console.error(`${fn} error:`, error);
    throw new Error("Permintaan gagal. Coba lagi sebentar.");
  }

  return data as T;
}

export async function adminLogin(username: string, password: string) {
  const result = await callAdminRpc<
    | { ok: true; token: string; username: string; expires_at: string }
    | { ok: false; error: "INVALID_CREDENTIALS" | "ACCOUNT_LOCKED" }
  >("admin_login", { p_username: username, p_password: password });

  if (!result.ok) {
    throw new Error(
      result.error === "ACCOUNT_LOCKED"
        ? "Terlalu banyak percobaan gagal. Coba lagi dalam 15 menit."
        : "Username atau password salah.",
    );
  }

  return {
    token: result.token,
    username: result.username,
    expires_at: result.expires_at,
  } satisfies AdminSession;
}

export async function adminLogout(token: string) {
  await callAdminRpc<null>("admin_logout", { p_token: token });
}

export async function adminMe(token: string) {
  return callAdminRpc<{ username: string } | null>("admin_me", {
    p_token: token,
  });
}

export async function adminUpdateBrand(
  token: string,
  brand: BrandKey,
  isVisible: boolean,
  discountPercent: number | null,
) {
  return callAdminRpc<BrandSetting>("admin_update_brand", {
    p_token: token,
    p_brand: brand,
    p_is_visible: isVisible,
    p_discount_percent: discountPercent,
  });
}

export async function adminUpdateStoreSettings(
  token: string,
  adminFee: number,
) {
  return callAdminRpc<StoreSettings>("admin_update_store_settings", {
    p_token: token,
    p_admin_fee: adminFee,
  });
}

export async function adminDashboard(token: string, from: Date | null) {
  return callAdminRpc<DashboardData>("admin_dashboard", {
    p_token: token,
    p_from: from?.toISOString() ?? null,
  });
}

export async function adminListOrders(
  token: string,
  status: OrderStatus | null,
  from: Date | null,
) {
  return callAdminRpc<AdminOrder[]>("admin_list_orders", {
    p_token: token,
    p_status: status,
    p_from: from?.toISOString() ?? null,
    p_limit: 50,
  });
}

export async function adminSetOrderStatus(
  token: string,
  orderId: number,
  status: OrderStatus,
) {
  return callAdminRpc<{ id: number; status: OrderStatus }>(
    "admin_set_order_status",
    { p_token: token, p_order_id: orderId, p_status: status },
  );
}
