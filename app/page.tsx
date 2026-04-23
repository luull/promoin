/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BrandSelector } from "./components/BrandSelector";
import { BrandKey } from "./types/products";
import { ProductSection } from "./components/ProductSection";
import { ShoppingCart } from "lucide-react";
import { CartDrawer } from "./components/CardDrawer";

import dynamic from "next/dynamic";

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
    <main className="min-h-screen bg-[#f5f7fb]">
      {/* ================= HERO ================= */}
      <section className="relative px-6 pt-16 pb-20 max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          {/* LEFT */}
          <div className="z-10">
            <p className="text-sm text-green-600 font-medium mb-3">NIKMATI</p>

            <h1 className="text-5xl font-bold leading-tight">
              <span className="text-green-600">Hemat 30%</span> untuk Setiap
              Pembelian <span className="text-green-600">Kopi.</span>
            </h1>

            <p className="text-gray-500 mt-4 max-w-md">
              Temukan berbagai brand pilihan, pesan menu favoritmu, dan rasakan
              kemudahan order hanya dalam beberapa klik.
            </p>

            <Link href="#brand">
              <button className="mt-6 bg-green-600 text-white px-6 py-3 rounded-full hover:bg-green-700 transition">
                Belanja →
              </button>
            </Link>
          </div>

          {/* RIGHT */}
          <div className="relative h-[420px] w-full">
            <div className="absolute right-0 top-0 w-[90%] h-full bg-green-500 rounded-bl-[160px]" />
            <div className="max-w-6xl mx-auto bg-blue px-6 py-3 flex justify-end">
              <button
                className="
    relative
    bg-white/20
    backdrop-blur-lg
    border border-white/30
    p-3
    rounded-full
    shadow-lg
    hover:scale-110
    hover:bg-white/30
    transition
  "
                onClick={() => setOpenCart(true)}
              >
                <ShoppingCart className="text-white" size={24} />

                <CartBadge count={cartCount} />
              </button>
            </div>
            <img
              src="/hero.png"
              className="absolute right-10 bottom-0 w-[940px] object-contain z-10"
            />

            <div className="absolute left-0 bottom-0 w-[240px] h-[140px] bg-gray-200 rounded-tr-[120px]" />
          </div>
        </div>
      </section>

      {/* ================= BRAND SELECTOR ================= */}
      <div id="brand">
        <BrandSelector onChange={setBrand} />
      </div>

      {/* ================= PRODUCTS ================= */}
      <ProductSection brand={brand} onOpenCart={() => setOpenCart(true)} />
      <CartDrawer open={openCart} onClose={() => setOpenCart(false)} />
    </main>
  );
}
