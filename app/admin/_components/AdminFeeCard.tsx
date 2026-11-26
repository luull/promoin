"use client";

import { FormEvent, useState } from "react";
import { HandCoins, LoaderCircle } from "lucide-react";
import { AdminAuthError, adminUpdateStoreSettings } from "../../lib/admin";
import {
  DEFAULT_ADMIN_FEE,
  MAX_ADMIN_FEE,
  StoreSettings,
  clearStoreSettingsCache,
} from "../../lib/storeSettings";
import { formatRupiah } from "./format";

const PRESETS = [0, 2000, 3000, 5000, 10000];
const SAMPLE_SUBTOTAL = 50_000;

function parseFee(draft: string): number | "invalid" {
  const value = draft.trim();
  if (!/^\d{1,6}$/.test(value)) return "invalid";

  const parsed = Number(value);
  return parsed <= MAX_ADMIN_FEE ? parsed : "invalid";
}

export function AdminFeeCard({
  token,
  settings,
  loading,
  onSaved,
  onSessionExpired,
}: {
  token: string;
  settings: StoreSettings | null;
  loading: boolean;
  onSaved: (settings: StoreSettings) => void;
  onSessionExpired: () => void;
}) {
  const savedFee = settings?.admin_fee ?? DEFAULT_ADMIN_FEE;

  const [draft, setDraft] = useState(String(savedFee));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [savedNotice, setSavedNotice] = useState(false);

  const parsed = parseFee(draft);
  const dirty = parsed !== "invalid" && parsed !== savedFee;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (parsed === "invalid") {
      setError(
        `Fee harus angka bulat 0 sampai ${formatRupiah(MAX_ADMIN_FEE)}.`,
      );
      return;
    }

    setSaving(true);
    setError("");
    setSavedNotice(false);

    try {
      const saved = await adminUpdateStoreSettings(token, parsed);
      clearStoreSettingsCache();
      setSavedNotice(true);
      onSaved(saved);
    } catch (saveError) {
      if (saveError instanceof AdminAuthError) {
        onSessionExpired();
        return;
      }
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Fee gagal disimpan.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <article className="rounded-[24px] bg-surface p-4 shadow-card">
      <div className="flex items-center gap-3">
        <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-primary-light text-primary-strong">
          <HandCoins size={22} strokeWidth={1.8} />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-bold text-ink">Fee admin per pesanan</h3>
          <p className="mt-0.5 text-[11px] text-muted">
            Ditambahkan ke total setiap pesanan baru.
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-[10px] font-medium text-muted">Saat ini</p>
          {loading ? (
            <span className="mt-1 block h-5 w-16 animate-pulse rounded-full bg-surface-alt" />
          ) : (
            <p className="text-base font-bold text-ink tabular-nums">
              {formatRupiah(savedFee)}
            </p>
          )}
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mt-4 border-t border-dashed border-border-subtle pt-4"
        noValidate
      >
        <label
          htmlFor="admin-fee"
          className="mb-2 block text-xs font-medium text-secondary"
        >
          Fee baru
        </label>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-muted">
              Rp
            </span>
            <input
              id="admin-fee"
              inputMode="numeric"
              value={draft}
              onChange={(event) => {
                setDraft(event.target.value.replace(/[^\d]/g, "").slice(0, 6));
                setError("");
                setSavedNotice(false);
              }}
              placeholder="5000"
              disabled={loading}
              className="h-11 w-full rounded-full border border-border-subtle bg-surface pl-11 pr-4 text-sm font-semibold text-ink outline-none transition placeholder:font-normal placeholder:text-muted focus:border-primary focus:ring-4 focus:ring-primary/20 disabled:bg-surface-alt tabular-nums"
              aria-describedby="admin-fee-help"
            />
          </div>

          <button
            type="submit"
            disabled={!dirty || saving || loading}
            className="flex h-11 shrink-0 items-center gap-1.5 rounded-full bg-ink px-5 text-xs font-bold text-white transition hover:bg-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-surface-alt disabled:text-muted"
          >
            {saving && <LoaderCircle size={14} className="animate-spin" />}
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
                  setSavedNotice(false);
                }}
                aria-pressed={active}
                className={`h-8 shrink-0 rounded-full px-3 text-[11px] font-semibold transition tabular-nums focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                  active
                    ? "bg-primary text-on-primary"
                    : "bg-surface-alt text-secondary hover:bg-[#e8e8e8]"
                }`}
              >
                {value === 0 ? "Gratis" : formatRupiah(value)}
              </button>
            );
          })}
        </div>

        <p
          id="admin-fee-help"
          className="mt-2 text-[11px] leading-4 text-muted tabular-nums"
        >
          {parsed === "invalid"
            ? `Isi angka 0 sampai ${formatRupiah(MAX_ADMIN_FEE)}.`
            : `Contoh: pesanan ${formatRupiah(SAMPLE_SUBTOTAL)} → pembeli bayar ${formatRupiah(SAMPLE_SUBTOTAL + parsed)}.`}{" "}
          Pesanan yang sudah masuk tetap memakai fee lamanya.
        </p>

        {error && (
          <p role="alert" className="mt-2 text-xs text-red-600">
            {error}
          </p>
        )}
        {savedNotice && !error && (
          <p role="status" className="mt-2 text-xs font-medium text-primary-strong">
            Fee tersimpan. Berlaku untuk pesanan berikutnya.
          </p>
        )}
      </form>
    </article>
  );
}
