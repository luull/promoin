"use client";

import { FormEvent, useState } from "react";
import { Eye, EyeOff, LoaderCircle } from "lucide-react";
import {
  AdminAuthError,
  DashboardBrandRow,
  adminUpdateBrand,
} from "../../lib/admin";
import {
  BrandSetting,
  applyBrandPrice,
  clearBrandSettingsCache,
} from "../../lib/brandSettings";
import { BrandKey } from "../../types/products";
import { formatRupiah } from "./format";

const PRESETS = [10, 20, 30, 40, 50];
const SAMPLE_PRICE = 50_000;

function parseDiscount(draft: string): number | null | "invalid" {
  const value = draft.trim();
  if (value === "") return null;
  if (!/^\d{1,2}$/.test(value)) return "invalid";

  const parsed = Number(value);
  return parsed >= 0 && parsed <= 90 ? parsed : "invalid";
}

export function BrandSettingCard({
  token,
  brand,
  setting,
  sales,
  loading,
  onSaved,
  onSessionExpired,
}: {
  token: string;
  brand: { id: BrandKey; name: string; logo: string };
  setting?: BrandSetting;
  sales?: DashboardBrandRow;
  loading: boolean;
  onSaved: (setting: BrandSetting) => void;
  onSessionExpired: () => void;
}) {
  const savedVisible = setting?.is_visible ?? true;
  const savedDiscount = setting?.discount_percent ?? null;

  const [draft, setDraft] = useState(
    savedDiscount === null ? "" : String(savedDiscount),
  );
  const [savingVisible, setSavingVisible] = useState(false);
  const [savingDiscount, setSavingDiscount] = useState(false);
  const [error, setError] = useState("");

  const parsedDraft = parseDiscount(draft);
  const dirty = parsedDraft !== "invalid" && parsedDraft !== savedDiscount;

  async function save(isVisible: boolean, discount: number | null) {
    setError("");

    try {
      const saved = await adminUpdateBrand(token, brand.id, isVisible, discount);
      clearBrandSettingsCache();
      onSaved(saved);
    } catch (saveError) {
      if (saveError instanceof AdminAuthError) {
        onSessionExpired();
        return;
      }
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Pengaturan gagal disimpan.",
      );
    }
  }

  async function toggleVisible() {
    setSavingVisible(true);
    await save(!savedVisible, savedDiscount);
    setSavingVisible(false);
  }

  async function handleDiscountSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (parsedDraft === "invalid") {
      setError("Diskon harus angka bulat 0 sampai 90.");
      return;
    }

    setSavingDiscount(true);
    await save(savedVisible, parsedDraft);
    setSavingDiscount(false);
  }

  const preview =
    parsedDraft === "invalid" || parsedDraft === null
      ? null
      : applyBrandPrice(
          { original: SAMPLE_PRICE, selling: SAMPLE_PRICE },
          parsedDraft,
        ).selling;

  const discountLabel =
    savedDiscount === null
      ? "Harga database"
      : savedDiscount === 0
        ? "Tanpa diskon"
        : `Diskon ${savedDiscount}%`;

  return (
    <article
      className={`rounded-[24px] bg-surface p-4 shadow-card transition ${
        savedVisible ? "" : "opacity-90"
      }`}
    >
      {/* ===== HEAD ===== */}
      <div className="flex items-center gap-3">
        <span
          className={`grid h-12 w-16 shrink-0 place-items-center rounded-2xl bg-surface-alt p-2 ${
            savedVisible ? "" : "grayscale"
          }`}
        >
          <img
            src={brand.logo}
            alt=""
            className="max-h-full w-full object-contain"
          />
        </span>

        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-bold text-ink">{brand.name}</h3>
          <p className="mt-0.5 flex items-center gap-1.5 text-[11px] text-muted">
            {savedVisible ? (
              <Eye size={12} strokeWidth={2} />
            ) : (
              <EyeOff size={12} strokeWidth={2} />
            )}
            {savedVisible ? "Tampil di toko" : "Disembunyikan"} ·{" "}
            {discountLabel}
          </p>
        </div>

        <button
          type="button"
          role="switch"
          aria-checked={savedVisible}
          aria-label={`Tampilkan ${brand.name} di toko`}
          onClick={toggleVisible}
          disabled={savingVisible}
          className={`relative h-8 w-14 shrink-0 rounded-full transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 disabled:cursor-wait ${
            savedVisible ? "bg-primary" : "bg-border-subtle"
          }`}
        >
          <span
            className={`absolute top-1 grid size-6 place-items-center rounded-full bg-white shadow-sm transition-all ${
              savedVisible ? "left-7" : "left-1"
            }`}
          >
            {savingVisible && (
              <LoaderCircle size={12} className="animate-spin text-secondary" />
            )}
          </span>
        </button>
      </div>

      {/* ===== SALES ===== */}
      <dl className="mt-4 grid grid-cols-3 gap-2 rounded-2xl bg-surface-alt p-3 text-center tabular-nums">
        {[
          { label: "Pesanan", value: Number(sales?.paid_orders ?? 0) },
          { label: "Cup", value: Number(sales?.cups ?? 0) },
          { label: "Omzet", value: formatRupiah(Number(sales?.revenue ?? 0)) },
        ].map((item) => (
          <div key={item.label} className="min-w-0">
            <dt className="text-[10px] font-medium text-muted">{item.label}</dt>
            <dd className="mt-0.5 truncate text-sm font-bold text-ink">
              {loading ? (
                <span className="mx-auto block h-4 w-10 animate-pulse rounded-full bg-border-subtle" />
              ) : (
                item.value
              )}
            </dd>
          </div>
        ))}
      </dl>

      {/* ===== DISCOUNT ===== */}
      <form onSubmit={handleDiscountSubmit} className="mt-4" noValidate>
        <label
          htmlFor={`discount-${brand.id}`}
          className="mb-2 block text-xs font-medium text-secondary"
        >
          Diskon brand
        </label>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              id={`discount-${brand.id}`}
              inputMode="numeric"
              value={draft}
              onChange={(event) => {
                setDraft(event.target.value.replace(/[^\d]/g, "").slice(0, 2));
                setError("");
              }}
              placeholder="Harga database"
              className="h-11 w-full rounded-full border border-border-subtle bg-surface pl-4 pr-9 text-sm font-semibold text-ink outline-none transition placeholder:font-normal placeholder:text-muted focus:border-primary focus:ring-4 focus:ring-primary/20 tabular-nums"
              aria-describedby={`discount-help-${brand.id}`}
            />
            <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-muted">
              %
            </span>
          </div>

          <button
            type="submit"
            disabled={!dirty || savingDiscount}
            className="flex h-11 shrink-0 items-center gap-1.5 rounded-full bg-ink px-5 text-xs font-bold text-white transition hover:bg-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-surface-alt disabled:text-muted"
          >
            {savingDiscount && (
              <LoaderCircle size={14} className="animate-spin" />
            )}
            Simpan
          </button>
        </div>

        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {PRESETS.map((value) => {
            const active = draft === String(value);

            return (
              <button
                key={value}
                type="button"
                onClick={() => {
                  setDraft(String(value));
                  setError("");
                }}
                aria-pressed={active}
                className={`h-8 shrink-0 rounded-full px-3 text-[11px] font-semibold transition tabular-nums focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                  active
                    ? "bg-primary text-on-primary"
                    : "bg-surface-alt text-secondary hover:bg-[#e8e8e8]"
                }`}
              >
                {value}%
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => {
              setDraft("");
              setError("");
            }}
            aria-pressed={draft === ""}
            className={`h-8 shrink-0 rounded-full px-3 text-[11px] font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
              draft === ""
                ? "bg-primary text-on-primary"
                : "bg-surface-alt text-secondary hover:bg-[#e8e8e8]"
            }`}
          >
            Harga DB
          </button>
        </div>

        <p
          id={`discount-help-${brand.id}`}
          className="mt-2 text-[11px] leading-4 text-muted tabular-nums"
        >
          {preview !== null
            ? `Contoh: ${formatRupiah(SAMPLE_PRICE)} → ${formatRupiah(preview)} (dibulatkan ke Rp 500)`
            : "Kosongkan untuk memakai harga jual dari database."}
        </p>

        {error && (
          <p role="alert" className="mt-2 text-xs text-red-600">
            {error}
          </p>
        )}
      </form>
    </article>
  );
}
