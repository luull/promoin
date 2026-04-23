/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Product } from "../types/products";
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
  const [espresso, setEspresso] = useState("normal");
  const [sweet, setSweet] = useState("normal");
  const [show, setShow] = useState(true);

  // 🔥 close dengan animasi keluar
  const handleClose = () => {
    setShow(false);
    setTimeout(onClose, 200);
  };

  return (
    <div
      onClick={handleClose}
      className={`fixed inset-0 z-50 flex items-center justify-center px-4
      bg-black/40 backdrop-blur-xs transition-opacity duration-200
      ${show ? "opacity-100" : "opacity-0"}`}
    >
      {/* MODAL */}
      <div
        onClick={(e) => e.stopPropagation()}
        className={`bg-white w-full max-w-3xl rounded-3xl shadow-xl
        transition-all duration-300
        ${show ? "scale-100 opacity-100" : "scale-95 opacity-0"}
        
        flex flex-col md:flex-row overflow-hidden`}
      >
        {/* LEFT IMAGE */}
        <div className="md:w-1/2 relative overflow-hidden">
          <img src={product.image} className="w-full h-full object-cover" />
        </div>

        {/* RIGHT */}
        <div className="flex-1 p-6 relative">
          {/* CLOSE */}
          <button
            onClick={handleClose}
            className="absolute cursor-pointer top-4 right-4 text-gray-500 hover:text-black"
          >
            <X size={20} />
          </button>

          {/* TITLE */}
          <div className="text-sm bg-green-100 py-2 px-3 text-green-600 mt-5 rounded w-fit">
            {product.category}
          </div>
          <h2 className="text-lg md:text-2xl line font-bold mt-2 mb-0">
            {product.name}
          </h2>
          <small className="text-xs text-gray-400 line-clamp-3 rounded w-fit">
            {product.desc}
          </small>

          {/* PRICE */}
          <div className="mt-1 flex items-center gap-2 flex-wrap">
            {/* harga jual */}
            <span className="text-green-600 font-bold text-md md:text-[25px]">
              Rp {product.price.selling.toLocaleString("id-ID")}
            </span>

            {/* harga asli (coret) */}
            {product.price.original > product.price.selling && (
              <span className="text-gray-400 text-sm line-through">
                Rp {product.price.original.toLocaleString("id-ID")}
              </span>
            )}
          </div>

          {/* ESPRESSO */}
          <div className="mt-6">
            <p className="font-semibold mb-2 text-sm">Espresso</p>

            <div className="flex gap-2 flex-wrap">
              {["normal", "1 shot", "2 shot"].map((e) => (
                <button
                  key={e}
                  onClick={() => setEspresso(e)}
                  className={`px-3 py-1.5 rounded-lg text-xs border transition ${
                    espresso === e
                      ? "bg-green-600 text-white border-green-600"
                      : "bg-white hover:bg-gray-100"
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          {/* SWEET */}
          <div className="mt-5">
            <p className="font-semibold mb-2 text-sm">Sweetness</p>

            <div className="flex gap-2">
              {["normal", "less"].map((s) => (
                <button
                  key={s}
                  onClick={() => setSweet(s)}
                  className={`px-3 py-1.5 rounded-lg text-xs border transition ${
                    sweet === s
                      ? "bg-green-600 text-white border-green-600"
                      : "hover:bg-gray-100"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* QTY */}
          <div className="mt-6 flex items-center justify-between">
            <div className="flex items-center gap-3 border rounded-lg px-3 py-1">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="text-lg"
              >
                -
              </button>
              <span className="text-sm">{qty}</span>
              <button onClick={() => setQty((q) => q + 1)} className="text-lg">
                +
              </button>
            </div>

            <span className="text-sm text-gray-500">
              {espresso}, {sweet}
            </span>
          </div>

          {/* ADD BUTTON */}
          <button
            onClick={() => {
              addToCart(
                {
                  ...product,
                  espresso,
                  sweet,
                },
                qty,
              );
              onSuccess?.();
            }}
            className="mt-6 w-full bg-green-600 hover:bg-green-700 transition text-white py-3 rounded-xl font-semibold"
          >
            Add to Cart • Rp{" "}
            {(product.price.selling * qty).toLocaleString("id-ID")}
          </button>
        </div>
      </div>
    </div>
  );
}
