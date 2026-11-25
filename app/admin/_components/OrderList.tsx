"use client";

import { useState } from "react";
import { Check, LoaderCircle, MapPin, ReceiptText, RotateCcw, X } from "lucide-react";
import {
  AdminAuthError,
  AdminOrder,
  OrderStatus,
  adminSetOrderStatus,
} from "../../lib/admin";
import { BrandKey, brands } from "../../types/products";
import { STATUS_META, formatDateTime, formatRupiah } from "./format";

const FILTERS: { id: OrderStatus | "all"; label: string }[] = [
  { id: "new", label: "Baru" },
  { id: "paid", label: "Dibayar" },
  { id: "cancelled", label: "Batal" },
  { id: "all", label: "Semua" },
];

function brandName(id: string) {
  return brands.find((brand) => brand.id === id)?.name ?? id.toUpperCase();
}

function groupItems(items: AdminOrder["items"]) {
  return items.reduce<Record<string, AdminOrder["items"]>>((grouped, item) => {
    grouped[item.brand] = [...(grouped[item.brand] ?? []), item];
    return grouped;
  }, {});
}

export function OrderList({
  token,
  orders,
  loading,
  statusFilter,
  onFilterChange,
  onStatusChanged,
  onSessionExpired,
}: {
  token: string;
  orders: AdminOrder[];
  loading: boolean;
  statusFilter: OrderStatus | "all";
  onFilterChange: (status: OrderStatus | "all") => void;
  onStatusChanged: () => void;
  onSessionExpired: () => void;
}) {
  const [pending, setPending] = useState<{ id: number; status: OrderStatus } | null>(
    null,
  );
  const [error, setError] = useState("");

  async function changeStatus(orderId: number, status: OrderStatus) {
    setPending({ id: orderId, status });
    setError("");

    try {
      await adminSetOrderStatus(token, orderId, status);
      onStatusChanged();
    } catch (changeError) {
      if (changeError instanceof AdminAuthError) {
        onSessionExpired();
        return;
      }
      setError(
        changeError instanceof Error
          ? changeError.message
          : "Status pesanan gagal diubah.",
      );
    } finally {
      setPending(null);
    }
  }

  return (
    <>
      <div className="mb-3">
        <h2
          id="admin-orders"
          className="text-base font-bold tracking-[-0.01em] text-ink"
        >
          Pesanan
        </h2>
        <p className="mt-0.5 text-xs text-muted">
          Tandai pesanan setelah pembayaran QRIS terverifikasi. Penjualan hanya
          dihitung dari pesanan &quot;Dibayar&quot;.
        </p>
      </div>

      <div
        className="no-scrollbar -mx-4 mb-4 flex gap-2 overflow-x-auto px-4"
        role="group"
        aria-label="Filter status pesanan"
      >
        {FILTERS.map((filter) => {
          const active = statusFilter === filter.id;

          return (
            <button
              key={filter.id}
              type="button"
              onClick={() => onFilterChange(filter.id)}
              aria-pressed={active}
              className={`h-9 shrink-0 rounded-full px-4 text-xs transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-screen ${
                active
                  ? "bg-ink font-bold text-white"
                  : "bg-surface-alt font-medium text-secondary hover:bg-[#e8e8e8] hover:text-ink"
              }`}
            >
              {filter.label}
            </button>
          );
        })}
      </div>

      {error && (
        <p
          role="alert"
          className="mb-3 rounded-2xl bg-red-50 px-4 py-3 text-xs leading-5 text-red-600"
        >
          {error}
        </p>
      )}

      {loading && orders.length === 0 && (
        <div className="grid gap-3 md:grid-cols-2" aria-hidden="true">
          {Array.from({ length: 2 }).map((_, i) => (
            <div
              key={i}
              className="h-48 animate-pulse rounded-[24px] bg-surface shadow-card"
            />
          ))}
        </div>
      )}

      {!loading && orders.length === 0 && (
        <div className="flex min-h-48 flex-col items-center justify-center rounded-[24px] bg-surface p-6 text-center shadow-card">
          <span className="grid size-12 place-items-center rounded-full bg-primary-light text-primary-strong">
            <ReceiptText size={22} strokeWidth={1.8} />
          </span>
          <p className="mt-3 text-sm font-semibold text-ink">
            Belum ada pesanan
          </p>
          <p className="mt-1 text-xs text-muted">
            Coba ganti filter status atau periode.
          </p>
        </div>
      )}

      {orders.length > 0 && (
        <div
          className={`grid gap-3 md:grid-cols-2 ${loading ? "opacity-60" : ""}`}
        >
          {orders.map((order) => {
            const meta = STATUS_META[order.status];
            const grouped = groupItems(order.items);
            const cups = order.items.reduce((total, item) => total + item.qty, 0);

            return (
              <article
                key={order.id}
                className="flex flex-col rounded-[24px] bg-surface p-4 shadow-card"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[11px] font-medium text-muted tabular-nums">
                      #{order.id} · {formatDateTime(order.created_at)}
                    </p>
                    <h3 className="mt-0.5 truncate text-sm font-bold text-ink">
                      {order.customer_name}
                    </h3>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold ${meta.className}`}
                  >
                    {meta.label}
                  </span>
                </div>

                <div className="mt-3 space-y-3">
                  {Object.entries(grouped).map(([brand, items]) => {
                    const outlet = order.outlets?.[brand as BrandKey];

                    return (
                      <div key={brand} className="rounded-2xl bg-surface-alt p-3">
                        <p className="text-xs font-bold text-ink">
                          {brandName(brand)}
                        </p>
                        {outlet && (
                          <p className="mt-0.5 flex items-center gap-1 text-[11px] text-muted">
                            <MapPin size={11} className="shrink-0" />
                            <span className="truncate">{outlet.name}</span>
                          </p>
                        )}
                        <ul className="mt-2 space-y-1.5">
                          {items.map((item, index) => (
                            <li
                              key={`${item.name}-${index}`}
                              className="flex items-start justify-between gap-3 text-xs tabular-nums"
                            >
                              <span className="min-w-0 text-secondary">
                                <span className="font-semibold text-ink">
                                  {item.qty}×
                                </span>{" "}
                                {item.name}
                                {item.options.length > 0 && (
                                  <span className="block text-[11px] text-muted">
                                    {item.options
                                      .map((option) => option.value)
                                      .join(" • ")}
                                  </span>
                                )}
                              </span>
                              <span className="shrink-0 font-medium text-ink">
                                {formatRupiah(item.subtotal)}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-3 flex items-end justify-between gap-3 border-t border-dashed border-border-subtle pt-3 tabular-nums">
                  <p className="text-[11px] text-muted">
                    {cups} cup · fee {formatRupiah(order.admin_fee)}
                  </p>
                  <p className="text-base font-bold text-ink">
                    {formatRupiah(order.total)}
                  </p>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  {order.status !== "paid" && (
                    <StatusButton
                      label="Tandai dibayar"
                      icon={<Check size={15} strokeWidth={2.2} />}
                      variant="primary"
                      busy={pending?.id === order.id && pending.status === "paid"}
                      disabled={pending !== null}
                      onClick={() => changeStatus(order.id, "paid")}
                    />
                  )}
                  {order.status !== "cancelled" && (
                    <StatusButton
                      label="Batalkan"
                      icon={<X size={15} strokeWidth={2.2} />}
                      variant="danger"
                      busy={
                        pending?.id === order.id && pending.status === "cancelled"
                      }
                      disabled={pending !== null}
                      onClick={() => changeStatus(order.id, "cancelled")}
                    />
                  )}
                  {order.status !== "new" && (
                    <StatusButton
                      label="Kembalikan ke baru"
                      icon={<RotateCcw size={14} strokeWidth={2} />}
                      variant="ghost"
                      busy={pending?.id === order.id && pending.status === "new"}
                      disabled={pending !== null}
                      onClick={() => changeStatus(order.id, "new")}
                    />
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </>
  );
}

function StatusButton({
  label,
  icon,
  variant,
  busy,
  disabled,
  onClick,
}: {
  label: string;
  icon: React.ReactNode;
  variant: "primary" | "danger" | "ghost";
  busy: boolean;
  disabled: boolean;
  onClick: () => void;
}) {
  const styles = {
    primary:
      "flex-1 bg-primary text-on-primary shadow-primary hover:bg-primary-dark",
    danger: "bg-red-50 text-red-600 hover:bg-red-100",
    ghost: "bg-surface-alt text-secondary hover:bg-[#e8e8e8] hover:text-ink",
  }[variant];

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`flex h-10 items-center justify-center gap-1.5 rounded-full px-4 text-xs font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 ${styles}`}
    >
      {busy ? <LoaderCircle size={15} className="animate-spin" /> : icon}
      {label}
    </button>
  );
}
