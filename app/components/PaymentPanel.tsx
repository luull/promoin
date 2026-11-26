"use client";

import { Download, MessageCircle, TriangleAlert, X } from "lucide-react";

export type PaymentInfo = {
  orderId: number;
  total: number;
  /** Data URL PNG dari generateQRIS. null jika QRIS gagal dibuat. */
  qrImage: string | null;
  whatsappUrl: string;
};

export function PaymentPanel({
  payment,
  onClose,
}: {
  payment: PaymentInfo;
  onClose: () => void;
}) {
  const { orderId, total, qrImage, whatsappUrl } = payment;
  const amount = `Rp ${total.toLocaleString("id-ID")}`;

  return (
    <section
      className="absolute inset-0 z-30 flex min-h-0 w-full max-w-full touch-pan-y flex-col overflow-hidden overscroll-none bg-screen"
      aria-labelledby="payment-title"
    >
      <header className="flex shrink-0 items-center justify-between px-4 pb-3 pt-4">
        <button
          type="button"
          onClick={onClose}
          className="grid size-11 shrink-0 place-items-center rounded-full bg-surface text-ink shadow-card transition hover:bg-primary-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          aria-label="Tutup pembayaran"
        >
          <X size={20} strokeWidth={2} />
        </button>
        <div className="text-center">
          <h2
            id="payment-title"
            className="text-base font-semibold tracking-[-0.01em] text-ink"
          >
            Pembayaran QRIS
          </h2>
          <p className="text-[11px] font-medium text-muted">Langkah 3 dari 3</p>
        </div>
        <span className="size-11" aria-hidden="true" />
      </header>

      <div className="min-h-0 w-full max-w-full flex-1 touch-pan-y space-y-5 overflow-x-hidden overflow-y-auto overscroll-x-none px-4 pb-6 pt-2">
        <div className="rounded-[24px] bg-surface p-5 text-center shadow-card">
          <p className="text-xs font-medium text-muted">
            No. Pesanan{" "}
            <span className="font-semibold text-ink tabular-nums">
              #{orderId}
            </span>
          </p>

          {qrImage ? (
            <>
              <img
                src={qrImage}
                alt="QRIS"
                className="mx-auto mt-4 aspect-square w-full max-w-[260px] rounded-2xl border border-border-subtle"
              />
              <p className="mt-4 text-[11px] leading-4 text-muted">
                Total yang harus dibayar
              </p>
              <p className="text-xl font-bold leading-7 text-ink tabular-nums">
                {amount}
              </p>
              <a
                href={qrImage}
                download={`qris-pesanan-${orderId}.png`}
                className="mt-4 inline-flex h-10 items-center justify-center gap-2 rounded-full border-[1.5px] border-border-subtle px-4 text-xs font-semibold text-ink transition hover:border-primary hover:bg-primary-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <Download size={16} strokeWidth={2} />
                Simpan QR
              </a>
            </>
          ) : (
            <div
              role="alert"
              className="mt-4 flex items-start gap-2 rounded-2xl bg-red-50 p-4 text-left text-xs leading-5 text-red-600"
            >
              <TriangleAlert className="mt-0.5 shrink-0" size={16} />
              QRIS belum bisa dibuat. Pesanan sudah tercatat, lanjutkan ke
              WhatsApp untuk meminta QRIS pembayaran {amount} dari admin.
            </div>
          )}
        </div>

        {qrImage && (
          <ol className="list-decimal space-y-1.5 pl-5 pr-1 text-xs leading-5 text-secondary">
            <li>
              Scan QR di atas, atau simpan lalu unggah di aplikasi e-wallet /
              m-banking.
            </li>
            <li>
              Pastikan nominal yang muncul{" "}
              <span className="font-semibold text-ink">{amount}</span>.
            </li>
            <li>Setelah bayar, kirim pesanan dan bukti bayar lewat WhatsApp.</li>
            <li>Status pesanan bisa dicek di menu Riwayat.</li>
          </ol>
        )}
      </div>

      <footer className="shrink-0 rounded-t-[28px] bg-surface px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4 shadow-lift">
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-primary text-sm font-bold text-on-primary shadow-primary transition hover:bg-primary-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2"
        >
          <MessageCircle size={18} strokeWidth={2} />
          Konfirmasi via WhatsApp
        </a>
      </footer>
    </section>
  );
}
