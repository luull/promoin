"use client";

import { useEffect, useState } from "react";
import { Coffee, LogOut, RefreshCw } from "lucide-react";
import {
  AdminAuthError,
  AdminOrder,
  AdminSession,
  DashboardData,
  OrderStatus,
  adminDashboard,
  adminListOrders,
} from "../../lib/admin";
import { BrandSettingsMap, getBrandSettings } from "../../lib/brandSettings";
import { BrandKey, brands } from "../../types/products";
import { BrandSettingCard } from "./BrandSettingCard";
import { OrderList } from "./OrderList";
import { PERIODS, Period, formatRupiah, periodStart } from "./format";

export function AdminDashboard({
  session,
  onLogout,
  onSessionExpired,
}: {
  session: AdminSession;
  onLogout: () => void;
  onSessionExpired: () => void;
}) {
  const [period, setPeriod] = useState<Period>("30d");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("new");
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [settings, setSettings] = useState<BrandSettingsMap>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  const token = session.token;

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError("");

      try {
        const from = periodStart(period);
        const [dashboardData, orderData, brandSettings] = await Promise.all([
          adminDashboard(token, from),
          adminListOrders(
            token,
            statusFilter === "all" ? null : statusFilter,
            from,
          ),
          getBrandSettings({ fresh: true }),
        ]);

        if (cancelled) return;

        setDashboard(dashboardData);
        setOrders(orderData);
        setSettings(brandSettings);
      } catch (loadError) {
        if (cancelled) return;

        if (loadError instanceof AdminAuthError) {
          onSessionExpired();
          return;
        }

        setError(
          loadError instanceof Error
            ? loadError.message
            : "Data admin gagal dimuat.",
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [token, period, statusFilter, reloadKey, onSessionExpired]);

  const reload = () => setReloadKey((key) => key + 1);

  const totals = dashboard?.totals;
  const cupsSold = (dashboard?.brands ?? []).reduce(
    (total, row) => total + Number(row.cups || 0),
    0,
  );

  const stats = [
    {
      label: "Omzet dibayar",
      value: formatRupiah(Number(totals?.paid_revenue ?? 0)),
      highlight: true,
    },
    { label: "Pesanan dibayar", value: Number(totals?.paid_orders ?? 0) },
    { label: "Cup terjual", value: cupsSold },
    { label: "Menunggu", value: Number(totals?.new_orders ?? 0) },
  ];

  return (
    <main className="min-h-screen bg-screen pb-12 text-ink">
      {/* ===== HEADER ===== */}
      <header className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 pt-4 md:pt-6">
        <div className="flex min-w-0 items-center gap-3">
          <span
            className="grid size-11 shrink-0 place-items-center rounded-full bg-surface text-ink shadow-card"
            aria-hidden="true"
          >
            <Coffee size={20} strokeWidth={1.8} />
          </span>
          <div className="min-w-0">
            <p className="truncate text-[11px] font-medium leading-4 text-muted">
              Halo, {session.username}
            </p>
            <h1 className="text-base font-bold leading-5 tracking-[-0.01em]">
              Admin Promoin
            </h1>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={reload}
            disabled={loading}
            className="grid size-11 place-items-center rounded-full bg-surface text-ink shadow-card transition hover:bg-primary-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-wait"
            aria-label="Muat ulang data"
          >
            <RefreshCw
              size={18}
              strokeWidth={1.8}
              className={loading ? "animate-spin" : ""}
            />
          </button>
          <button
            type="button"
            onClick={onLogout}
            className="flex h-11 items-center gap-2 rounded-full bg-ink px-4 text-xs font-semibold text-white transition hover:bg-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            <LogOut size={16} strokeWidth={1.9} />
            <span className="hidden sm:inline">Keluar</span>
          </button>
        </div>
      </header>

      {/* ===== PERIOD ===== */}
      <div
        className="no-scrollbar mx-auto mt-5 flex max-w-6xl gap-2 overflow-x-auto px-4"
        role="group"
        aria-label="Periode data"
      >
        {PERIODS.map((item) => {
          const active = period === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setPeriod(item.id)}
              aria-pressed={active}
              className={`h-9 shrink-0 rounded-full px-4 text-xs transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-screen ${
                active
                  ? "bg-primary font-bold text-on-primary shadow-primary"
                  : "bg-surface-alt font-medium text-secondary hover:bg-[#e8e8e8] hover:text-ink"
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      {error && (
        <div className="mx-auto mt-4 max-w-6xl px-4">
          <p
            role="alert"
            className="rounded-2xl bg-red-50 px-4 py-3 text-xs leading-5 text-red-600"
          >
            {error}
          </p>
        </div>
      )}

      {/* ===== STATS ===== */}
      <section
        className="mx-auto mt-4 grid max-w-6xl grid-cols-3 gap-3 px-4 md:grid-cols-4"
        aria-label="Ringkasan penjualan"
      >
        {stats.map((stat) => (
          <div
            key={stat.label}
            className={`min-w-0 rounded-[22px] ${
              stat.highlight
                ? "col-span-3 bg-ink p-4 text-white md:col-span-1"
                : "bg-surface p-3.5 shadow-card md:p-4"
            }`}
          >
            <p
              className={`text-[11px] font-medium ${
                stat.highlight ? "text-white/60" : "text-muted"
              }`}
            >
              {stat.label}
            </p>
            {loading && !dashboard ? (
              <div
                className={`mt-2 h-6 w-20 animate-pulse rounded-full ${
                  stat.highlight ? "bg-white/15" : "bg-surface-alt"
                }`}
              />
            ) : (
              <p
                className={`mt-1 truncate font-bold tracking-[-0.01em] tabular-nums ${
                  stat.highlight ? "text-2xl text-primary" : "text-xl"
                }`}
              >
                {stat.value}
              </p>
            )}
          </div>
        ))}
      </section>

      {/* ===== BRANDS ===== */}
      <section className="mx-auto mt-8 max-w-6xl px-4" aria-labelledby="admin-brands">
        <div className="mb-3 flex items-end justify-between gap-3">
          <div>
            <h2
              id="admin-brands"
              className="text-base font-bold tracking-[-0.01em]"
            >
              Brand
            </h2>
            <p className="mt-0.5 text-xs text-muted">
              Tampilkan atau sembunyikan brand dan atur diskonnya.
            </p>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          {brands.map((brand) => {
            const setting = settings[brand.id];

            return (
              <BrandSettingCard
                key={`${brand.id}-${setting?.updated_at ?? "default"}`}
                token={token}
                brand={{
                  id: brand.id as BrandKey,
                  name: brand.name,
                  logo: brand.logo,
                }}
                setting={setting}
                sales={dashboard?.brands.find((row) => row.brand === brand.id)}
                loading={loading && !dashboard}
                onSaved={(saved) => {
                  setSettings((current) => ({ ...current, [saved.brand]: saved }));
                }}
                onSessionExpired={onSessionExpired}
              />
            );
          })}
        </div>
      </section>

      {/* ===== ORDERS ===== */}
      <section className="mx-auto mt-8 max-w-6xl px-4" aria-labelledby="admin-orders">
        <OrderList
          token={token}
          orders={orders}
          loading={loading}
          statusFilter={statusFilter}
          onFilterChange={setStatusFilter}
          onStatusChanged={reload}
          onSessionExpired={onSessionExpired}
        />
      </section>
    </main>
  );
}
