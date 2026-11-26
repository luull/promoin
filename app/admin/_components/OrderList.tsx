"use client";

import { useState } from "react";
import {
  BadgeCheck,
  Ban,
  Coffee,
  LoaderCircle,
  MapPin,
  PackageCheck,
  Phone,
  ReceiptText,
  Undo2,
} from "lucide-react";
import {
  AdminAuthError,
  AdminOrder,
  OrderStatus,
  adminSetOrderStatus,
} from "../../lib/admin";
import { BrandKey, brands } from "../../types/products";
import { toLocalPhone } from "../../utils/phone";
import {
  ORDER_STEPS,
  STATUS_FILTERS,
  STATUS_FLOW,
  STATUS_META,
  formatDateTime,
  formatRupiah,
} from "./format";

const NEXT_ICON: Partial<Record<OrderStatus, React.ReactNode>> = {
  paid: <BadgeCheck size={17} strokeWidth={2} />,
  processing: <Coffee size={17} strokeWidth={2} />,
  done: <PackageCheck size={17} strokeWidth={2} />,
};

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
  counts,
  statusFilter,
  onFilterChange,
  onStatusChanged,
  onSessionExpired,
}: {
  token: string;
  orders: AdminOrder[];
  loading: boolean;
  counts?: Partial<Record<OrderStatus, number>>;
  statusFilter: OrderStatus | "all";
  onFilterChange: (status: OrderStatus | "all") => void;
  onStatusChanged: () => void;
  onSessionExpired: () => void;
}) {
  const [pending, setPending] = useState<{
    id: number;
    status: OrderStatus;
  } | null>(null);
  const [error, setError] = useState("");

  const activeFilter =
    STATUS_FILTERS.find((filter) => filter.id === statusFilter) ??
    STATUS_FILTERS[0];

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
      {/* ===== STATUS TABS ===== */}
      <div
        className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1"
        role="group"
        aria-label="Filter status pesanan"
      >
        {STATUS_FILTERS.map((filter) => {
          const active = statusFilter === filter.id;
          const count = filter.id === "all" ? undefined : counts?.[filter.id];

          return (
            <button
              key={filter.id}
              type="button"
              onClick={() => onFilterChange(filter.id)}
              aria-pressed={active}
              className={`flex h-10 shrink-0 items-center gap-2 rounded-full pl-4 text-xs transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-screen ${
                count === undefined ? "pr-4" : "pr-1.5"
              } ${
                active
                  ? "bg-ink font-bold text-white"
                  : "bg-surface font-medium text-secondary shadow-card hover:text-ink"
              }`}
            >
              {filter.label}
              {count !== undefined && (
                <span
                  className={`grid h-7 min-w-7 place-items-center rounded-full px-2 text-[11px] font-bold tabular-nums ${
                    active
                      ? "bg-white/15 text-white"
                      : count > 0
                        ? "bg-surface-alt text-ink"
                        : "bg-surface-alt text-muted"
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <p className="mt-3 text-xs leading-5 text-secondary">
        {activeFilter.hint}
      </p>

      {error && (
        <p
          role="alert"
          className="mt-3 rounded-2xl bg-red-50 px-4 py-3 text-xs leading-5 text-red-600"
        >
          {error}
        </p>
      )}

      {/* ===== LIST ===== */}
      <div className="mt-4">
        {loading && orders.length === 0 && (
          <div
            className="grid gap-3 md:grid-cols-2 xl:grid-cols-3"
            aria-hidden="true"
          >
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-64 animate-pulse rounded-[24px] bg-surface shadow-card"
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
              Tidak ada pesanan &quot;{activeFilter.label}&quot;
            </p>
            <p className="mt-1 text-xs text-muted">
              Coba pilih status atau periode lain.
            </p>
          </div>
        )}

        {orders.length > 0 && (
          <div
            className={`grid items-start gap-3 md:grid-cols-2 xl:grid-cols-3 ${
              loading ? "opacity-60" : ""
            }`}
          >
            {orders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                pending={pending}
                onChangeStatus={changeStatus}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}

function OrderCard({
  order,
  pending,
  onChangeStatus,
}: {
  order: AdminOrder;
  pending: { id: number; status: OrderStatus } | null;
  onChangeStatus: (orderId: number, status: OrderStatus) => void;
}) {
  const meta = STATUS_META[order.status] ?? STATUS_META.new;
  const flow = STATUS_FLOW[order.status] ?? STATUS_FLOW.new;
  const grouped = groupItems(order.items);
  const cups = order.items.reduce((total, item) => total + item.qty, 0);
  const busy = (status: OrderStatus) =>
    pending?.id === order.id && pending.status === status;
  const disabled = pending !== null;

  return (
    <article className="flex flex-col rounded-[24px] bg-surface p-4 shadow-card">
      {/* ===== HEAD ===== */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-medium text-muted tabular-nums">
            #{order.id} · {formatDateTime(order.created_at)}
          </p>
          <h3 className="mt-0.5 truncate text-sm font-bold text-ink">
            {order.customer_name}
          </h3>
          {order.customer_phone && (
            <a
              href={`https://wa.me/${order.customer_phone}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-0.5 inline-flex items-center gap-1 text-[11px] font-medium text-primary-strong tabular-nums hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <Phone size={11} className="shrink-0" />
              {toLocalPhone(order.customer_phone)}
            </a>
          )}
        </div>
        <span
          className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold ${meta.className}`}
        >
          {meta.label}
        </span>
      </div>

      {order.status !== "cancelled" && <StatusSteps status={order.status} />}

      {/* ===== ITEMS ===== */}
      <div className="mt-3 space-y-2">
        {Object.entries(grouped).map(([brand, items]) => {
          const outlet = order.outlets?.[brand as BrandKey];

          return (
            <div key={brand} className="rounded-2xl bg-surface-alt p-3">
              <p className="text-xs font-bold text-ink">{brandName(brand)}</p>
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
                          {item.options.map((option) => option.value).join(" • ")}
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

      {/* ===== ACTIONS ===== */}
      {flow.next && (
        <button
          type="button"
          onClick={() => onChangeStatus(order.id, flow.next!.status)}
          disabled={disabled}
          className="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-full bg-primary text-sm font-bold text-on-primary shadow-primary transition hover:bg-primary-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {busy(flow.next.status) ? (
            <LoaderCircle size={17} className="animate-spin" />
          ) : (
            NEXT_ICON[flow.next.status]
          )}
          {flow.next.label}
        </button>
      )}

      {(flow.back || flow.cancel) && (
        <div
          className={`flex items-center gap-2 ${
            flow.next ? "mt-2 justify-between" : "mt-3"
          }`}
        >
          {flow.back && (
            <SmallButton
              label={flow.back.label}
              icon={<Undo2 size={14} strokeWidth={2} />}
              variant="ghost"
              busy={busy(flow.back.status)}
              disabled={disabled}
              onClick={() => onChangeStatus(order.id, flow.back!.status)}
            />
          )}
          {flow.cancel && (
            <SmallButton
              label="Batalkan"
              icon={<Ban size={14} strokeWidth={2} />}
              variant="danger"
              busy={busy("cancelled")}
              disabled={disabled}
              onClick={() => onChangeStatus(order.id, "cancelled")}
              className="ml-auto"
            />
          )}
        </div>
      )}
    </article>
  );
}

function StatusSteps({ status }: { status: OrderStatus }) {
  const current = ORDER_STEPS.findIndex((step) => step.status === status);

  return (
    <ol className="mt-3 grid grid-cols-4 gap-1.5" aria-label="Progres pesanan">
      {ORDER_STEPS.map((step, index) => {
        const reached = index <= current;

        return (
          <li
            key={step.status}
            className="min-w-0"
            aria-current={index === current ? "step" : undefined}
          >
            <span
              className={`block h-1.5 rounded-full ${
                reached ? "bg-primary" : "bg-surface-alt"
              }`}
            />
            <span
              className={`mt-1 block truncate text-[10px] ${
                index === current
                  ? "font-bold text-ink"
                  : reached
                    ? "font-medium text-secondary"
                    : "text-muted"
              }`}
            >
              {step.label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

function SmallButton({
  label,
  icon,
  variant,
  busy,
  disabled,
  onClick,
  className = "",
}: {
  label: string;
  icon: React.ReactNode;
  variant: "danger" | "ghost";
  busy: boolean;
  disabled: boolean;
  onClick: () => void;
  className?: string;
}) {
  const styles = {
    danger: "text-red-600 hover:bg-red-50",
    ghost: "text-secondary hover:bg-surface-alt hover:text-ink",
  }[variant];

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`flex h-9 items-center justify-center gap-1.5 rounded-full px-3 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink disabled:cursor-not-allowed disabled:opacity-60 ${styles} ${className}`}
    >
      {busy ? <LoaderCircle size={14} className="animate-spin" /> : icon}
      {label}
    </button>
  );
}
