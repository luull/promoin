"use client";

import { useEffect, useState } from "react";
import { BrandKey, brands } from "../types/products";
import {
  BrandSettingsMap,
  getBrandSettings,
  isBrandVisible,
} from "../lib/brandSettings";

// Harus sama dengan brand awal di app/page.tsx
const INITIAL_BRAND: BrandKey = "fore";

export function BrandSelector({
  onChange,
}: {
  onChange?: (v: BrandKey) => void;
}) {
  const [selected, setSelected] = useState<BrandKey>(INITIAL_BRAND);
  const [settings, setSettings] = useState<BrandSettingsMap | null>(null);

  const handleSelect = (id: BrandKey) => {
    setSelected(id);
    onChange?.(id);
  };

  useEffect(() => {
    let cancelled = false;

    getBrandSettings().then((data) => {
      if (cancelled) return;

      setSettings(data);

      // Brand awal disembunyikan admin: pindah ke brand pertama yang tampil.
      if (!isBrandVisible(data, INITIAL_BRAND)) {
        const fallback = brands.find((b) => isBrandVisible(data, b.id))
          ?.id as BrandKey | undefined;

        if (fallback) {
          setSelected(fallback);
          onChange?.(fallback);
        }
      }
    });

    return () => {
      cancelled = true;
    };
  }, [onChange]);

  const visibleBrands = settings
    ? brands.filter((b) => isBrandVisible(settings, b.id))
    : [];

  return (
    <section
      className="mx-auto max-w-6xl pt-6 md:pt-8"
      aria-labelledby="brand-selector-title"
    >
      <div className="mb-3 flex items-center justify-between px-4">
        <h2
          id="brand-selector-title"
          className="text-base font-bold tracking-[-0.01em] text-ink"
        >
          Pilih Brand
        </h2>
        {settings && (
          <span className="text-xs font-semibold text-primary-strong tabular-nums">
            {visibleBrands.length} brand
          </span>
        )}
      </div>

      {settings && visibleBrands.length === 0 && (
        <p className="mx-4 rounded-2xl bg-surface-alt px-4 py-5 text-center text-sm text-secondary">
          Belum ada brand yang tersedia saat ini.
        </p>
      )}

      <div className="no-scrollbar flex snap-x snap-mandatory gap-2.5 overflow-x-auto scroll-px-4 px-4 pb-1 md:grid md:grid-cols-4 md:gap-3 md:overflow-visible">
        {!settings &&
          Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-[62px] w-[148px] shrink-0 animate-pulse rounded-2xl bg-surface-alt md:h-[80px] md:w-auto"
              aria-hidden="true"
            />
          ))}

        {visibleBrands.map((b) => {
          const active = selected === b.id;
          const discount = settings?.[b.id]?.discount_percent;

          return (
            <button
              key={b.id}
              type="button"
              onClick={() => handleSelect(b.id as BrandKey)}
              aria-pressed={active}
              className={`relative flex h-[62px] w-[148px] shrink-0 snap-start items-center justify-between gap-2 rounded-2xl py-2 pl-3.5 pr-2 text-left transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-screen md:h-[80px] md:w-auto md:pl-5 md:pr-3 ${
                active
                  ? "bg-primary text-on-primary shadow-primary"
                  : "bg-surface-alt text-ink hover:bg-[#e8e8e8]"
              }`}
            >
              <span className="min-w-0">
                <span className="block text-xs font-semibold leading-4 md:text-sm md:leading-5">
                  {b.name}
                </span>
                {discount ? (
                  <span
                    className={`mt-1 inline-block rounded-full px-1.5 py-0.5 text-[10px] font-bold leading-none tabular-nums ${
                      active ? "bg-ink text-white" : "bg-primary text-on-primary"
                    }`}
                  >
                    -{discount}%
                  </span>
                ) : null}
              </span>
              <span
                className={`grid h-11 w-14 shrink-0 place-items-center rounded-xl bg-surface p-1.5 md:h-14 md:w-20 ${
                  active ? "shadow-card" : ""
                }`}
              >
                <img
                  src={b.logo}
                  alt={`Logo ${b.name}`}
                  className="max-h-full w-full object-contain"
                />
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
