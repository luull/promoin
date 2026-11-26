import { CartItem } from "../types/cart";
import { Outlet } from "../types/outlets";
import { BrandKey, brands } from "../types/products";
import { rememberOrder } from "./orderHistory";
import { getSupabaseClient } from "./supabase";

type CreateOrderResult =
  | { ok: true; order_id: number; total: number; access_token: string }
  | {
      ok: false;
      error:
        | "INVALID_NAME"
        | "INVALID_PHONE"
        | "INVALID_ITEMS"
        | "INVALID_OPTIONS"
        | "INVALID_OUTLET"
        | "BRAND_HIDDEN"
        | "PRICE_CHANGED";
      brands?: string[];
      items?: string[];
    };

function brandLabel(id: string) {
  return brands.find((brand) => brand.id === id)?.name ?? id;
}

function toMessage(result: Extract<CreateOrderResult, { ok: false }>) {
  switch (result.error) {
    case "BRAND_HIDDEN":
      return `${(result.brands ?? []).map(brandLabel).join(", ")} sedang tidak tersedia. Hapus menunya dari keranjang dulu.`;
    case "PRICE_CHANGED":
      return `Harga ${(result.items ?? []).join(", ")} sudah berubah. Hapus menu tersebut lalu tambahkan lagi agar harganya terbaru.`;
    case "INVALID_NAME":
      return "Nama pemesan harus 2 sampai 80 karakter.";
    case "INVALID_PHONE":
      return "Nomor HP tidak valid. Gunakan nomor seperti 081234567890.";
    case "INVALID_OUTLET":
      return "Outlet yang dipilih tidak valid. Pilih ulang outletnya.";
    default:
      return "Isi keranjang tidak valid. Muat ulang halaman lalu coba lagi.";
  }
}

/**
 * Mencatat pesanan di database sebelum dikirim ke WhatsApp, lalu menyimpannya
 * ke riwayat transaksi di perangkat ini.
 * Harga dihitung ulang oleh fungsi create_order di database.
 */
export async function createOrder({
  name,
  phone,
  items,
  outlets,
}: {
  name: string;
  phone: string;
  items: CartItem[];
  outlets: Partial<Record<BrandKey, Outlet>>;
}) {
  const payloadItems = items.map((item) => ({
    product_id: item.id,
    qty: item.qty,
    unit_price:
      item.price.selling +
      (item.options ?? []).reduce(
        (total, option) => total + (option.price || 0),
        0,
      ),
    options: (item.options ?? []).map((option) => ({
      name: option.name,
      value: option.value,
    })),
  }));

  const payloadOutlets = Object.fromEntries(
    Object.entries(outlets)
      .filter(([, outlet]) => Boolean(outlet))
      .map(([brand, outlet]) => [brand, outlet!.id]),
  );

  const { data, error } = await getSupabaseClient().rpc("create_order", {
    p_customer_name: name,
    p_customer_phone: phone,
    p_items: payloadItems,
    p_outlets: payloadOutlets,
  });

  if (error) {
    console.error("create_order error:", error);
    throw new Error(
      "Pesanan belum bisa dicatat. Periksa koneksi lalu coba lagi.",
    );
  }

  const result = data as CreateOrderResult;

  if (!result.ok) {
    throw new Error(toMessage(result));
  }

  rememberOrder({ id: result.order_id, token: result.access_token });

  return { orderId: result.order_id, total: result.total };
}
