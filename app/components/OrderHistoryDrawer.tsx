"use client";

import {
  ChevronLeft,
  MapPin,
  ReceiptText,
  RefreshCw,
  Smartphone,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  CustomerOrder,
  CustomerOrderStatus,
  fetchOrderHistory,
} from "../lib/orderHistory";
import { BrandKey, brands } from "../types/products";

const STATUS_META: Record<
  CustomerOrderStatus,
  { label: string; className: string }
> = {
  new: { label: "Menunggu pembayaran", className: "bg-amber-50 text-amber-700" },
  paid: { label: "Dibayar", className: "bg-sky-50 text-sky-700" },
  processing: { label: "Diproses", className: "bg-ink text-white" },
  done: { label: "Selesai", className: "bg-primary text-on-primary" },
  cancelled: { label: "Dibatalkan", className: "bg-red-50 text-red-600" },
};

function formatRupiah(value: number) {
  return `Rp ${Number(value || 0).toLocaleString("id-ID")}`;
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function groupItems(items: CustomerOrder["items"]) {
  return items.reduce<Record<string, CustomerOrder["items"]>>(
    (grouped, item) => {
      grouped[item.brand] = [...(grouped[item.brand] ?? []), item];
      return grouped;
    },
    {},
  );
}

export function OrderHistoryDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  // Status diambil ulang setiap drawer dibuka atau tombol muat ulang ditekan.
  useEffect(() => {
    if (!open) return;

    let cancelled = false;

    async function load() {
      setLoading(true);
      setError("");

      try {
        const data = await fetchOrderHistory();
        if (!cancelled) setOrders(data);
      } catch (loadError) {
        if (cancelled) return;
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Riwayat transaksi belum bisa dimuat.",
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [open, reloadKey]);

  useEffect(() => {
    if (!open) return;

    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    const previousBodyOverscroll = document.body.style.overscrollBehavior;

    document.body.style.overflow = "hidden";
    document.body.style.overscrollBehavior = "none";
    document.documentElement.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.body.style.overscrollBehavior = previousBodyOverscroll;
      document.documentElement.style.overflow = previousHtmlOverflow;
    };
  }, [open]);

  return (
    <div
      className={`fixed inset-0 z-50 overflow-hidden overscroll-none transition ${
        open ? "visible" : "invisible"
      }`}
      aria-hidden={!open}
    >
      <div
        onClick={onClose}
        className={`absolute inset-0 bg-ink/40 backdrop-blur-sm transition-opacity duration-300 ${
          open ? "opacity-100" : "opacity-0"
        }`}
        aria-hidden="true"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="order-history-title"
        className={`absolute right-0 top-0 flex h-full w-full max-w-full touch-pan-y flex-col overflow-hidden overscroll-none bg-screen shadow-2xl transition-transform duration-300 md:w-[440px] md:rounded-l-[32px] ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <header className="flex shrink-0 items-center justify-between px-4 pb-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="grid size-11 place-items-center rounded-full bg-surface text-ink shadow-card transition hover:bg-primary-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-label="Tutup riwayat transaksi"
          >
            <ChevronLeft size={20} strokeWidth={2} />
          </button>
          <h2
            id="order-history-title"
            className="text-base font-semibold tracking-[-0.01em] text-ink"
          >
            Riwayat transaksi
          </h2>
          <button
            type="button"
            onClick={() => setReloadKey((key) => key + 1)}
            disabled={loading}
            className="grid size-11 place-items-center rounded-full bg-surface text-ink shadow-card transition hover:bg-primary-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-wait"
            aria-label="Muat ulang status transaksi"
          >
            <RefreshCw
              size={18}
              strokeWidth={2}
              className={loading ? "animate-spin" : ""}
            />
          </button>
        </header>

        <div className="flex min-h-0 w-full max-w-full flex-1 touch-pan-y flex-col gap-3 overflow-x-hidden overflow-y-auto overscroll-x-none px-4 pb-6 pt-2">
          {error && (
            <div
              role="alert"
              className="flex items-center justify-between gap-3 rounded-2xl bg-red-50 px-4 py-3 text-xs leading-5 text-red-600"
            >
              <span>{error}</span>
              <button
                type="button"
                onClick={() => setReloadKey((key) => key + 1)}
                className="shrink-0 rounded-full bg-white px-3 py-1.5 font-semibold text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
              >
                Coba lagi
              </button>
            </div>
          )}

          {loading && orders.length === 0 && (
            <div className="space-y-3" aria-hidden="true">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="h-40 animate-pulse rounded-[22px] bg-surface shadow-card"
                />
              ))}
            </div>
          )}

          {!loading && !error && orders.length === 0 && (
            <div className="flex min-h-56 flex-col items-center justify-center rounded-[24px] bg-surface p-6 text-center shadow-card">
              <span className="grid size-14 place-items-center rounded-full bg-primary-light text-primary-strong">
                <ReceiptText size={24} strokeWidth={1.8} />
              </span>
              <p className="mt-4 text-sm font-semibold text-ink">
                Belum ada transaksi
              </p>
              <p className="mt-1 text-xs text-muted">
                Pesanan yang kamu buat di perangkat ini akan muncul di sini.
              </p>
            </div>
          )}

          {orders.map((order) => {
            const meta = STATUS_META[order.status] ?? STATUS_META.new;
            const grouped = groupItems(order.items);

            return (
              <article
                key={order.id}
                className={`rounded-[22px] bg-surface p-4 shadow-card transition ${
                  loading ? "opacity-60" : ""
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-ink tabular-nums">
                      Pesanan #{order.id}
                    </p>
                    <p className="mt-0.5 text-[11px] text-muted tabular-nums">
                      {formatDateTime(order.created_at)}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold ${meta.className}`}
                  >
                    {meta.label}
                  </span>
                </div>

                <div className="mt-3 space-y-2.5">
                  {Object.entries(grouped).map(([brandKey, items]) => {
                    const brand = brands.find((item) => item.id === brandKey);
                    const outlet = order.outlets?.[brandKey as BrandKey];

                    return (
                      <div
                        key={brandKey}
                        className="rounded-2xl bg-surface-alt p-3"
                      >
                        <div className="flex items-center gap-2">
                          {brand && (
                            <span className="grid h-6 w-8 shrink-0 place-items-center rounded-md bg-surface p-0.5">
                              <img
                                src={brand.logo}
                                alt=""
                                className="max-h-full w-full object-contain"
                              />
                            </span>
                          )}
                          <p className="truncate text-xs font-bold text-ink">
                            {brand?.name ?? brandKey.toUpperCase()}
                          </p>
                        </div>
                        {outlet && (
                          <p className="mt-1 flex items-center gap-1 text-[11px] text-muted">
                            <MapPin size={11} className="shrink-0" />
                            <span className="truncate">{outlet.name}</span>
                          </p>
                        )}
                        <ul className="mt-2 space-y-1">
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
                    Termasuk fee {formatRupiah(order.admin_fee)}
                  </p>
                  <p className="text-base font-bold text-ink">
                    {formatRupiah(order.total)}
                  </p>
                </div>
              </article>
            );
          })}

          {orders.length > 0 && (
            <p className="flex items-start gap-2 px-1 pt-1 text-[11px] leading-4 text-muted">
              <Smartphone size={14} className="mt-px shrink-0" />
              Riwayat tersimpan di perangkat ini. Status berubah setelah admin
              memverifikasi pembayaran.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
