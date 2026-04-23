/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { X } from "lucide-react";
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

  const total = cart.reduce(
    (acc, item) => acc + item.price.selling * item.qty,
    0,
  );
  const safeCart = cart.map((item, index) => ({
    ...item,
    cartId: item.cartId ?? `${item.id}-${index}`, // fallback
  }));
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
        className={`absolute inset-0 bg-black/30 transition ${
          open ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* DRAWER */}
      <div
        className={`absolute right-0 top-0 h-full w-[420px] bg-white shadow-xl p-5 transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* HEADER */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-semibold text-lg">Keranjang</h2>
          <button onClick={onClose}>
            <X />
          </button>
        </div>

        {/* ITEMS */}
        <div className="flex flex-col gap-4 overflow-y-auto h-[70%]">
          {cart.length === 0 && (
            <p className="text-sm text-gray-400">Cart is empty</p>
          )}

          {safeCart.map((item) => {
            const discount = item.price.original > item.price.selling;

            return (
              <div
                key={item.cartId}
                className="flex gap-3 items-start bg-gray-50 p-3 rounded-xl"
              >
                {/* IMAGE */}
                <img
                  src={item.image}
                  className="w-14 h-14 object-contain rounded-lg"
                />

                {/* INFO */}
                <div className="flex-1">
                  <p className="text-sm font-semibold leading-tight">
                    {item.name}
                  </p>

                  {/* 🔥 VARIANT (optional) */}
                  <p className="text-[11px] text-gray-400 mt-1">
                    {item.espresso || "Normal"} • {item.sweet || "Normal"}
                  </p>

                  {/* 🔥 PRICE */}
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-green-600 font-bold text-sm">
                      Rp {item.price.selling.toLocaleString("id-ID")}
                    </span>

                    {discount && (
                      <span className="text-gray-400 text-xs line-through">
                        Rp {item.price.original.toLocaleString("id-ID")}
                      </span>
                    )}
                  </div>

                  {/* 🔥 SUBTOTAL */}
                  <p className="text-[11px] text-gray-500 mt-1">
                    Subtotal: Rp{" "}
                    {(item.price.selling * item.qty).toLocaleString("id-ID")}
                  </p>
                </div>

                {/* 🔥 ACTION */}
                <div className="flex flex-col items-end gap-2">
                  {/* QTY CONTROL */}
                  <div className="flex items-center border rounded-lg overflow-hidden">
                    <button
                      onClick={() => {
                        if (item.qty > 1) {
                          item.qty -= 1;
                          localStorage.setItem("cart", JSON.stringify(cart));
                          setRefresh((r) => r + 1);
                        }
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

                        localStorage.setItem("cart", JSON.stringify(updated));
                        setRefresh((r) => r + 1);
                      }}
                      className="px-2 text-sm"
                    >
                      +
                    </button>
                  </div>

                  {/* REMOVE */}
                  <button
                    onClick={() => {
                      removeFromCart(item.cartId);
                      setRefresh((r) => r + 1);
                    }}
                    className="text-red-500 cursor-pointer text-[11px]"
                  >
                    Hapus
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* FOOTER */}
        <div className="mt-4 border-t pt-4 space-y-2">
          <div className="flex justify-between text-sm text-gray-500">
            <span>Items</span>
            <span>{cart.length}</span>
          </div>

          <div className="flex justify-between text-base font-semibold">
            <span>Total</span>
            <span>Rp {total.toLocaleString("id-ID")}</span>
          </div>

          <button className="mt-3 w-full bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition">
            Checkout
          </button>
        </div>
      </div>
    </div>
  );
}
