/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { PlusCircle, X } from "lucide-react";
import { CartItem } from "../types/cart";
import { getCart, removeFromCart } from "../utils/cart";
import { useEffect, useState } from "react";

export function CartDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [refresh, setRefresh] = useState(0);
  const cart: CartItem[] = open ? getCart() : [];

  const getOptionTotal = (item: any) => {
    if (!item.options) return 0;
    return item.options.reduce(
      (acc: number, opt: any) => acc + (opt.price || 0),
      0,
    );
  };

  // 🔥 LOCK SCROLL BACKGROUND
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // ===== PRICING =====
  const subtotalOriginal = cart.reduce((acc, item) => {
    const optionTotal = getOptionTotal(item);
    return acc + (item.price.original + optionTotal) * item.qty;
  }, 0);

  const subtotalPromo = cart.reduce((acc, item) => {
    const optionTotal = getOptionTotal(item);
    return acc + (item.price.selling + optionTotal) * item.qty;
  }, 0);

  const totalSavings = subtotalOriginal - subtotalPromo;
  const adminFee = 5000;
  const grandTotal = subtotalPromo + adminFee;

  const safeCart = cart.map((item, index) => ({
    ...item,
    cartId: item.cartId ?? `${item.id}-${index}`,
  }));

  const generateWhatsAppMessage = (cart: any[], user: any) => {
    let text = `🧾 *INVOICE PESANAN - PROMOIN*\n`;
    text += `━━━━━━━━━━━━━━━━━━\n\n`;

    text += `👤 *Nama:* ${user.name}\n`;
    text += `🏪 *Outlet:* ${user.outlet}\n\n`;

    text += `━━━━━━━━━━━━━━━━━━\n\n`;

    let grandTotal = 0;

    cart.forEach((item) => {
      const optionText = item.options
        ?.map((o: any) => `${o.name}: ${o.value}`)
        .join("\n  ");

      const optionTotal =
        item.options?.reduce(
          (acc: number, o: any) => acc + (o.price || 0),
          0,
        ) || 0;

      const base = item.price.original;
      const selling = item.price.selling;
      const final = selling + optionTotal;

      const discount = base - selling;

      const subtotal = final * item.qty;
      grandTotal += subtotal;

      text += `☕ *${item.brand || "Product"}*\n`;
      text += `────────────────\n\n`;

      text += `• ${item.name} x${item.qty}\n`;
      text += `  Harga: Rp ${base.toLocaleString("id-ID")}\n`;

      if (optionText) {
        text += `  ${optionText}\n`;
      }

      if (discount > 0) {
        text += `  🔥 Promo → Rp ${final.toLocaleString("id-ID")}\n`;
        text += `  Hemat: Rp ${discount.toLocaleString("id-ID")}\n`;
      }

      text += `\nSubtotal: Rp ${subtotal.toLocaleString("id-ID")}\n\n`;
    });

    text += `━━━━━━━━━━━━━━━━━━\n\n`;
    text += `💰 *TOTAL BAYAR: Rp ${grandTotal.toLocaleString("id-ID")}*\n\n`;

    text += `━━━━━━━━━━━━━━━━━━\n\n`;
    text += `📌 *Note:*\n`;
    text += `1. Tunggu QR pengambilan\n`;
    text += `2. Bayar via QRIS\n`;
    text += `3. Tanpa bukti pembayaran tidak diproses\n`;

    return encodeURIComponent(text);
  };
  const groupedCart = safeCart.reduce((acc: any, item) => {
    const brand = item.brand || "Others";

    if (!acc[brand]) {
      acc[brand] = [];
    }

    acc[brand].push(item);
    return acc;
  }, {});
  useEffect(() => {
    const update = () => setRefresh((r) => r + 1);
    window.addEventListener("cart:update", update);
    return () => window.removeEventListener("cart:update", update);
  }, []);

  return (
    <div
      className={`fixed inset-0 z-50 transition ${
        open ? "visible" : "invisible"
      }`}
    >
      {/* BACKDROP */}
      <div
        onClick={onClose}
        className={`absolute inset-0 bg-black/30 backdrop-blur-xs transition-opacity duration-300 ${
          open ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* DRAWER */}
      <div
        className={`absolute right-0 top-0 h-full w-full md:w-[420px] bg-white shadow-xl
        flex flex-col
        transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* HEADER */}
        <div className="p-5 flex justify-between items-center border-b border-[#eee]">
          <h2 className="font-semibold text-lg">Keranjang</h2>
          <button onClick={onClose}>
            <X />
          </button>
        </div>

        {/* ITEMS (SCROLL AREA) */}
        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">
          {cart.length === 0 && (
            <p className="text-sm text-gray-400">Cart is empty</p>
          )}

          {Object.entries(groupedCart).map(([brand, items]: any) => (
            <div key={brand} className="space-y-3">
              {/* 🔥 BRAND HEADER */}
              <div className="flex items-center gap-2 mt-2">
                <span className="text-sm font-bold text-gray-700">
                  {brand.toUpperCase()}
                </span>
                <div className="flex-1 h-[1px] bg-gray-200" />
              </div>

              {/* 🔥 ITEMS */}
              {items.map((item: any) => {
                const discount = item.price.original > item.price.selling;
                const optionTotal = getOptionTotal(item);
                const itemTotal = (item.price.selling + optionTotal) * item.qty;
                const finalOriginal = item.price.original + optionTotal;

                return (
                  <div
                    key={item.cartId}
                    className="flex gap-3 items-start bg-gray-50 p-3 rounded-xl"
                  >
                    <img
                      src={item.image}
                      className="w-14 h-14 object-contain rounded-lg"
                    />

                    <div className="flex-1">
                      <p className="text-sm font-semibold leading-tight">
                        {item.name}
                      </p>

                      <p className="text-[11px] text-gray-400 mt-1 flex flex-wrap gap-x-2">
                        {item.options?.length > 0
                          ? item.options.map((opt: any, i: number) => (
                              <span key={i}>
                                {opt.value}
                                {i !== item.options.length - 1 && " • "}
                              </span>
                            ))
                          : "No options"}
                      </p>

                      <div className="mt-1 flex items-center gap-2">
                        <span className="text-green-600 font-bold text-[16px]">
                          Rp {itemTotal.toLocaleString("id-ID")}
                        </span>

                        {discount && (
                          <span className="text-gray-400 text-xs line-through">
                            Rp {finalOriginal.toLocaleString("id-ID")}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* ACTION */}
                    <div className="flex flex-col items-end gap-2">
                      <div className="flex items-center border rounded-lg overflow-hidden">
                        <button
                          onClick={() => {
                            const updated = cart.map((c) =>
                              c.cartId === item.cartId
                                ? { ...c, qty: Math.max(1, c.qty - 1) }
                                : c,
                            );
                            localStorage.setItem(
                              "cart",
                              JSON.stringify(updated),
                            );
                            setRefresh((r) => r + 1);
                          }}
                          className="px-2 text-sm"
                        >
                          -
                        </button>

                        <span className="px-2 text-xs">{item.qty}</span>

                        <button
                          onClick={() => {
                            const updated = cart.map((c) =>
                              c.cartId === item.cartId
                                ? { ...c, qty: c.qty + 1 }
                                : c,
                            );
                            localStorage.setItem(
                              "cart",
                              JSON.stringify(updated),
                            );
                            setRefresh((r) => r + 1);
                          }}
                          className="px-2 text-sm"
                        >
                          +
                        </button>
                      </div>

                      <button
                        onClick={() => {
                          removeFromCart(item.cartId);
                          setRefresh((r) => r + 1);
                        }}
                        className="text-red-500 text-[11px] hover:text-red-600 font-bold"
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
          <a
            href="#brand"
            onClick={() => {
              onClose();
            }}
            className="
            w-[105px]
    flex items-center justify-end gap-2
    px-3 py-2
    rounded-full
    border border-grey-600
    text-xs font-medium
    hover:bg-green-600
    hover:text-white
    cursor-pointer
    transition
  "
          >
            <span className="rounded-full">
              <PlusCircle size={15} />
            </span>
            Add More
          </a>
        </div>

        {/* 🔥 STICKY FOOTER */}
        <div className="sticky bottom-0 bg-white border-t border-[#eee] p-5 space-y-2 text-sm shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
          <div className="flex justify-between text-gray-400">
            <span> </span>
            <span className="line-through">
              Rp {subtotalOriginal.toLocaleString("id-ID")}
            </span>
          </div>
          {totalSavings > 0 && (
            <div className="flex justify-between font-bold text-green-500">
              <span>Diskon</span>
              <span>-Rp {totalSavings.toLocaleString("id-ID")}</span>
            </div>
          )}

          <div className="flex justify-between font-medium">
            <span>Subtotal</span>
            <span>Rp {subtotalPromo.toLocaleString("id-ID")}</span>
          </div>

          <div className="flex justify-between">
            <span>Fee Admin</span>
            <span>Rp {adminFee.toLocaleString("id-ID")}</span>
          </div>

          <div className="border-t border-dashed my-2"></div>

          <div className="flex justify-between items-center text-lg font-bold">
            <span>Total</span>
            <span className="font-bold">
              Rp {grandTotal.toLocaleString("id-ID")}
            </span>
          </div>

          <button
            onClick={() => {
              const message = generateWhatsAppMessage(cart, {
                name: "test",
                outlet: "A.H Nasution",
              });

              const phone = "6281586298430";

              const url = `https://api.whatsapp.com/send?phone=${phone}&text=${message}`;

              window.open(url, "_blank");
            }}
            className="mt-3 w-full bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition"
          >
            Checkout via WhatsApp
          </button>
        </div>
      </div>
    </div>
  );
}
