/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useEffect, useState } from "react";
import {
  Coffee,
  Snowflake,
  Droplet,
  Sparkles,
  Milk,
  Candy,
  CupSoda,
  X,
} from "lucide-react";
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
  const [show, setShow] = useState(true);
  const [options, setOptions] = useState<any[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(false);

  const [selectedOptions, setSelectedOptions] = useState<Record<string, any>>(
    {},
  );
  // 🔥 SELECT HANDLER
  const handleSelect = (opt: any, value: any) => {
    setSelectedOptions((prev) => {
      const current = prev[opt.name];

      // 🔥 RADIO (1 doang per section)
      if (opt.type === "radio") {
        return {
          ...prev,
          [opt.name]: value,
        };
      }

      // 🔥 CHECKBOX (multi select)
      let updated = current ? [...current] : [];

      const exists = updated.find((v: any) => v.value === value.value);

      if (exists) {
        // remove kalau udah ada
        updated = updated.filter((v: any) => v.value !== value.value);
      } else {
        // add kalau belum & masih boleh
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

  // 🔥 FETCH OPTIONS
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        setLoadingOptions(true);

        const res = await fetch(
          `http://127.0.0.1:8000/products/${product.product_id}/options`,
        );

        const data = await res.json();
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

  return (
    <div
      onClick={handleClose}
      className={`fixed inset-0 z-50 flex items-center justify-center px-4
      bg-black/40 backdrop-blur-xs transition-opacity duration-200
      ${show ? "opacity-100" : "opacity-0"}`}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`bg-white w-full max-w-4xl rounded-3xl shadow-xl
        transition-all duration-300
        ${show ? "scale-100 opacity-100" : "scale-95 opacity-0"}
        flex flex-col md:flex-row overflow-hidden`}
      >
        {/* IMAGE */}
        <div className="md:w-1/2">
          <img src={product.image} className="w-full h-full object-cover" />
        </div>

        {/* CONTENT */}
        <div className="flex-1 p-6 relative overflow-y-auto max-h-[90vh]">
          {/* CLOSE */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-black"
          >
            <X size={20} />
          </button>

          {/* INFO */}
          <div className="text-sm bg-green-100 py-1 px-3 text-green-600 mt-5 rounded w-fit">
            {product.category}
          </div>

          <h2 className="text-xl font-bold mt-2">{product.name}</h2>

          <p className="text-xs text-gray-400 line-clamp-3">{product.desc}</p>

          {/* PRICE */}
          <div className="mt-2 flex items-center gap-2">
            <span className="text-green-600 font-bold text-xl">
              Rp {product.price.selling.toLocaleString("id-ID")}
            </span>

            {product.price.original > product.price.selling && (
              <span className="text-gray-400 line-through text-sm">
                Rp {product.price.original.toLocaleString("id-ID")}
              </span>
            )}
          </div>

          {/* OPTIONS */}
          <>
            {options.map((opt) => (
              <div key={`${opt.id}-${opt.name}`} className="mt-5">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    <div className="text-gray-600">
                      {getOptionIcon(opt.name)}
                    </div>
                    <p className="font-semibold text-sm">{opt.name}</p>
                  </div>
                  <span className="text-xs text-gray-400">
                    {opt.is_required ? "Required" : "Optional"}
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-2">
                  {opt.values?.map((v: any) => {
                    const selected = selectedOptions[opt.name];

                    const isSelected =
                      opt.type === "radio"
                        ? selected?.value === v.value
                        : selected?.some((x: any) => x.value === v.value);

                    return (
                      <div
                        key={`${opt.id}-${v.value}`}
                        onClick={() => handleSelect(opt, v)}
                        className={`
                          border rounded-xl p-2 cursor-pointer text-sm transition
                          ${
                            isSelected
                              ? "border-green-600 bg-green-50"
                              : "border-gray-300 hover:bg-gray-100"
                          }
                        `}
                      >
                        <div className="flex justify-between items-center font-medium">
                          <span>{v.value}</span>
                          <span className="text-gray-500 text-sm">
                            +Rp {v.price.toLocaleString("id-ID")}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </>

          {/* QTY */}
          <div className="mt-6 flex items-center justify-between">
            <div className="flex items-center gap-3 border rounded-lg px-3 py-1">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))}>
                -
              </button>
              <span>{qty}</span>
              <button onClick={() => setQty((q) => q + 1)}>+</button>
            </div>
          </div>

          {/* ADD BUTTON */}
          <button
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
            className="mt-6 w-full bg-green-600 disabled:bg-gray-400 text-white py-3 rounded-xl font-semibold"
          >
            Add to Cart • Rp {getTotalPrice().toLocaleString("id-ID")}
          </button>
        </div>
      </div>
    </div>
  );
}
