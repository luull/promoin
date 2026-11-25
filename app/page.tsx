/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { ArrowUpRight, Coffee, House, ShoppingBag, Store } from "lucide-react";
import dynamic from "next/dynamic";
import { BrandSelector } from "./components/BrandSelector";
import { CartDrawer } from "./components/CardDrawer";
import { ProductSection } from "./components/ProductSection";
import { BrandKey } from "./types/products";

const CartBadge = dynamic(
  () => import("./components/CartBadge").then((m) => m.CartBadge),
  { ssr: false },
);

export default function Home() {
  const [brand, setBrand] = useState<BrandKey>("fore");
  const [openCart, setOpenCart] = useState(false);
  const [cartCount, setCartCount] = useState(() => {
    if (typeof window === "undefined") return 0;

    const cart = JSON.parse(localStorage.getItem("cart") || "[]");

    return cart.reduce((acc: number, item: any) => acc + item.qty, 0);
  });

  useEffect(() => {
    const handler = () => {
      const cart = JSON.parse(localStorage.getItem("cart") || "[]");

      const total = cart.reduce((acc: number, item: any) => acc + item.qty, 0);

      setCartCount(total);
    };

    window.addEventListener("cart:update", handler);
    return () => window.removeEventListener("cart:update", handler);
  }, []);

  return (
    <main
      id="top"
      className="min-h-screen bg-screen pb-28 text-ink md:pb-12"
    >
      {/* ================= HEADER ================= */}
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 pt-4 md:pt-6">
        <div className="flex items-center gap-3">
          <span
            className="grid size-11 place-items-center rounded-full bg-surface text-ink shadow-card"
            aria-hidden="true"
          >
            <Coffee size={20} strokeWidth={1.8} />
          </span>
          <div>
            <p className="text-[11px] font-medium leading-4 text-muted">
              Pesan minuman lebih hemat
            </p>
            <p className="text-base font-bold leading-5 tracking-[-0.01em]">
              Promoin
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setOpenCart(true)}
          className="relative grid size-11 place-items-center rounded-full bg-surface text-ink shadow-card transition hover:bg-primary-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-screen"
          aria-label="Buka keranjang"
        >
          <ShoppingBag size={20} strokeWidth={1.8} />
          <CartBadge count={cartCount} />
        </button>
      </header>

      {/* ================= HERO ================= */}
      <section className="mx-auto max-w-6xl px-4 pt-5">
        <div className="relative h-[182px] overflow-hidden rounded-[24px] bg-primary sm:h-[200px] md:h-[300px] md:rounded-[32px]">
          {/* decorative swirls */}
          <div
            className="absolute -bottom-50 -left-12 size-48 rounded-full border-[22px] border-white/40 md:size-80 md:border-[40px]"
            aria-hidden="true"
          />
          <div
            className="absolute -top-50 left-[48%] size-40 rounded-full border-[18px] border-white/25 md:size-72 md:border-[100px]"
            aria-hidden="true"
          />

          <div className="relative z-20 flex h-full max-w-[70%] flex-col items-start justify-center px-5 md:max-w-[80%] md:px-12">
            <span className="rounded-full bg-ink px-2.5 py-1 text-[10px] font-semibold tracking-wide text-white md:text-xs">
              NIKMATI PROMO
            </span>

            <h1 className="mt-2.5 text-[17px] font-bold leading-[1.3] tracking-[-0.01em] text-on-primary sm:text-xl md:mt-4 md:text-4xl md:leading-[1.15]">
              Hemat 30% ++ untuk Setiap Pembelian Minuman atau Makanan.
            </h1>

            <p className="mt-3 hidden max-w-md text-sm leading-6 text-ink/70 md:block">
              Temukan berbagai brand pilihan, pesan menu favoritmu, dan rasakan
              kemudahan order hanya dalam beberapa klik.
            </p>

            <a
              href="#brand"
              className="mt-3.5 inline-flex h-10 items-center gap-3 rounded-full bg-ink pl-4 pr-1 text-sm font-semibold text-white transition hover:bg-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-primary md:mt-6 md:h-12 md:pl-5"
            >
              Belanja
              <span className="grid size-8 place-items-center rounded-full bg-white text-ink md:size-10">
                <ArrowUpRight size={16} strokeWidth={2} />
              </span>
            </a>
          </div>

          <img
            src="/hero.png"
            alt="Ilustrasi promo Promoin"
            className="absolute bottom-0 right-0 z-10 h-full w-1/2 object-cover object-right md:w-[22%] md:object-[100%_20%]"
          />
                <div
            className="absolute -top-16 left-[78%] size-40 rounded-full border-[18px] border-white/25 md:size-72 md:border-[80px]"
            aria-hidden="true"
          />
        </div>
      </section>

      {/* ================= BRAND SELECTOR ================= */}
      <div id="brand" className="scroll-mt-4">
        <BrandSelector onChange={setBrand} />
      </div>

      {/* ================= PRODUCTS ================= */}
      <ProductSection brand={brand} onOpenCart={() => setOpenCart(true)} />
      <CartDrawer open={openCart} onClose={() => setOpenCart(false)} />

      {/* ================= BOTTOM NAV (MOBILE) ================= */}
      <nav
        aria-label="Navigasi utama"
        className="fixed inset-x-4 bottom-[max(1rem,env(safe-area-inset-bottom))] z-40 mx-auto flex h-16 max-w-md items-center justify-around rounded-full bg-surface px-2 shadow-float md:hidden"
      >
        <a
          href="#top"
          aria-current="page"
          className="flex h-12 items-center gap-2 rounded-full bg-primary-light py-1.5 pl-1.5 pr-4 text-sm font-semibold text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <span className="grid size-9 place-items-center rounded-full bg-primary text-on-primary">
            <House size={18} strokeWidth={1.9} />
          </span>
          Beranda
        </a>

        <a
          href="#brand"
          className="grid size-12 place-items-center rounded-full text-secondary transition hover:bg-surface-alt hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          aria-label="Pilih brand"
        >
          <Store size={22} strokeWidth={1.7} />
        </a>

        <button
          type="button"
          onClick={() => setOpenCart(true)}
          className="relative grid size-12 place-items-center rounded-full text-secondary transition hover:bg-surface-alt hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          aria-label="Buka keranjang"
        >
          <span className="relative">
            <ShoppingBag size={22} strokeWidth={1.7} />
            <CartBadge count={cartCount} />
          </span>
        </button>
      </nav>
    </main>
  );
}
