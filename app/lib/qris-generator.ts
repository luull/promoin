
import QRCode from "qrcode";

const STATIC_QRIS =
  "00020101021126610014COM.GO-JEK.WWW01189360091431315878600210G1315878600303UMI51440014ID.CO.QRIS.WWW0215ID10264956062080303UMI5204899953033605802ID5925toko gimii, Digital & Kre6013JAKARTA PUSAT61051051062070703A0163047F28";

// Parse EMV TLV
function parseTLV(payload: string) {
  const fields: { tag: string; value: string }[] = [];
  let pos = 0;

  while (pos < payload.length) {
    const tag = payload.slice(pos, pos + 2);
    const length = Number(payload.slice(pos + 2, pos + 4));
    const value = payload.slice(pos + 4, pos + 4 + length);

    if (
      !/^\d{2}$/.test(tag) ||
      !Number.isInteger(length) ||
      value.length !== length
    ) {
      throw new Error("Invalid QRIS TLV payload");
    }

    fields.push({ tag, value });
    pos += 4 + length;
  }

  return fields;
}

// CRC16-CCITT-FALSE
function calculateCRC16(input: string) {
  let crc = 0xffff;

  for (let i = 0; i < input.length; i++) {
    crc ^= input.charCodeAt(i) << 8;

    for (let j = 0; j < 8; j++) {
      crc = (crc & 0x8000)
        ? ((crc << 1) ^ 0x1021)
        : (crc << 1);

      crc &= 0xffff;
    }
  }

  return crc.toString(16).toUpperCase().padStart(4, "0");
}

function buildTLV(tag: string, value: string) {
  if (value.length > 99) {
    throw new Error("TLV value too long");
  }

  return tag + value.length.toString().padStart(2, "0") + value;
}

export async function generateQRIS(amount: number) {
  if (!Number.isSafeInteger(amount) || amount <= 0) {
    throw new Error("Invalid payment amount");
  }

  const fields = parseTLV(STATIC_QRIS.slice(0, -8));

  // Experimental payload transformation only.
  const transformed = fields
    .filter((field) => field.tag !== "63" && field.tag !== "54")
    .map((field) => ({
      ...field,
      value: field.tag === "01" ? "12" : field.value,
    }));

  const countryIndex = transformed.findIndex(
    (field) => field.tag === "58"
  );

  if (countryIndex === -1) {
    throw new Error("Country code field not found");
  }

  transformed.splice(countryIndex, 0, {
    tag: "54",
    value: amount.toFixed(2),
  });

  const body = transformed
    .map((field) => buildTLV(field.tag, field.value))
    .join("");

  const payloadWithoutCRC = body + "6304";
  const crc = calculateCRC16(payloadWithoutCRC);
  const payload = payloadWithoutCRC + crc;

  const qrImage = await QRCode.toDataURL(payload, {
    errorCorrectionLevel: "M",
    margin: 4,
    width: 400,
  });

  return {
    payload,
    qrImage,
    amount,
    crc,
  };
}
