"use client";

import {
  ArrowUp,
  MessageCircle,
  PackageCheck,
  QrCode,
  Store,
} from "lucide-react";
import Image from "next/image";
import { ADMIN_WHATSAPP, whatsappUrl } from "../lib/contact";
import { toLocalPhone } from "../utils/phone";

const STEPS = [
  { icon: Store, label: "Pilih menu dan outlet" },
  { icon: QrCode, label: "Bayar lewat QRIS" },
  { icon: MessageCircle, label: "Konfirmasi via WhatsApp" },
  { icon: PackageCheck, label: "Ambil pesanan di outlet" },
];

const linkClass =
  "inline-flex items-center py-1 text-[13px] leading-[18px] text-secondary transition hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded";

export function SiteFooter({
  onOpenCart,
  onOpenHistory,
}: {
  onOpenCart: () => void;
  onOpenHistory: () => void;
}) {
  const year = new Date().getFullYear();

  return (
    <footer className="mx-auto mt-10 max-w-6xl px-4 md:mt-14">
      <div className="rounded-[24px] bg-surface p-5 shadow-card md:p-8">
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-[1.4fr_1fr_1fr] md:gap-x-10">
          {/* ===== BRAND & KONTAK ===== */}
          <div className="col-span-2 md:col-span-1">
            <Image
              src="/logo-pep.png"
              alt="Pepbow Beverage & Bites"
              width={1500}
              height={460}
              sizes="117px"
              className="h-9 w-auto"
            />
            <p className="mt-3 max-w-xs text-[13px] leading-[18px] text-secondary">
              Pesan minuman dan makanan dari berbagai brand dengan harga promo,
              lalu ambil langsung di outlet pilihanmu.
            </p>

            <a
              href={whatsappUrl("Halo admin, saya butuh bantuan pesanan.")}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex h-11 items-center gap-2 rounded-full border-[1.5px] border-primary pl-1.5 pr-4 text-sm font-semibold text-ink transition hover:bg-primary-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              <span className="grid size-8 place-items-center rounded-full bg-primary text-on-primary">
                <MessageCircle size={16} strokeWidth={2} />
              </span>
              <span className="flex flex-col leading-tight">
                <span className="text-[10px] font-medium text-muted">
                  Chat admin
                </span>
                <span className="tabular-nums">
                  {toLocalPhone(ADMIN_WHATSAPP)}
                </span>
              </span>
            </a>
          </div>

          {/* ===== MENU ===== */}
          <nav aria-labelledby="footer-menu-title">
            <h2
              id="footer-menu-title"
              className="text-sm font-semibold text-ink"
            >
              Menu
            </h2>
            <ul className="mt-2 space-y-0.5">
              <li>
                <a href="#top" className={linkClass}>
                  Beranda
                </a>
              </li>
              <li>
                <a href="#brand" className={linkClass}>
                  Pilih brand
                </a>
              </li>
              <li>
                <button type="button" onClick={onOpenCart} className={linkClass}>
                  Keranjang
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={onOpenHistory}
                  className={linkClass}
                >
                  Riwayat transaksi
                </button>
              </li>
            </ul>
          </nav>

          {/* ===== CARA PESAN ===== */}
          <div>
            <h2 className="text-sm font-semibold text-ink">Cara pesan</h2>
            <ol className="mt-3 space-y-2.5">
              {STEPS.map(({ icon: Icon, label }) => (
                <li
                  key={label}
                  className="flex items-start gap-2.5 text-[13px] leading-[18px] text-secondary"
                >
                  <span className="grid size-7 shrink-0 place-items-center rounded-full bg-primary-light text-primary-strong">
                    <Icon size={14} strokeWidth={2} aria-hidden="true" />
                  </span>
                  <span className="pt-[5px]">{label}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>

        {/* ===== BAWAH ===== */}
        <div className="mt-8 flex items-center justify-between gap-3 border-t border-dashed border-border-subtle pt-4">
          <p className="text-xs font-medium text-muted">
            © {year} Pepbow Beverage &amp; Bites
          </p>
          <a
            href="#top"
            className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full bg-surface-alt px-3.5 text-xs font-semibold text-ink transition hover:bg-primary-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <ArrowUp size={14} strokeWidth={2} />
            Ke atas
          </a>
        </div>
      </div>
    </footer>
  );
}
