"use client";

import {
  Check,
  ChevronLeft,
  Clock3,
  LoaderCircle,
  MapPin,
  RefreshCw,
  Search,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { getOutletsByBrand } from "../lib/outlets";
import { Outlet } from "../types/outlets";
import { BrandKey, brands } from "../types/products";

function normalize(value: string) {
  return value.toLocaleLowerCase("id-ID").replace(/\s+/g, " ").trim();
}

function getOutletArea(outlet: Outlet) {
  return Array.from(
    new Set(
      [outlet.city_or_regency, outlet.city, outlet.regency, outlet.area].filter(
        (value): value is string => Boolean(value),
      ),
    ),
  ).join(", ");
}

function getOpeningHours(outlet: Outlet) {
  return outlet.opening_hours_displayed ?? outlet.opening_hours;
}

export function OutletPicker({
  brand,
  selectedOutletId,
  onSelect,
  onClose,
}: {
  brand: BrandKey;
  selectedOutletId?: number;
  onSelect: (outlet: Outlet) => void;
  onClose: () => void;
}) {
  const [outlets, setOutlets] = useState<Outlet[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [requestKey, setRequestKey] = useState(0);

  const brandName = brands.find((item) => item.id === brand)?.name ?? brand;

  useEffect(() => {
    let cancelled = false;

    async function loadOutlets() {
      setLoading(true);
      setError("");

      try {
        const data = await getOutletsByBrand(brand);
        if (!cancelled) setOutlets(data);
      } catch (loadError) {
        if (!cancelled) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Outlet gagal dimuat. Silakan coba lagi.",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadOutlets();

    return () => {
      cancelled = true;
    };
  }, [brand, requestKey]);

  const filteredOutlets = useMemo(() => {
    const term = normalize(query);
    if (!term) return outlets;

    return outlets.filter((outlet) =>
      normalize(
        [
          outlet.name,
          outlet.address,
          outlet.city_or_regency,
          outlet.city,
          outlet.regency,
          outlet.area,
        ]
          .filter(Boolean)
          .join(" "),
      ).includes(term),
    );
  }, [outlets, query]);

  return (
    <section
      className="absolute inset-0 z-30 flex min-h-0 flex-col bg-screen"
      role="dialog"
      aria-modal="true"
      aria-labelledby="outlet-picker-title"
    >
      <header className="shrink-0 px-4 pb-3 pt-4">
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="grid size-11 shrink-0 place-items-center rounded-full bg-surface text-ink shadow-card transition hover:bg-primary-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-label="Kembali ke checkout"
          >
            <ChevronLeft size={20} strokeWidth={2} />
          </button>
          <div className="min-w-0 text-center">
            <h2
              id="outlet-picker-title"
              className="truncate text-base font-semibold tracking-[-0.01em] text-ink"
            >
              Pilih outlet {brandName}
            </h2>
            <p className="text-[11px] font-medium text-muted">
              Cari nama, area, atau alamat
            </p>
          </div>
          <span className="size-11 shrink-0" aria-hidden="true" />
        </div>

        <div className="relative mt-4">
          <Search
            size={18}
            strokeWidth={1.8}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted"
            aria-hidden="true"
          />
          <input
            autoFocus
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Contoh: Kemang, Bekasi, Grand Indonesia"
            className="h-12 w-full rounded-full border border-border-subtle bg-surface pl-11 pr-12 text-sm text-ink shadow-card outline-none transition placeholder:text-muted focus:border-primary focus:ring-4 focus:ring-primary/20"
            aria-label="Cari outlet"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute right-2 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-full bg-surface-alt text-secondary transition hover:bg-ink hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              aria-label="Hapus pencarian"
            >
              <X size={15} />
            </button>
          )}
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-6 pt-2">
        {loading && (
          <div className="flex min-h-48 flex-col items-center justify-center text-center">
            <LoaderCircle
              className="animate-spin text-primary-strong"
              size={28}
            />
            <p className="mt-3 text-sm font-medium text-secondary">
              Memuat outlet...
            </p>
          </div>
        )}

        {!loading && error && (
          <div className="flex min-h-56 flex-col items-center justify-center rounded-[24px] bg-surface p-6 text-center shadow-card">
            <div className="grid size-12 place-items-center rounded-full bg-red-50 text-red-500">
              <MapPin size={23} />
            </div>
            <p className="mt-4 text-sm font-semibold text-ink">
              Outlet belum dapat dimuat
            </p>
            <p className="mt-1 max-w-64 text-xs leading-5 text-secondary">
              {error}
            </p>
            <button
              type="button"
              onClick={() => setRequestKey((key) => key + 1)}
              className="mt-4 inline-flex h-10 items-center gap-2 rounded-full bg-ink px-4 text-xs font-semibold text-white transition hover:bg-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              <RefreshCw size={14} /> Coba lagi
            </button>
          </div>
        )}

        {!loading && !error && filteredOutlets.length === 0 && (
          <div className="flex min-h-56 flex-col items-center justify-center rounded-[24px] bg-surface p-6 text-center shadow-card">
            <div className="grid size-12 place-items-center rounded-full bg-primary-light text-primary-strong">
              <Search size={22} />
            </div>
            <p className="mt-4 text-sm font-semibold text-ink">
              Outlet tidak ditemukan
            </p>
            <p className="mt-1 text-xs leading-5 text-secondary">
              Coba gunakan nama gedung, kota, atau area lain.
            </p>
          </div>
        )}

        {!loading && !error && filteredOutlets.length > 0 && (
          <div className="space-y-3">
            <p className="px-1 text-xs font-semibold text-primary-strong tabular-nums">
              {filteredOutlets.length} outlet
              {query ? " ditemukan" : " tersedia"}
            </p>

            {filteredOutlets.map((outlet) => {
              const selected = outlet.id === selectedOutletId;
              const area = getOutletArea(outlet);
              const openingHours = getOpeningHours(outlet);

              return (
                <button
                  key={outlet.id}
                  type="button"
                  onClick={() => onSelect(outlet)}
                  aria-pressed={selected}
                  className={`w-full rounded-[22px] border-[1.5px] bg-surface p-3.5 text-left shadow-card transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                    selected
                      ? "border-primary bg-primary-light"
                      : "border-transparent hover:border-border-subtle"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`grid size-10 shrink-0 place-items-center rounded-full ${
                        selected
                          ? "bg-primary text-on-primary"
                          : "bg-surface-alt text-ink"
                      }`}
                    >
                      {selected ? (
                        <Check size={18} strokeWidth={2.4} />
                      ) : (
                        <MapPin size={18} strokeWidth={1.8} />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-sm font-semibold leading-5 text-ink">
                          {outlet.name}
                        </p>
                        {selected && (
                          <span className="shrink-0 rounded-full bg-ink px-2.5 py-1 text-[10px] font-bold text-white">
                            Dipilih
                          </span>
                        )}
                      </div>

                      {area && (
                        <p className="mt-1 text-xs font-semibold text-primary-strong">
                          {area}
                        </p>
                      )}
                      <p className="mt-1 line-clamp-2 text-xs leading-5 text-secondary">
                        {outlet.address ?? "Alamat belum tersedia"}
                      </p>
                      {openingHours && (
                        <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-surface-alt px-2.5 py-1 text-[11px] text-secondary">
                          <Clock3 size={12} /> {openingHours}
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
