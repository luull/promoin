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
  new: { label: "Baru", className: "bg-ink text-white" },
  paid: { label: "Dibayar", className: "bg-primary text-on-primary" },
  cancelled: { label: "Batal", className: "bg-red-50 text-red-600" },
};
