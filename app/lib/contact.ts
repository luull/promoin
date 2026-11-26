/** Nomor WhatsApp admin (format 62...), dipakai untuk invoice dan footer. */
export const ADMIN_WHATSAPP = "6281586298430";

export function whatsappUrl(text?: string) {
  const base = `https://api.whatsapp.com/send?phone=${ADMIN_WHATSAPP}`;
  return text ? `${base}&text=${encodeURIComponent(text)}` : base;
}
