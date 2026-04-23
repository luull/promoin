"use client";
import { useEffect, useState } from "react";
import { Search, ShoppingCart, X } from "lucide-react";
import { BrandKey, Product } from "../types/products";
import { ProductModal } from "./ProductModal";
import { SkeletonCard } from "./skeleton/SkeletonCard";

export function ProductSection({
  brand,
  onOpenCart,
}: {
  brand: BrandKey;
  onOpenCart: () => void;
}) {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [loadedImages, setLoadedImages] = useState<Record<number, boolean>>({});
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [selectedCategory, setSelectedCategory] =
    useState<string>("All Category");

  const categories = [
    "All Category",
    ...Array.from(new Set(products.map((p) => p.category))),
  ];

  const filteredProducts =
    selectedCategory === "All Category"
      ? products
      : products.filter((p) => p.category === selectedCategory);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoadingProducts(true);

        setSelectedCategory("All Category");
        setQuery("");
        setSearchResults([]);

        const res = await fetch(
          `http://localhost:8000/products?brand=${brand}`,
        );
        const data = await res.json();

        setProducts(data.data);
        setLoadedImages({});
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoadingProducts(false);
      }
    };

    fetchProducts();
  }, [brand]);

  useEffect(() => {
    const delay = setTimeout(async () => {
      if (!query) {
        setSearchResults([]);
        return;
      }

      try {
        setLoadingSearch(true);

        const res = await fetch(
          `http://localhost:8000/products/search?q=${query}`,
        );
        const data = await res.json();

        setSearchResults(data.data);
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setLoadingSearch(false);
      }
    }, 400);

    return () => clearTimeout(delay);
  }, [query]);

  const handleImageLoad = (id: number) => {
    setLoadedImages((prev) => ({ ...prev, [id]: true }));
  };

  const getDiscount = (original: number, selling: number) => {
    if (!original || !selling) return 0;
    return Math.round(((original - selling) / original) * 100);
  };

  const isSearching = query.length > 0;

  return (
    <section className="px-4 md:px-6 pt-4 pb-12 max-w-6xl mt-5 rounded-t-2xl bg-white mx-auto">
      {/* CATEGORY */}
      <div className="sticky top-0 z-40 bg-white p-5 mb-5">
        {/* CATEGORY */}
        <div className="flex gap-2 overflow-x-auto mb-3 no-scrollbar">
          {categories.map((c) => {
            const active = selectedCategory === c;

            return (
              <button
                key={c}
                onClick={() => setSelectedCategory(c)}
                className={`
            px-4 py-1.5 rounded-full text-xs whitespace-nowrap transition
            ${
              active
                ? "bg-green-600 text-white"
                : "bg-gray-100 hover:bg-gray-200"
            }
          `}
              >
                {c}
              </button>
            );
          })}
        </div>

        {/* SEARCH */}
        <div className="w-full md:w-[300px]">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />

            <input
              type="text"
              placeholder="Search..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-2 rounded-xl border border-[#eee] bg-white text-sm outline-none focus:ring-2 focus:ring-green-500 shadow-sm"
            />

            {query && (
              <button
                onClick={() => setQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>
      </div>
      {isSearching && (
        <p className="text-sm text-gray-400 -mt-10 mb-10">
          Results for &quot;{query}&quot;
        </p>
      )}
      {/* PRODUCTS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
        {/* 🔥 LOADING PRODUCTS */}
        {loadingProducts &&
          Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}

        {/* 🔍 LOADING SEARCH */}
        {loadingSearch &&
          Array.from({ length: 8 }).map((_, i) => (
            <SkeletonCard key={`search-${i}`} />
          ))}

        {/* 🔥 REAL DATA */}
        {!loadingProducts &&
          !loadingSearch &&
          (isSearching ? searchResults : filteredProducts).map((p, i) => {
            const isLoaded = loadedImages[p.id ?? i];

            return (
              <div
                key={p.id ?? i}
                className="group bg-white rounded-3xl p-3 md:p-4 shadow-sm hover:shadow-xl transition-all duration-300"
              >
                {/* 🔥 IMAGE FULL */}
                <div className="relative h-[140px] md:h-[220px] overflow-hidden rounded-xl">
                  {!isLoaded && (
                    <div className="absolute inset-0 bg-gray-200 animate-pulse" />
                  )}

                  <img
                    src={p.image}
                    onLoad={() => handleImageLoad(p.id ?? i)}
                    className={`absolute inset-0 w-full h-full object-cover transition duration-300 ${
                      isLoaded ? "opacity-100 scale-100" : "opacity-0 scale-105"
                    }`}
                  />

                  {/* BADGE */}
                  {p.price.original > p.price.selling && (
                    <div
                      className={`
      absolute top-2 left-2 z-20 text-[10px] md:text-xs px-2 py-1 rounded-full font-semibold backdrop-blur-md border
      ${
        p.brand?.toLowerCase() === "starbuck"
          ? "bg-white/80 border-white/40 text-gray-800"
          : "bg-green-500/20 border-green-400/30 text-green-900"
      }
    `}
                    >
                      -{getDiscount(p.price.original, p.price.selling)}%
                    </div>
                  )}

                  {/* OVERLAY */}
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition" />

                  {/* CART */}
                  <button
                    onClick={() => setSelectedProduct(p)}
                    className="absolute inset-0 z-30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                  >
                    <div className="bg-green-600 text-white p-3 rounded-full shadow-xl hover:scale-110 transition">
                      <ShoppingCart size={18} />
                    </div>
                  </button>
                </div>

                {/* INFO */}
                <div className="mt-3 md:mt-4">
                  <p className="text-xs md:text-sm font-semibold line-clamp-2">
                    {p.name}
                  </p>

                  <div className="mt-1 flex items-center gap-2 flex-wrap">
                    <span className="text-green-600 font-bold text-lg md:text-base">
                      Rp {p.price.selling.toLocaleString("id-ID")}
                    </span>

                    {p.price.original > p.price.selling && (
                      <span className="text-gray-400 text-xs line-through">
                        Rp {p.price.original.toLocaleString("id-ID")}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
      </div>

      {/* MODAL */}
      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onSuccess={() => {
            setSelectedProduct(null);
            onOpenCart?.();
          }}
        />
      )}
    </section>
  );
}
