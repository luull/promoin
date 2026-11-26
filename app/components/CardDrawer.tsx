/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { ChevronLeft, PlusCircle, ShoppingBag, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { CartItem } from "../types/cart";
import { BrandKey, brands } from "../types/products";
import { clearCart, getCart, removeFromCart } from "../utils/cart";
import { ADMIN_WHATSAPP } from "../lib/contact";
import { createOrder } from "../lib/orders";
import { DEFAULT_ADMIN_FEE, getStoreSettings } from "../lib/storeSettings";
import { toLocalPhone } from "../utils/phone";
import { CheckoutDetails, CheckoutPanel } from "./CheckoutPanel";
import { PaymentInfo, PaymentPanel } from "./PaymentPanel";

export function CartDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [, setRefresh] = useState(0);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [payment, setPayment] = useState<PaymentInfo | null>(null);
  const [adminFee, setAdminFee] = useState(DEFAULT_ADMIN_FEE);
  const cart: CartItem[] = open ? getCart() : [];

  // Ambil fee terbaru yang diatur admin setiap keranjang dibuka.
  useEffect(() => {
    if (!open) return;

    let cancelled = false;
    getStoreSettings().then((settings) => {
      if (!cancelled) setAdminFee(settings.admin_fee);
    });

    return () => {
      cancelled = true;
    };
  }, [open]);

  const handleClose = () => {
    setCheckoutOpen(false);
    setPayment(null);
    onClose();
  };

  const getOptionTotal = (item: any) => {
    if (!item.options) return 0;
    return item.options.reduce(
      (acc: number, opt: any) => acc + (opt.price || 0),
      0,
    );
  };

  useEffect(() => {
    if (!open) return;

    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    const previousBodyOverscroll = document.body.style.overscrollBehavior;

    document.body.style.overflow = "hidden";
    document.body.style.overscrollBehavior = "none";
    document.documentElement.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.body.style.overscrollBehavior = previousBodyOverscroll;
      document.documentElement.style.overflow = previousHtmlOverflow;
    };
  }, [open]);

  const subtotalOriginal = cart.reduce((acc, item) => {
    const optionTotal = getOptionTotal(item);
    return acc + (item.price.original + optionTotal) * item.qty;
  }, 0);

  const subtotalPromo = cart.reduce((acc, item) => {
    const optionTotal = getOptionTotal(item);
    return acc + (item.price.selling + optionTotal) * item.qty;
  }, 0);

  const totalSavings = subtotalOriginal - subtotalPromo;
  // Fee hanya untuk tampilan. Fee yang ditagih ditentukan create_order.
  const grandTotal = subtotalPromo + adminFee;

  const safeCart = cart.map((item, index) => ({
    ...item,
    cartId: item.cartId ?? `${item.id}-${index}`,
  }));

  const generateWhatsAppMessage = (
    checkoutCart: CartItem[],
    checkout: CheckoutDetails,
    order: { id: number; total: number; adminFee: number },
  ) => {
    const orderId = order.id;
    const itemsByBrand = checkoutCart.reduce<Record<string, CartItem[]>>(
      (grouped, item) => {
        const brand = item.brand || "others";
        grouped[brand] = [...(grouped[brand] ?? []), item];
        return grouped;
      },
      {},
    );

    let text = `🧾 *INVOICE PESANAN - PROMOIN*\n`;
    text += `━━━━━━━━━━━━━━━━━━\n\n`;
    text += `🆔 *No. Pesanan:* #${orderId}\n`;
    text += `👤 *Nama:* ${checkout.name}\n`;
    text += `📱 *No. HP:* ${toLocalPhone(checkout.phone)}\n\n`;

    Object.entries(itemsByBrand).forEach(([brandKey, items]) => {
      const brand = brands.find((item) => item.id === brandKey);
      const outlet = checkout.outlets[brandKey as BrandKey];

      text += `☕ *${brand?.name ?? brandKey.toUpperCase()}*\n`;
      if (outlet) {
        text += `🏪 *Outlet:* ${outlet.name}\n`;
        if (outlet.address) text += `📍 ${outlet.address}\n`;
      }
      text += `────────────────\n\n`;

      items.forEach((item) => {
        const optionText = item.options
          ?.map((option) => `${option.name}: ${option.value}`)
          .join("\n  ");
        const optionTotal =
          item.options?.reduce(
            (total, option) => total + (option.price || 0),
            0,
          ) || 0;
        const unitPrice = item.price.selling + optionTotal;
        const itemSubtotal = unitPrice * item.qty;
        const discount = item.price.original - item.price.selling;

        text += `• ${item.name} x${item.qty}\n`;
        if (optionText) text += `  ${optionText}\n`;
        text += `  Harga: Rp ${unitPrice.toLocaleString("id-ID")}\n`;
        if (discount > 0) {
          text += `  Hemat: Rp ${(discount * item.qty).toLocaleString("id-ID")}\n`;
        }
        text += `  Subtotal: Rp ${itemSubtotal.toLocaleString("id-ID")}\n\n`;
      });
    });

    // Ringkasan memakai angka dari database agar sama dengan nominal QRIS.
    text += `━━━━━━━━━━━━━━━━━━\n`;
    text += `Subtotal: Rp ${(order.total - order.adminFee).toLocaleString("id-ID")}\n`;
    text += `Fee admin: Rp ${order.adminFee.toLocaleString("id-ID")}\n`;
    text += `💰 *TOTAL BAYAR: Rp ${order.total.toLocaleString("id-ID")}*\n\n`;
    text += `━━━━━━━━━━━━━━━━━━\n\n`;
    text += `📌 *Catatan:*\n`;
    text += `1. Tunggu QR pengambilan\n`;
    text += `2. Bayar via QRIS\n`;
    text += `3. Pesanan diproses setelah pembayaran terverifikasi\n`;

    return encodeURIComponent(text);
  };

  const handleCheckout = async (details: CheckoutDetails) => {
    const { orderId, total, adminFee: chargedFee } = await createOrder({
      name: details.name,
      phone: details.phone,
      items: cart,
      outlets: details.outlets,
    });

    const message = generateWhatsAppMessage(cart, details, {
      id: orderId,
      total,
      adminFee: chargedFee ?? adminFee,
    });
    const phone = ADMIN_WHATSAPP;
    const whatsappUrl = `https://api.whatsapp.com/send?phone=${phone}&text=${message}`;

    // Pesanan sudah tercatat, jadi keranjang dikosongkan agar tidak
    // ter-checkout dua kali. Pesan WhatsApp di atas sudah memakai isi lama.
    clearCart();

    // QRIS dibuat setelah pesanan tercatat, memakai total dari database.
    // Library QR baru dimuat saat pengguna akan membayar.
    let qrImage: string | null = null;
    try {
      const { generateQRIS } = await import("../lib/qris-generator");
      const result = await generateQRIS(total);
      qrImage = result.qrImage;
    } catch (error) {
      // Pesanan sudah tercatat, jadi jangan lempar error agar pengguna tidak
      // checkout ulang dan membuat pesanan ganda.
      console.error("generateQRIS error:", error);
    }

    setPayment({ orderId, total, qrImage, whatsappUrl });
    setCheckoutOpen(false);
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
      className={`fixed inset-0 z-50 overflow-hidden overscroll-none transition ${
        open ? "visible" : "invisible"
      }`}
      aria-hidden={!open}
    >
      <div
        onClick={handleClose}
        className={`absolute inset-0 bg-ink/40 backdrop-blur-sm transition-opacity duration-300 ${
          open ? "opacity-100" : "opacity-0"
        }`}
        aria-hidden="true"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-drawer-title"
        className={`absolute right-0 top-0 flex h-full w-full max-w-full touch-pan-y flex-col overflow-hidden overscroll-none bg-screen shadow-2xl transition-transform duration-300 md:w-[440px] md:rounded-l-[32px] ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* ===== TOP BAR ===== */}
        <header className="flex shrink-0 items-center justify-between px-4 pb-3 pt-4">
          <button
            type="button"
            onClick={handleClose}
            className="grid size-11 place-items-center rounded-full bg-surface text-ink shadow-card transition hover:bg-primary-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-label="Tutup keranjang"
          >
            <ChevronLeft size={20} strokeWidth={2} />
          </button>
          <h2
            id="cart-drawer-title"
            className="text-base font-semibold tracking-[-0.01em] text-ink"
          >
            Keranjang
          </h2>
          <span className="size-11" aria-hidden="true" />
        </header>

        {/* ===== ITEMS ===== */}
        <div className="flex min-h-0 w-full max-w-full flex-1 touch-pan-y flex-col gap-5 overflow-x-hidden overflow-y-auto overscroll-x-none px-4 pb-5 pt-2">
          {cart.length === 0 && (
            <div className="flex min-h-56 flex-col items-center justify-center rounded-[24px] bg-surface p-6 text-center shadow-card">
              <span className="grid size-14 place-items-center rounded-full bg-primary-light text-primary-strong">
                <ShoppingBag size={24} strokeWidth={1.8} />
              </span>
              <p className="mt-4 text-sm font-semibold text-ink">
                Keranjang masih kosong
              </p>
              <p className="mt-1 text-xs text-muted">
                Yuk pilih menu minuman favoritmu dulu.
              </p>
            </div>
          )}

          {Object.entries(groupedCart).map(([brand, items]: any) => {
            const brandInfo = brands.find((b) => b.id === brand);

            return (
              <section key={brand} className="space-y-3">
                <div className="flex items-center gap-2.5 px-1">
                  {brandInfo && (
                    <span className="grid h-8 w-11 place-items-center rounded-lg bg-surface p-1 shadow-card">
                      <img
                        src={brandInfo.logo}
                        alt=""
                        className="max-h-full w-full object-contain"
                      />
                    </span>
                  )}
                  <h3 className="text-sm font-bold text-ink">
                    {brandInfo?.name ?? brand.toUpperCase()}
                  </h3>
                  <span className="text-xs text-muted tabular-nums">
                    · {items.length} item
                  </span>
                </div>

                {items.map((item: any) => {
                  const discount = item.price.original > item.price.selling;
                  const optionTotal = getOptionTotal(item);
                  const itemTotal =
                    (item.price.selling + optionTotal) * item.qty;
                  const finalOriginal = item.price.original + optionTotal;

                  return (
                    <article
                      key={item.cartId}
                      className="flex gap-3 rounded-[22px] bg-surface p-2.5 shadow-card"
                    >
                      <div className="size-[84px] shrink-0 overflow-hidden rounded-2xl bg-surface-alt">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-full w-full object-cover"
                        />
                      </div>

                      <div className="flex min-w-0 flex-1 flex-col">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="line-clamp-2 text-[13px] font-semibold leading-[18px] text-ink">
                            {item.name}
                          </h4>
                          <button
                            type="button"
                            onClick={() => {
                              removeFromCart(item.cartId);
                              setRefresh((r) => r + 1);
                            }}
                            className="-mr-0.5 -mt-0.5 grid size-8 shrink-0 place-items-center rounded-full text-muted transition hover:bg-red-50 hover:text-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
                            aria-label={`Hapus ${item.name} dari keranjang`}
                          >
                            <Trash2 size={16} strokeWidth={1.8} />
                          </button>
                        </div>

                        <p className="mt-0.5 line-clamp-1 text-[11px] leading-4 text-muted">
                          {item.options?.length > 0
                            ? item.options.map((opt: any, i: number) => (
                                <span key={i}>
                                  {opt.value}
                                  {i !== item.options.length - 1 && " • "}
                                </span>
                              ))
                            : "No options"}
                        </p>

                        <div className="mt-auto flex items-end justify-between gap-2 pt-2">
                          <div className="flex min-w-0 flex-col tabular-nums">
                            {discount && (
                              <span className="text-[10px] leading-3 text-muted line-through">
                                Rp {finalOriginal.toLocaleString("id-ID")}
                              </span>
                            )}
                            <span className="text-sm font-bold text-ink">
                              Rp {itemTotal.toLocaleString("id-ID")}
                            </span>
                          </div>

                          <div className="flex shrink-0 items-center rounded-xl border border-border-subtle bg-surface p-0.5 tabular-nums">
                            <button
                              type="button"
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
                              className="grid size-7 place-items-center rounded-lg text-sm font-semibold text-secondary transition hover:bg-surface-alt focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                              aria-label={`Kurangi jumlah ${item.name}`}
                            >
                              −
                            </button>

                            <span className="w-7 text-center text-xs font-bold text-ink">
                              {item.qty}
                            </span>

                            <button
                              type="button"
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
                              className="grid size-7 place-items-center rounded-lg bg-ink text-sm font-semibold text-white transition hover:bg-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                              aria-label={`Tambah jumlah ${item.name}`}
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </section>
            );
          })}

          <a
            href="#brand"
            onClick={() => {
              handleClose();
            }}
            className="flex h-12 w-full shrink-0 items-center justify-center gap-2 rounded-full border-[1.5px] border-dashed border-ink/20 text-sm font-semibold text-ink transition hover:border-primary hover:bg-primary-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <PlusCircle size={17} strokeWidth={1.9} />
            Tambah menu lain
          </a>
        </div>

        {/* ===== SUMMARY ===== */}
        <footer className="shrink-0 rounded-t-[28px] bg-surface px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-5 text-xs text-secondary shadow-lift tabular-nums">
          <div className="space-y-2">
            <div className="flex justify-between text-muted">
              <span>Harga normal</span>
              <span className="line-through">
                Rp {subtotalOriginal.toLocaleString("id-ID")}
              </span>
            </div>
            {totalSavings > 0 && (
              <div className="flex justify-between font-semibold text-primary-strong">
                <span>Diskon</span>
                <span>-Rp {totalSavings.toLocaleString("id-ID")}</span>
              </div>
            )}

            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-medium text-ink">
                Rp {subtotalPromo.toLocaleString("id-ID")}
              </span>
            </div>

            <div className="flex justify-between">
              <span>Fee Admin</span>
              <span className="font-medium text-ink">
                Rp {adminFee.toLocaleString("id-ID")}
              </span>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between gap-3 rounded-full bg-surface-alt py-2 pl-5 pr-2">
            <div className="min-w-0">
              <p className="text-[11px] leading-4 text-muted">Total</p>
              <p className="truncate text-lg font-bold leading-6 text-ink">
                Rp {grandTotal.toLocaleString("id-ID")}
              </p>
            </div>

            <button
              type="button"
              disabled={cart.length === 0}
              onClick={() => setCheckoutOpen(true)}
              className={`h-12 shrink-0 rounded-full px-5 text-sm font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 ${
                cart.length > 0
                  ? "bg-primary text-on-primary shadow-primary hover:bg-primary-dark"
                  : "cursor-not-allowed bg-border-subtle text-muted"
              }`}
            >
              {cart.length > 0 ? "Checkout" : "Keranjang kosong"}
            </button>
          </div>
        </footer>

        {checkoutOpen && cart.length > 0 && (
          <CheckoutPanel
            cart={cart}
            total={grandTotal}
            onBack={() => setCheckoutOpen(false)}
            onCheckout={handleCheckout}
          />
        )}

        {payment && <PaymentPanel payment={payment} onClose={handleClose} />}
      </div>
    </div>
  );
}
