"use client";

import { useEffect, useState } from "react";
import {
  ClipboardList,
  Coffee,
  LogOut,
  RefreshCw,
  SlidersHorizontal,
} from "lucide-react";
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
import { StoreSettings, getStoreSettings } from "../../lib/storeSettings";
import { AdminFeeCard } from "./AdminFeeCard";
import { BrandKey, brands } from "../../types/products";
import { BrandSettingCard } from "./BrandSettingCard";
import { OrderList } from "./OrderList";
import { PERIODS, Period, formatRupiah, periodStart } from "./format";

type Tab = "orders" | "settings";

export function AdminDashboard({
  session,
  onLogout,
  onSessionExpired,
}: {
  session: AdminSession;
  onLogout: () => void;
  onSessionExpired: () => void;
}) {
  const [tab, setTab] = useState<Tab>("orders");
  const [period, setPeriod] = useState<Period>("30d");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("new");
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [settings, setSettings] = useState<BrandSettingsMap>({});
  const [storeSettings, setStoreSettings] = useState<StoreSettings | null>(
    null,
  );
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
        const [dashboardData, orderData, brandSettings, store] =
          await Promise.all([
            adminDashboard(token, from),
            adminListOrders(
              token,
              statusFilter === "all" ? null : statusFilter,
              from,
            ),
            getBrandSettings({ fresh: true }),
            getStoreSettings({ fresh: true }),
          ]);

        if (cancelled) return;

        setDashboard(dashboardData);
        setOrders(orderData);
        setSettings(brandSettings);
        setStoreSettings(store);
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
  const counts = totals?.status_counts;
  // Pesanan yang masih butuh tindakan admin.
  const actionCount =
    Number(counts?.new ?? 0) +
    Number(counts?.paid ?? 0) +
    Number(counts?.processing ?? 0);
  const cupsSold = (dashboard?.brands ?? []).reduce(
    (total, row) => total + Number(row.cups || 0),
    0,
  );

  const stats = [
    {
      label: "Omzet",
      value: formatRupiah(Number(totals?.paid_revenue ?? 0)),
      highlight: true,
    },
    { label: "Pesanan dibayar", value: Number(totals?.paid_orders ?? 0) },
    { label: "Cup terjual", value: cupsSold },
  ];

  const tabs: {
    id: Tab;
    label: string;
    icon: React.ReactNode;
    badge?: number;
  }[] = [
    {
      id: "orders",
      label: "Pesanan",
      icon: <ClipboardList size={16} strokeWidth={2} />,
      badge: actionCount,
    },
    {
      id: "settings",
      label: "Pengaturan",
      icon: <SlidersHorizontal size={16} strokeWidth={2} />,
    },
  ];

  return (
    <main className="min-h-screen bg-screen pb-12 text-ink">
      {/* ===== HEADER + TAB ===== */}
      <header className="sticky top-0 z-30 border-b border-border-subtle bg-screen/90 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 pb-3 pt-4 md:pt-5">
          <div className="flex items-center justify-between gap-3">
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
          </div>

          <div
            role="tablist"
            aria-label="Menu admin"
            className="mt-4 grid grid-cols-2 gap-1 rounded-full bg-surface-alt p-1 md:w-[420px]"
          >
            {tabs.map((item) => {
              const active = tab === item.id;

              return (
                <button
                  key={item.id}
                  id={`admin-tab-${item.id}`}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  aria-controls={`admin-panel-${item.id}`}
                  onClick={() => setTab(item.id)}
                  className={`flex h-10 items-center justify-center gap-2 rounded-full text-xs transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                    active
                      ? "bg-surface font-bold text-ink shadow-card"
                      : "font-medium text-secondary hover:text-ink"
                  }`}
                >
                  {item.icon}
                  {item.label}
                  {item.badge ? (
                    <span className="grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-on-primary tabular-nums">
                      {item.badge}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* ===== PERIOD (berlaku untuk kedua tab) ===== */}
      <div className="mx-auto mt-4 flex max-w-6xl items-center gap-3 px-4">
        <span className="shrink-0 text-xs font-medium text-muted">Periode</span>
        <div
          className="no-scrollbar -mr-4 flex gap-2 overflow-x-auto pr-4"
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

      {/* ===== TAB: PESANAN ===== */}
      <div
        id="admin-panel-orders"
        role="tabpanel"
        aria-labelledby="admin-tab-orders"
        hidden={tab !== "orders"}
        className="mx-auto max-w-6xl px-4"
      >
        <section
          className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3"
          aria-label="Ringkasan penjualan"
        >
          {stats.map((stat) => (
            <div
              key={stat.label}
              className={`min-w-0 rounded-[22px] ${
                stat.highlight
                  ? "col-span-2 bg-ink p-4 text-white md:col-span-1"
                  : "bg-surface p-4 shadow-card"
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

        <section className="mt-6" aria-label="Daftar pesanan">
          <OrderList
            token={token}
            orders={orders}
            loading={loading}
            counts={counts}
            statusFilter={statusFilter}
            onFilterChange={setStatusFilter}
            onStatusChanged={reload}
            onSessionExpired={onSessionExpired}
          />
        </section>
      </div>

      {/* ===== TAB: PENGATURAN ===== */}
      <div
        id="admin-panel-settings"
        role="tabpanel"
        aria-labelledby="admin-tab-settings"
        hidden={tab !== "settings"}
        className="mx-auto max-w-6xl px-4"
      >
        <section className="mt-5" aria-labelledby="admin-fee-title">
          <h2
            id="admin-fee-title"
            className="text-base font-bold tracking-[-0.01em] text-ink"
          >
            Fee admin
          </h2>
          <p className="mt-0.5 text-xs leading-5 text-secondary">
            Biaya layanan yang ditambahkan ke setiap pesanan.
          </p>
          <div className="mt-3 md:w-1/2 md:pr-1.5">
            <AdminFeeCard
              // Dipasang ulang sekali setelah data termuat agar isian ikut nilai tersimpan.
              key={storeSettings ? "ready" : "loading"}
              token={token}
              settings={storeSettings}
              loading={loading && !storeSettings}
              onSaved={setStoreSettings}
              onSessionExpired={onSessionExpired}
            />
          </div>
        </section>

        <section className="mt-8" aria-labelledby="admin-brands-title">
          <h2
            id="admin-brands-title"
            className="text-base font-bold tracking-[-0.01em] text-ink"
          >
            Brand &amp; diskon
          </h2>
          <p className="mt-0.5 text-xs leading-5 text-secondary">
            Atur brand yang tampil di toko dan diskonnya. Angka penjualan
            mengikuti periode yang dipilih.
          </p>

          <div className="mt-3 grid items-start gap-3 md:grid-cols-2">
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
                    setSettings((current) => ({
                      ...current,
                      [saved.brand]: saved,
                    }));
                  }}
                  onSessionExpired={onSessionExpired}
                />
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}
