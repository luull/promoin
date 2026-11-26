import { OrderStatus } from "../../lib/admin";

export function formatRupiah(value: number) {
  return `Rp ${Number(value || 0).toLocaleString("id-ID")}`;
}

export function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("id-ID", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export type Period = "today" | "7d" | "30d" | "all";

export const PERIODS: { id: Period; label: string }[] = [
  { id: "today", label: "Hari ini" },
  { id: "7d", label: "7 hari" },
  { id: "30d", label: "30 hari" },
  { id: "all", label: "Semua" },
];

export function periodStart(period: Period): Date | null {
  const now = new Date();

  if (period === "today") {
    now.setHours(0, 0, 0, 0);
    return now;
  }

  if (period === "7d") return new Date(now.getTime() - 7 * 86_400_000);
  if (period === "30d") return new Date(now.getTime() - 30 * 86_400_000);

  return null;
}

export const STATUS_META: Record<
  OrderStatus,
  { label: string; className: string }
> = {
  new: { label: "Menunggu bayar", className: "bg-amber-50 text-amber-700" },
  paid: { label: "Dibayar", className: "bg-sky-50 text-sky-700" },
  processing: { label: "Diproses", className: "bg-ink text-white" },
  done: { label: "Selesai", className: "bg-primary text-on-primary" },
  cancelled: { label: "Batal", className: "bg-red-50 text-red-600" },
};

/** Urutan langkah yang ditampilkan di kartu pesanan. */
export const ORDER_STEPS: { status: OrderStatus; label: string }[] = [
  { status: "new", label: "Masuk" },
  { status: "paid", label: "Dibayar" },
  { status: "processing", label: "Diproses" },
  { status: "done", label: "Selesai" },
];

type StatusAction = { status: OrderStatus; label: string };

/**
 * Aksi per status. "next" jadi tombol utama, "back" dan "cancel" jadi tombol
 * kecil di bawahnya agar tidak tertukar saat approve.
 */
export const STATUS_FLOW: Record<
  OrderStatus,
  { next?: StatusAction; back?: StatusAction; cancel: boolean }
> = {
  new: {
    next: { status: "paid", label: "Konfirmasi pembayaran" },
    cancel: true,
  },
  paid: {
    next: { status: "processing", label: "Proses pesanan" },
    back: { status: "new", label: "Batal konfirmasi bayar" },
    cancel: true,
  },
  processing: {
    next: { status: "done", label: "Tandai selesai" },
    back: { status: "paid", label: "Kembali ke Dibayar" },
    cancel: true,
  },
  done: {
    back: { status: "processing", label: "Kembali ke Diproses" },
    cancel: false,
  },
  cancelled: {
    back: { status: "new", label: "Aktifkan lagi" },
    cancel: false,
  },
};

export const STATUS_FILTERS: {
  id: OrderStatus | "all";
  label: string;
  hint: string;
}[] = [
  {
    id: "new",
    label: "Menunggu bayar",
    hint: "Cek bukti bayar QRIS dari pembeli di WhatsApp, lalu konfirmasi pembayaran.",
  },
  {
    id: "paid",
    label: "Dibayar",
    hint: "Pembayaran sudah masuk. Tekan Proses pesanan saat pesanan mulai dibuat.",
  },
  {
    id: "processing",
    label: "Diproses",
    hint: "Tandai selesai setelah pesanan diserahkan ke pembeli.",
  },
  { id: "done", label: "Selesai", hint: "Pesanan yang sudah selesai." },
  {
    id: "cancelled",
    label: "Batal",
    hint: "Pesanan batal tidak dihitung ke omzet.",
  },
  { id: "all", label: "Semua", hint: "Semua pesanan pada periode ini." },
];
