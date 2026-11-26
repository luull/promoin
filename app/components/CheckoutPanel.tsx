"use client";

import {
  Check,
  ChevronLeft,
  ChevronRight,
  LoaderCircle,
  MessageCircle,
  ShieldCheck,
  Store,
} from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import { CartItem } from "../types/cart";
import { Outlet } from "../types/outlets";
import { BrandKey, brands } from "../types/products";
import { OutletPicker } from "./OutletPicker";

export type CheckoutDetails = {
  name: string;
  outlets: Partial<Record<BrandKey, Outlet>>;
};

function isBrandKey(value: string): value is BrandKey {
  return brands.some((brand) => brand.id === value);
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

export function CheckoutPanel({
  cart,
  total,
  onBack,
  onCheckout,
}: {
  cart: CartItem[];
  total: number;
  onBack: () => void;
  onCheckout: (details: CheckoutDetails) => void | Promise<void>;
}) {
  const [name, setName] = useState("");
  const [selectedOutlets, setSelectedOutlets] = useState<
    Partial<Record<BrandKey, Outlet>>
  >({});
  const [pickerBrand, setPickerBrand] = useState<BrandKey | null>(null);
  const [showValidation, setShowValidation] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const cartBrands = useMemo(
    () =>
      Array.from(new Set(cart.map((item) => item.brand).filter(isBrandKey))),
    [cart],
  );

  const missingOutlet = cartBrands.some((brand) => !selectedOutlets[brand]);
  const canCheckout = name.trim().length >= 2 && !missingOutlet;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setShowValidation(true);

    if (!canCheckout || submitting) return;

    setSubmitError("");
    setSubmitting(true);

    try {
      // Dipanggil sinkron di event submit agar tab WhatsApp tidak diblokir browser.
      await onCheckout({
        name: name.trim(),
        outlets: selectedOutlets,
      });
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Pesanan belum bisa diproses. Coba lagi.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section
      className="absolute inset-0 z-20 flex min-h-0 w-full max-w-full touch-pan-y flex-col overflow-hidden overscroll-none bg-screen"
      aria-labelledby="checkout-title"
    >
      <header className="flex shrink-0 items-center justify-between px-4 pb-3 pt-4">
        <button
          type="button"
          onClick={onBack}
          className="grid size-11 shrink-0 place-items-center rounded-full bg-surface text-ink shadow-card transition hover:bg-primary-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          aria-label="Kembali ke keranjang"
        >
          <ChevronLeft size={20} strokeWidth={2} />
        </button>
        <div className="text-center">
          <h2
            id="checkout-title"
            className="text-base font-semibold tracking-[-0.01em] text-ink"
          >
            Detail pengambilan
          </h2>
          <p className="text-[11px] font-medium text-muted">Langkah 2 dari 2</p>
        </div>
        <span className="size-11" aria-hidden="true" />
      </header>

      <form
        onSubmit={handleSubmit}
        className="flex min-h-0 w-full max-w-full flex-1 flex-col overflow-hidden"
      >
        <div className="min-h-0 w-full max-w-full flex-1 touch-pan-y space-y-6 overflow-x-hidden overflow-y-auto overscroll-x-none px-4 pb-6 pt-2">
          <div className="relative overflow-hidden rounded-[24px] bg-primary p-4">
            <div
              className="absolute -right-8 -top-10 size-32 rounded-full border-[16px] border-white/25"
              aria-hidden="true"
            />
            <div className="relative flex gap-3">
              <div className="grid size-10 shrink-0 place-items-center rounded-full bg-ink text-white">
                <Store size={18} strokeWidth={1.8} />
              </div>
              <div>
                <p className="text-sm font-bold text-on-primary">
                  Pilih outlet pengambilan
                </p>
                <p className="mt-1 text-xs leading-5 text-ink/70">
                  Setiap brand di keranjang memerlukan outletnya sendiri.
                  Gunakan pencarian untuk menemukan outlet yang diinginkan.
                </p>
              </div>
            </div>
          </div>

          <div>
            <label
              htmlFor="customer-name"
              className="mb-2 block text-xs font-medium text-secondary"
            >
              Nama pemesan
            </label>
            <input
              id="customer-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Masukkan nama kamu"
              autoComplete="name"
              className={`h-12 w-full rounded-full border bg-surface px-5 text-sm text-ink shadow-card outline-none transition placeholder:text-muted focus:ring-4 ${
                showValidation && name.trim().length < 2
                  ? "border-red-400 focus:border-red-400 focus:ring-red-100"
                  : "border-border-subtle focus:border-primary focus:ring-primary/20"
              }`}
              aria-invalid={showValidation && name.trim().length < 2}
              aria-describedby="customer-name-error"
            />
            {showValidation && name.trim().length < 2 && (
              <p
                id="customer-name-error"
                className="mt-1.5 px-2 text-xs text-red-600"
              >
                Masukkan nama minimal 2 karakter.
              </p>
            )}
          </div>

          <div>
            <div className="mb-3 flex items-end justify-between gap-3">
              <div>
                <h3 className="text-base font-bold tracking-[-0.01em] text-ink">
                  Outlet pesanan
                </h3>
                <p className="mt-0.5 text-xs text-muted">
                  {cartBrands.length} brand dalam keranjang
                </p>
              </div>
              <span className="rounded-full bg-ink px-2.5 py-1 text-[11px] font-semibold text-white tabular-nums">
                {cartBrands.filter((brand) => selectedOutlets[brand]).length}/
                {cartBrands.length} dipilih
              </span>
            </div>

            <div className="space-y-3">
              {cartBrands.map((brandKey) => {
                const brand = brands.find((item) => item.id === brandKey);
                const outlet = selectedOutlets[brandKey];
                const area = outlet ? getOutletArea(outlet) : "";
                const invalid = showValidation && !outlet;

                return (
                  <button
                    key={brandKey}
                    type="button"
                    onClick={() => setPickerBrand(brandKey)}
                    className={`w-full rounded-[22px] border-[1.5px] bg-surface p-3 text-left shadow-card transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                      invalid
                        ? "border-red-300"
                        : outlet
                          ? "border-primary"
                          : "border-transparent hover:border-border-subtle"
                    }`}
                    aria-label={`Pilih outlet ${brand?.name ?? brandKey}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative grid h-12 w-14 shrink-0 place-items-center rounded-2xl bg-surface-alt p-1.5">
                        {brand ? (
                          <img
                            src={brand.logo}
                            alt=""
                            className="max-h-full w-full object-contain"
                          />
                        ) : (
                          <span className="text-sm font-black text-secondary">
                            {brandKey.charAt(0)}
                          </span>
                        )}
                        {outlet && (
                          <span className="absolute -right-1.5 -top-1.5 grid size-5 place-items-center rounded-full bg-primary text-on-primary ring-2 ring-surface">
                            <Check size={12} strokeWidth={3} />
                          </span>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] font-semibold text-muted">
                          {brand?.name ?? brandKey}
                        </p>
                        {outlet ? (
                          <>
                            <p className="mt-0.5 truncate text-sm font-semibold text-ink">
                              {outlet.name}
                            </p>
                            {area && (
                              <p className="mt-0.5 truncate text-xs text-muted">
                                {area}
                              </p>
                            )}
                          </>
                        ) : (
                          <p
                            className={`mt-0.5 text-sm font-semibold ${
                              invalid ? "text-red-600" : "text-primary-strong"
                            }`}
                          >
                            {invalid ? "Outlet wajib dipilih" : "Pilih outlet"}
                          </p>
                        )}
                      </div>

                      <span className="grid size-8 shrink-0 place-items-center rounded-full bg-surface-alt text-ink">
                        <ChevronRight size={16} strokeWidth={2} />
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-start gap-2 px-1 text-xs leading-5 text-muted">
            <ShieldCheck
              className="mt-0.5 shrink-0 text-primary-strong"
              size={16}
            />
            Lokasi tidak diakses. Outlet dipilih manual melalui pencarian nama,
            area, atau alamat.
          </div>
        </div>

        <footer className="shrink-0 rounded-t-[28px] bg-surface px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4 shadow-lift">
          <div className="flex items-center justify-between gap-3 rounded-full bg-surface-alt py-2 pl-5 pr-2">
            <div className="min-w-0">
              <p className="text-[11px] leading-4 text-muted">
                Total pembayaran
              </p>
              <p className="truncate text-lg font-bold leading-6 text-ink tabular-nums">
                Rp {total.toLocaleString("id-ID")}
              </p>
            </div>
            <button
              type="submit"
              disabled={submitting}
              aria-busy={submitting}
              className={`flex h-12 shrink-0 items-center justify-center gap-2 rounded-full px-5 text-sm font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 disabled:cursor-wait ${
                canCheckout
                  ? "bg-primary text-on-primary shadow-primary hover:bg-primary-dark"
                  : "bg-border-subtle text-muted"
              }`}
            >
              {submitting ? (
                <>
                  <LoaderCircle
                    size={18}
                    strokeWidth={2}
                    className="animate-spin"
                  />
                  Memproses
                </>
              ) : (
                <>
                  <MessageCircle size={18} strokeWidth={2} /> WhatsApp
                </>
              )}
            </button>
          </div>
          {submitError && (
            <p
              role="alert"
              className="mt-3 rounded-2xl bg-red-50 px-4 py-2.5 text-xs leading-5 text-red-600"
            >
              {submitError}
            </p>
          )}
          {!canCheckout && !showValidation && (
            <p className="mt-2 text-center text-[11px] text-muted">
              Isi nama dan pilih semua outlet untuk melanjutkan.
            </p>
          )}
        </footer>
      </form>

      {pickerBrand && (
        <OutletPicker
          brand={pickerBrand}
          selectedOutletId={selectedOutlets[pickerBrand]?.id}
          onClose={() => setPickerBrand(null)}
          onSelect={(outlet) => {
            setSelectedOutlets((current) => ({
              ...current,
              [pickerBrand]: outlet,
            }));
            setPickerBrand(null);
          }}
        />
      )}
    </section>
  );
}
