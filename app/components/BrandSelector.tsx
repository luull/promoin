"use client";
import { useState } from "react";
import { BrandKey, brands } from "../types/products";

export function BrandSelector({
  onChange,
}: {
  onChange?: (v: BrandKey) => void;
}) {
  const [selected, setSelected] = useState<BrandKey>("fore");

  const handleSelect = (id: BrandKey) => {
    setSelected(id);
    onChange?.(id);
  };

  return (
    <div className="px-4 md:px-8 mx-auto max-w-6xl  sticky top-0 py-3 z-50  bg-[#f6f7fb]">
      {/* 🔥 SCROLL CONTAINER */}
      <section className="w-full px-1 py-2 mx-auto overflow-x-auto overflow-y-hidden no-scrollbar">
        <div className="flex items-center gap-3 md:gap-5 snap-x snap-mandatory">
          {brands.map((b) => {
            const active = selected === b.id;

            return (
              <button
                key={b.id}
                onClick={() => handleSelect(b.id as BrandKey)}
                className={`
            snap-start
            min-w-[140px] md:min-w-[220px]
            h-[50px] md:h-[140px]
            rounded-2xl md:rounded-3xl
            px-4 md:p-5
            flex justify-center items-center
            transition-all duration-300
            
            ${b.bg}
            ${
              active
                ? `border-1 ${b.border} scale-[1.03]`
                : "hover:scale-[1.02]"
            }
          `}
              >
                <img src={b.logo} className="h-6 md:h-16 object-contain" />
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}
