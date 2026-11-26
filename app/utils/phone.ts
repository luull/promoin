/**
 * Menyamakan format nomor HP Indonesia ke 628xxxxxxxxx.
 * Harus sama dengan private.normalize_phone() di supabase/admin.sql.
 */
export function normalizePhone(input: string) {
  const digits = input.replace(/\D/g, "");

  if (digits.startsWith("62")) return digits;
  if (digits.startsWith("0")) return `62${digits.slice(1)}`;
  if (digits.startsWith("8")) return `62${digits}`;
  return digits;
}

export function isValidPhone(input: string) {
  return /^628\d{7,11}$/.test(normalizePhone(input));
}

/** 6281234567890 -> 081234567890 */
export function toLocalPhone(phone: string) {
  return phone.startsWith("62") ? `0${phone.slice(2)}` : phone;
}
