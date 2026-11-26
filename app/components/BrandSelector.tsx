"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { BrandKey, brands } from "../types/products";
import {
  BrandSettingsMap,
  getBrandSettings,
  isBrandVisible,
} from "../lib/brandSettings";

// Harus sama dengan brand awal di app/page.tsx
const INITIAL_BRAND: BrandKey = "fore";
// Jumlah kartu yang terlihat sekaligus di layar desktop (lg).
const CARDS_PER_PAGE = 4;

// Lebar kartu: HP 148px (digeser), tablet & desktop pas 4 kartu per halaman
// (lebar area dikurangi 3 jarak gap-3, dibagi 4). Brand ke-5 dst. digeser.
const CARD_WIDTH = "w-[148px] md:w-[calc((100%_-_2.25rem)/4)]";

export function BrandSelector({
  onChange,
}: {
  onChange?: (v: BrandKey) => void;
}) {
  const [selected, setSelected] = useState<BrandKey>(INITIAL_BRAND);
  const [settings, setSettings] = useState<BrandSettingsMap | null>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);
  const scrollerRef = useRef<HTMLDivElement>(null);

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

  // Tombol panah hanya aktif kalau masih ada brand di kiri/kanan.
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

    const update = () => {
      setCanPrev(el.scrollLeft > 4);
      setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
    };

    // ResizeObserver langsung memanggil update sekali saat mulai diamati.
    const observer = new ResizeObserver(update);
    observer.observe(el);
    el.addEventListener("scroll", update, { passive: true });

    return () => {
      observer.disconnect();
      el.removeEventListener("scroll", update);
    };
  }, [visibleBrands.length]);

  const scrollPage = (direction: 1 | -1) => {
    const el = scrollerRef.current;
    const card = el?.querySelector<HTMLElement>("[data-brand-card]");
    if (!el || !card) return;

    const gap = parseFloat(getComputedStyle(el).columnGap) || 0;
    el.scrollBy({
      left: direction * (card.offsetWidth + gap) * CARDS_PER_PAGE,
      behavior: "smooth",
    });
  };

  const arrowClass =
    "grid size-8 place-items-center rounded-full bg-surface text-ink shadow-card transition hover:bg-primary-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-surface";

  return (
    <section
      className="mx-auto max-w-6xl pt-6 md:pt-8"
      aria-labelledby="brand-selector-title"
    >
      <div className="mb-2 flex items-center justify-between gap-3 px-4">
        <h2
          id="brand-selector-title"
          className="text-base font-bold tracking-[-0.01em] text-ink"
        >
          Pilih Brand
        </h2>
        <div className="flex items-center gap-2">
          {settings && (
            <span className="text-xs font-semibold text-primary-strong tabular-nums">
              {visibleBrands.length} brand
            </span>
          )}
          {(canPrev || canNext) && (
            <div className="hidden items-center gap-1.5 md:flex">
              <button
                type="button"
                onClick={() => scrollPage(-1)}
                disabled={!canPrev}
                className={arrowClass}
                aria-label="Brand sebelumnya"
              >
                <ChevronLeft size={16} strokeWidth={2} />
              </button>
              <button
                type="button"
                onClick={() => scrollPage(1)}
                disabled={!canNext}
                className={arrowClass}
                aria-label="Brand berikutnya"
              >
                <ChevronRight size={16} strokeWidth={2} />
              </button>
            </div>
          )}
        </div>
      </div>

      {settings && visibleBrands.length === 0 && (
        <p className="mx-4 rounded-2xl bg-surface-alt px-4 py-5 text-center text-sm text-secondary">
          Belum ada brand yang tersedia saat ini.
        </p>
      )}

      {/* Satu baris yang bisa digeser, seperti filter kategori. */}
      <div
        ref={scrollerRef}
        className="no-scrollbar flex snap-x snap-mandatory gap-2.5 overflow-x-auto scroll-px-4 px-4 py-1 md:gap-3"
      >
        {!settings &&
          Array.from({ length: CARDS_PER_PAGE }).map((_, i) => (
            <div
              key={i}
              className={`h-[62px] shrink-0 animate-pulse rounded-2xl bg-surface-alt md:h-[80px] ${CARD_WIDTH}`}
              aria-hidden="true"
            />
          ))}

        {visibleBrands.map((b) => {
          const active = selected === b.id;
          const discount = settings?.[b.id]?.discount_percent;

          return (
            <button
              key={b.id}
              data-brand-card
              type="button"
              onClick={() => handleSelect(b.id as BrandKey)}
              aria-pressed={active}
              className={`relative flex h-[62px] shrink-0 snap-start items-center gap-2 rounded-2xl py-2 pl-3.5 pr-2 text-left transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-screen md:h-[80px] md:gap-3 md:pl-4 md:pr-3 ${CARD_WIDTH} ${
                active
                  ? "bg-primary text-on-primary shadow-primary"
                  : "bg-surface-alt text-ink hover:bg-[#e8e8e8]"
              }`}
            >
              {/* flex-1 + min-w-0: nama memakai sisa ruang dan turun baris,
                  logo shrink-0 di kanan, jadi keduanya tidak bertumpuk. */}
              <span className="flex min-w-0 flex-1 flex-col items-start">
                <span className="line-clamp-2 wrap-anywhere text-xs font-semibold leading-4 lg:text-sm lg:leading-5">
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
                className={`grid h-11 w-14 shrink-0 place-items-center rounded-xl bg-surface p-1.5 md:h-12 md:w-16 lg:h-14 lg:w-20 ${
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
