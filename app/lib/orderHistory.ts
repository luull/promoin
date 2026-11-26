import { BrandKey } from "../types/products";
import { getSupabaseClient } from "./supabase";

export type CustomerOrderStatus =
  | "new"
  | "paid"
  | "processing"
  | "done"
  | "cancelled";

export type CustomerOrder = {
  id: number;
  status: CustomerOrderStatus;
  subtotal: number;
  admin_fee: number;
  total: number;
  outlets: Partial<Record<BrandKey, { id: number; name: string }>>;
  created_at: string;
  updated_at: string;
  items: {
    brand: string;
    name: string;
    qty: number;
    subtotal: number;
    options: { name: string; value: string }[];
  }[];
};

type StoredOrder = { id: number; token: string };

const STORAGE_KEY = "promoin_orders";
/** Dikirim setiap ada pesanan baru tersimpan, seperti "cart:update". */
export const ORDERS_UPDATE_EVENT = "orders:update";
// Sama dengan batas token di get_customer_orders.
const MAX_ORDERS = 50;

function readStoredOrders(): StoredOrder[] {
  if (typeof window === "undefined") return [];

  try {
    const parsed: unknown = JSON.parse(
      localStorage.getItem(STORAGE_KEY) ?? "[]",
    );

    if (!Array.isArray(parsed)) return [];

    return parsed.filter(
      (order): order is StoredOrder =>
        Number.isInteger(order?.id) && typeof order?.token === "string",
    );
  } catch {
    return [];
  }
}

/**
 * Menyimpan token pesanan di perangkat ini agar bisa dilihat di riwayat.
 * Tidak melempar error: pesanan sudah tercatat di database meski gagal disimpan.
 */
export function rememberOrder(order: StoredOrder) {
  try {
    const orders = [
      order,
      ...readStoredOrders().filter((item) => item.id !== order.id),
    ].slice(0, MAX_ORDERS);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
    window.dispatchEvent(new Event(ORDERS_UPDATE_EVENT));
  } catch (error) {
    console.warn("Riwayat pesanan gagal disimpan:", error);
  }
}

/** Jumlah pesanan yang tersimpan di perangkat ini, untuk badge menu Riwayat. */
export function getRememberedOrderCount() {
  return readStoredOrders().length;
}

/** Mengambil status terbaru pesanan yang pernah dibuat di perangkat ini. */
export async function fetchOrderHistory() {
  const tokens = readStoredOrders().map((order) => order.token);

  if (tokens.length === 0) return [];

  const { data, error } = await getSupabaseClient().rpc(
    "get_customer_orders",
    { p_tokens: tokens },
  );

  if (error) {
    console.error("get_customer_orders error:", error);
    throw new Error(
      "Riwayat transaksi belum bisa dimuat. Periksa koneksi lalu coba lagi.",
    );
  }

  return (data ?? []) as CustomerOrder[];
}
