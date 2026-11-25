/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import {
  Candy,
  ChevronLeft,
  Coffee,
  CupSoda,
  Droplet,
  Milk,
  ShoppingBag,
  Snowflake,
  Sparkles,
  TicketPercent,
} from "lucide-react";
import { Product, brands } from "../types/products";
import { getProductOptions } from "../lib/catalog";
import { addToCart } from "../utils/cart";

export function ProductModal({
  product,
  onClose,
  onSuccess,
}: {
  product: Product;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [qty, setQty] = useState(1);
  const [show, setShow] = useState(true);
  const [options, setOptions] = useState<any[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(false);

  const [selectedOptions, setSelectedOptions] = useState<Record<string, any>>(
    {},
  );

  const handleSelect = (opt: any, value: any) => {
    setSelectedOptions((prev) => {
      const current = prev[opt.name];

      if (opt.type === "radio") {
        return {
          ...prev,
          [opt.name]: value,
        };
      }

      let updated = current ? [...current] : [];

      const exists = updated.find((v: any) => v.value === value.value);

      if (exists) {
        updated = updated.filter((v: any) => v.value !== value.value);
      } else {
        if (updated.length < (opt.max_selections || 999)) {
          updated.push(value);
        }
      }

      return {
        ...prev,
        [opt.name]: updated,
      };
    });
  };

  const formatOptionsForCart = () => {
    const result: any[] = [];

    Object.entries(selectedOptions).forEach(([name, val]: any) => {
      if (!val) return;

      if (Array.isArray(val)) {
        val.forEach((v) => {
          result.push({
            name,
            value: v.value,
            price: v.price,
          });
        });
      } else {
        result.push({
          name,
          value: val.value,
          price: val.price,
        });
      }
    });

    return result;
  };

  const getTotalPrice = () => {
    let total = product.price.selling;

    Object.values(selectedOptions).forEach((val: any) => {
      if (!val) return;

      if (Array.isArray(val)) {
        val.forEach((v) => (total += v.price));
      } else {
        total += val.price;
      }
    });

    return total * qty;
  };

  const handleClose = () => {
    setShow(false);
    setTimeout(onClose, 200);
  };

  const isValid = () => {
    for (const opt of options) {
      if (opt.is_required) {
        const val = selectedOptions[opt.name];

        if (!val || (Array.isArray(val) && val.length === 0)) {
          return false;
        }
      }
    }
    return true;
  };

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        setLoadingOptions(true);

        const data = await getProductOptions(product.product_id);
        setOptions(data);
      } catch (err) {
        console.error("Options error:", err);
      } finally {
        setLoadingOptions(false);
      }
    };

    if (product?.product_id) {
      fetchOptions();
    }
  }, [product.product_id]);

  const getOptionIcon = (name: string) => {
    const lower = name.toLowerCase();

    if (lower.includes("cup")) return <CupSoda size={16} />;
    if (lower.includes("sweet")) return <Candy size={16} />;
    if (lower.includes("ice")) return <Snowflake size={16} />;
    if (lower.includes("espresso")) return <Coffee size={16} />;
    if (lower.includes("dairy") || lower.includes("milk"))
      return <Milk size={16} />;
    if (lower.includes("syrup")) return <Droplet size={16} />;
    if (lower.includes("topping")) return <Sparkles size={16} />;

    return <Coffee size={16} />;
  };

  useEffect(() => {
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  // presentational only
  const brandInfo = brands.find((b) => b.id === product.brand);
  const hasDiscount = product.price.original > product.price.selling;
  const unitSaving = hasDiscount
    ? product.price.original - product.price.selling
    : 0;
  const discountPercent = hasDiscount
    ? Math.round((unitSaving / product.price.original) * 100)
    : 0;
  const canAdd = isValid();

  return (
    <div
      onClick={handleClose}
      className={`fixed inset-0 z-50 flex items-stretch justify-center bg-ink/40 backdrop-blur-sm transition-opacity duration-200 md:items-center md:p-6 ${
        show ? "opacity-100" : "opacity-0"
      }`}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-modal-title"
        aria-describedby="product-modal-description"
        aria-busy={loadingOptions}
        className={`relative flex h-dvh w-full flex-col overflow-hidden bg-screen transition-all duration-200 md:h-[min(760px,92dvh)] md:max-w-4xl md:rounded-[32px] md:shadow-2xl ${
          show ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
        }`}
      >
        {/* ===== TOP BAR ===== */}
        <header className="flex shrink-0 items-center justify-between px-4 pb-2 pt-4 md:px-6 md:pt-5">
          <button
            type="button"
            onClick={handleClose}
            className="grid size-11 place-items-center rounded-full bg-surface text-ink shadow-card transition hover:bg-primary-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-label="Kembali"
          >
            <ChevronLeft size={20} strokeWidth={2} />
          </button>
          <p className="text-base font-semibold tracking-[-0.01em] text-ink">
            Detail
          </p>
          <span className="size-11" aria-hidden="true" />
        </header>

        {/* ===== BODY ===== */}
        <div className="min-h-0 flex-1 overflow-y-auto md:grid md:grid-cols-2 md:grid-rows-[minmax(0,1fr)] md:gap-6 md:overflow-hidden md:px-6 md:pb-6">
          {/* IMAGE */}
          <div className="px-4 pt-2 md:h-full md:px-0 md:pt-0">
            <div className="relative aspect-square w-full overflow-hidden rounded-[28px] bg-surface-alt md:aspect-auto md:h-full">
              <img
                src={product.image}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            </div>
          </div>

          {/* INFO */}
          <div className="px-4 pb-6 pt-5 md:overflow-y-auto md:px-1 md:pb-28 md:pt-1">
            <p className="text-xs font-medium text-muted">{product.category}</p>

            <h2
              id="product-modal-title"
              className="mt-1 text-xl font-bold leading-7 tracking-[-0.02em] text-ink"
            >
              {product.name}
            </h2>

            <div className="mt-1.5 flex flex-wrap items-baseline gap-2 tabular-nums">
              <span className="text-lg font-bold text-ink">
                Rp {product.price.selling.toLocaleString("id-ID")}
              </span>

              {hasDiscount && (
                <span className="text-xs text-muted line-through">
                  Rp {product.price.original.toLocaleString("id-ID")}
                </span>
              )}
            </div>

            {/* PROMO TICKET */}
            {hasDiscount ? (
              <div className="relative mt-4 flex overflow-hidden rounded-[22px] bg-primary-light">
                {/* discount stub */}
                <div className="flex w-[84px] shrink-0 flex-col items-center justify-center bg-primary py-3 text-on-primary">
                  <TicketPercent size={18} strokeWidth={2} aria-hidden="true" />
                  <span className="mt-1 text-[22px] font-extrabold leading-7 tracking-[-0.02em] tabular-nums">
                    {discountPercent}%
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-[0.16em]">
                    Off
                  </span>
                </div>

                {/* perforation */}
                <div
                  className="relative w-0 border-l-2 border-dashed border-primary-dark/40"
                  aria-hidden="true"
                >
                  <span className="absolute -left-[9px] -top-2 size-4 rounded-full bg-screen" />
                  <span className="absolute -bottom-2 -left-[9px] size-4 rounded-full bg-screen" />
                </div>

                {/* savings detail */}
                <div className="flex min-w-0 flex-1 items-center justify-between gap-2 py-3 pl-4 pr-3">
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold text-primary-strong">
                      Kamu hemat
                    </p>
                    <p className="text-lg font-extrabold leading-6 tracking-[-0.01em] text-ink tabular-nums">
                      Rp {(unitSaving * qty).toLocaleString("id-ID")}
                    </p>
                    <p className="truncate text-[11px] text-secondary tabular-nums">
                      {qty > 1
                        ? `${qty} item × Rp ${unitSaving.toLocaleString("id-ID")}`
                        : `dari harga normal Rp ${product.price.original.toLocaleString("id-ID")}`}
                    </p>
                  </div>

                  {brandInfo && (
                    <span className="grid h-10 w-12 shrink-0 place-items-center rounded-xl bg-surface p-1.5">
                      <img
                        src={brandInfo.logo}
                        alt={brandInfo.name}
                        className="max-h-full w-full object-contain"
                      />
                    </span>
                  )}
                </div>
              </div>
            ) : (
              brandInfo && (
                <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-surface py-1.5 pl-1.5 pr-3.5 shadow-card">
                  <span className="grid h-7 w-9 place-items-center rounded-full bg-surface-alt p-1">
                    <img
                      src={brandInfo.logo}
                      alt=""
                      className="max-h-full w-full object-contain"
                    />
                  </span>
                  <span className="text-xs font-semibold text-ink">
                    Menu {brandInfo.name}
                  </span>
                </div>
              )
            )}

            {/* OPTIONS */}
            {loadingOptions && options.length === 0 && (
              <div className="mt-6 space-y-3" aria-hidden="true">
                <div className="h-3 w-24 animate-pulse rounded-full bg-surface-alt" />
                <div className="flex gap-2">
                  <div className="h-10 w-16 animate-pulse rounded-xl bg-surface-alt" />
                  <div className="h-10 w-20 animate-pulse rounded-xl bg-surface-alt" />
                  <div className="h-10 w-16 animate-pulse rounded-xl bg-surface-alt" />
                </div>
              </div>
            )}

            {options.map((opt, index) => (
              <div key={`${opt.name}-${opt.value}-${index}`} className="mt-5">
                <div className="mb-2.5 flex items-center justify-between gap-3">
                  <p className="flex min-w-0 items-center gap-1.5 text-xs font-medium text-secondary">
                    <span className="shrink-0 text-muted">
                      {getOptionIcon(opt.name)}
                    </span>
                    <span className="truncate">{opt.name}</span>
                  </p>
                  <span
                    className={`shrink-0 text-[10px] font-semibold uppercase tracking-wide ${
                      opt.is_required ? "text-primary-strong" : "text-muted"
                    }`}
                  >
                    {opt.is_required ? "Required" : "Optional"}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {opt.values?.map((v: any) => {
                    const selected = selectedOptions[opt.name];

                    const isSelected =
                      opt.type === "radio"
                        ? selected?.value === v.value
                        : selected?.some((x: any) => x.value === v.value);

                    return (
                      <button
                        key={`${opt.option_id}-${v.value}`}
                        type="button"
                        onClick={() => handleSelect(opt, v)}
                        role={opt.type === "radio" ? "radio" : "checkbox"}
                        aria-checked={!!isSelected}
                        className={`flex min-h-10 flex-col items-start justify-center rounded-xl px-3.5 py-2 text-left text-xs transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 ${
                          isSelected
                            ? "bg-primary font-bold text-on-primary shadow-primary"
                            : "bg-surface-alt font-medium text-ink hover:bg-[#e8e8e8]"
                        }`}
                      >
                        <span>{v.value}</span>
                        {v.price > 0 && (
                          <span
                            className={`mt-0.5 text-[10px] tabular-nums ${
                              isSelected
                                ? "font-semibold text-ink/70"
                                : "text-muted"
                            }`}
                          >
                            +Rp {v.price.toLocaleString("id-ID")}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* QTY */}
            <div className="mt-6 flex items-center justify-between gap-4">
              <p className="text-xs font-medium text-secondary">Jumlah</p>
              <div className="flex items-center rounded-xl border border-border-subtle bg-surface p-1 tabular-nums">
                <button
                  type="button"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="grid size-8 place-items-center rounded-lg text-base font-semibold text-secondary transition hover:bg-surface-alt focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  aria-label="Kurangi jumlah"
                >
                  −
                </button>
                <span
                  className="w-9 text-center text-sm font-bold text-ink"
                  aria-live="polite"
                >
                  {qty}
                </span>
                <button
                  type="button"
                  onClick={() => setQty((q) => q + 1)}
                  className="grid size-8 place-items-center rounded-lg bg-ink text-base font-semibold text-white transition hover:bg-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  aria-label="Tambah jumlah"
                >
                  +
                </button>
              </div>
            </div>

            {/* DESCRIPTION */}
            <div className="mt-6">
              <p className="text-xs font-medium text-secondary">Deskripsi</p>
              <p
                id="product-modal-description"
                className="mt-1.5 text-[13px] leading-5 text-secondary"
              >
                {product.desc}
              </p>
            </div>
          </div>
        </div>

        {/* ===== BOTTOM BAR ===== */}
        <div className="shrink-0 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-2 md:absolute md:bottom-6 md:right-6 md:w-[calc(50%-36px)] md:p-0">
          <div className="flex items-center justify-between gap-3 rounded-full bg-surface py-2 pl-6 pr-2 shadow-float">
            <div className="min-w-0">
              <p className="text-[11px] leading-4 text-muted">Total harga</p>
              <p className="truncate text-lg font-bold leading-6 text-ink tabular-nums">
                Rp {getTotalPrice().toLocaleString("id-ID")}
              </p>
            </div>

            <button
              type="button"
              disabled={!isValid()}
              onClick={() => {
                addToCart(
                  {
                    ...product,
                    options: formatOptionsForCart(),
                  },
                  qty,
                );
                onSuccess?.();
              }}
              className="flex h-12 shrink-0 items-center gap-2 rounded-full bg-primary px-5 text-sm font-bold text-on-primary shadow-primary transition hover:bg-primary-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-surface-alt disabled:text-muted disabled:shadow-none"
              title={canAdd ? undefined : "Lengkapi pilihan yang wajib"}
            >
              <ShoppingBag size={18} strokeWidth={2} />
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
