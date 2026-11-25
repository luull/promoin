"use client";

import { useEffect, useState } from "react";
import { Plus, Search, X } from "lucide-react";
import { BrandKey, Product, brands } from "../types/products";
import { ProductModal } from "./ProductModal";
import { SkeletonCard } from "./skeleton/SkeletonCard";
import { getProductsByBrand, searchProducts } from "../lib/catalog";

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

        const data = await getProductsByBrand(brand);

        setProducts(data);
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

        const data = await searchProducts(query);

        setSearchResults(data);
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

  // presentational only
  const visibleProducts = isSearching ? searchResults : filteredProducts;
  const brandName = brands.find((b) => b.id === brand)?.name ?? brand;
  const isLoadingList = loadingProducts || loadingSearch;

  return (
    <section className="mx-auto mt-6 max-w-6xl">
      {/* ===== STICKY SEARCH + CATEGORY ===== */}
      <div className="sticky top-0 z-40 bg-screen/90 px-4 pb-3 pt-3 backdrop-blur-xl">
        <div className="relative md:max-w-md">
          <Search
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted"
            size={18}
            strokeWidth={1.8}
            aria-hidden="true"
          />

          <input
            type="text"
            placeholder="Mau minum apa hari ini?"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-12 w-full rounded-full border border-border-subtle bg-surface pl-11 pr-12 text-sm text-ink shadow-card outline-none transition placeholder:text-muted focus:border-primary focus:ring-4 focus:ring-primary/20"
            aria-label="Cari produk"
          />

          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute right-2 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-full bg-surface-alt text-secondary transition hover:bg-ink hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              aria-label="Hapus pencarian produk"
            >
              <X size={15} />
            </button>
          )}
        </div>

        {!isSearching && (
          <div
            className="no-scrollbar -mx-4 mt-3 flex gap-2 overflow-x-auto px-4"
            role="group"
            aria-label="Filter kategori"
          >
            {categories.map((c) => {
              const active = selectedCategory === c;

              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => setSelectedCategory(c)}
                  aria-pressed={active}
                  className={`h-9 shrink-0 whitespace-nowrap rounded-full px-4 text-xs transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-screen ${
                    active
                      ? "bg-primary font-bold text-on-primary shadow-primary"
                      : "bg-surface-alt font-medium text-secondary hover:bg-[#e8e8e8] hover:text-ink"
                  }`}
                >
                  {c}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ===== LIST HEADER ===== */}
      <div className="mb-3 mt-3 flex items-end justify-between gap-3 px-4">
        <div className="min-w-0">
          <h2 className="truncate text-base font-bold tracking-[-0.01em] text-ink">
            {isSearching
              ? `Hasil untuk "${query}"`
              : selectedCategory === "All Category"
                ? `Menu ${brandName}`
                : selectedCategory}
          </h2>
          {isSearching && (
            <p className="mt-0.5 text-[11px] text-muted">
              Pencarian dari semua brand
            </p>
          )}
        </div>
        {!isLoadingList && (
          <span className="shrink-0 text-xs font-semibold text-primary-strong tabular-nums">
            {visibleProducts.length} menu
          </span>
        )}
      </div>

      {/* ===== PRODUCTS ===== */}
      <div className="grid grid-cols-2 gap-x-3 gap-y-5 px-4 md:grid-cols-3 md:gap-x-4 lg:grid-cols-4">
        {loadingProducts &&
          Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}

        {loadingSearch &&
          Array.from({ length: 8 }).map((_, i) => (
            <SkeletonCard key={`search-${i}`} />
          ))}

        {!loadingProducts &&
          !loadingSearch &&
          (isSearching ? searchResults : filteredProducts).map((p, i) => {
            const isLoaded = loadedImages[p.id ?? i];

            return (
              <button
                key={p.id ?? i}
                type="button"
                onClick={() => setSelectedProduct(p)}
                className="group flex flex-col rounded-[22px] text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4 focus-visible:ring-offset-screen"
                aria-label={`Lihat detail ${p.name}`}
              >
                <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[22px] bg-surface-alt">
                  {!isLoaded && (
                    <div className="absolute inset-0 animate-pulse bg-surface-alt" />
                  )}

                  <img
                    src={p.image}
                    alt=""
                    onLoad={() => handleImageLoad(p.id ?? i)}
                    className={`absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105 ${
                      isLoaded ? "opacity-100" : "opacity-0"
                    }`}
                  />

                  {p.price.original > p.price.selling && (
                    <span className="absolute left-2.5 top-2.5 z-20 rounded-full bg-ink px-2 py-1 text-[10px] font-bold text-white tabular-nums md:text-xs">
                      -{getDiscount(p.price.original, p.price.selling)}%
                    </span>
                  )}

                  <span
                    className="absolute right-2.5 top-2.5 z-20 grid size-8 place-items-center rounded-full bg-surface text-ink shadow-card transition group-hover:bg-primary group-hover:text-on-primary md:size-9"
                    aria-hidden="true"
                  >
                    <Plus size={17} strokeWidth={2.2} />
                  </span>
                </div>

                <div className="mt-2.5 px-1">
                  <h3 className="line-clamp-2 text-[13px] font-semibold leading-[18px] text-ink md:text-sm md:leading-5">
                    {p.name}
                  </h3>

                  <div className="mt-1 flex flex-wrap items-baseline gap-x-1.5 tabular-nums">
                    <span className="text-sm font-bold text-ink md:text-base">
                      Rp {p.price.selling.toLocaleString("id-ID")}
                    </span>

                    {p.price.original > p.price.selling && (
                      <span className="text-[10px] text-muted line-through md:text-xs">
                        Rp {p.price.original.toLocaleString("id-ID")}
                      </span>
                    )}
                  </div>
                </div>
              </button>
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
