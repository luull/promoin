import {
  BrandKey,
  Product,
  ProductOption,
  ProductOptionValue,
} from "../types/products";
import { getSupabaseClient } from "./supabase";
import {
  applyBrandPrice,
  BrandSettingsMap,
  getBrandSettings,
  isBrandVisible,
} from "./brandSettings";

const PRODUCT_COLUMNS = `
  id,
  product_id,
  brand,
  name,
  description,
  image_url,
  category,
  original_price,
  selling_price,
  is_active,
  has_options,
  fields_format,
  display_order
`;

type ProductRow = {
  id: number;
  product_id: string | null;
  brand: string | null;
  name: string | null;
  description: string | null;
  image_url: string | null;
  category: string | null;
  original_price: number | null;
  selling_price: number | null;
  is_active: boolean | null;
  has_options: boolean | null;
  fields_format: string | null;
  display_order: number | null;
};

type ProductOptionRow = {
  id: string;
  name: string | null;
  input_type: string | null;
  is_required: boolean | null;
  max_selections: number | null;
  display_order: number | null;
};

type ProductOptionValueRow = {
  option_id: string | null;
  value: string | null;
  price_modifier: number | null;
  display_order: number | null;
};

function toProduct(row: ProductRow, settings: BrandSettingsMap = {}): Product {
  const brand = row.brand ?? "";

  return {
    id: row.id,
    product_id: row.product_id ?? "",
    brand,
    name: row.name ?? "",
    desc: row.description ?? "",
    image: row.image_url ?? "",
    category: row.category ?? "Uncategorized",
    price: applyBrandPrice(
      {
        original: row.original_price ?? 0,
        selling: row.selling_price ?? 0,
      },
      settings[brand]?.discount_percent,
    ),
    is_active: row.is_active ?? false,
    has_options: row.has_options ?? false,
    fields_format: row.fields_format ?? "",
  };
}

function sortProductRows(rows: ProductRow[]) {
  return [...rows].sort(
    (left, right) =>
      (left.display_order ?? Number.MAX_SAFE_INTEGER) -
        (right.display_order ?? Number.MAX_SAFE_INTEGER) || left.id - right.id,
  );
}

export async function getProductsByBrand(brand: BrandKey) {
  const [settings, { data, error }] = await Promise.all([
    getBrandSettings(),
    getSupabaseClient()
      .from("products")
      .select(PRODUCT_COLUMNS)
      .eq("brand", brand)
      .order("display_order", { ascending: true, nullsFirst: false })
      .order("id", { ascending: true }),
  ]);

  if (error) {
    throw new Error(`Failed to load products: ${error.message}`);
  }

  if (!isBrandVisible(settings, brand)) {
    return [];
  }

  return (data as ProductRow[]).map((row) => toProduct(row, settings));
}

export async function searchProducts(query: string) {
  const term = query.trim();

  if (!term) {
    return [];
  }

  const pattern = `%${term}%`;
  const supabase = getSupabaseClient();
  const [settings, nameResult, descriptionResult] = await Promise.all([
    getBrandSettings(),
    supabase.from("products").select(PRODUCT_COLUMNS).ilike("name", pattern),
    supabase
      .from("products")
      .select(PRODUCT_COLUMNS)
      .ilike("description", pattern),
  ]);

  const error = nameResult.error ?? descriptionResult.error;
  if (error) {
    throw new Error(`Failed to search products: ${error.message}`);
  }

  const uniqueRows = new Map<number, ProductRow>();
  for (const row of [
    ...((nameResult.data ?? []) as ProductRow[]),
    ...((descriptionResult.data ?? []) as ProductRow[]),
  ]) {
    uniqueRows.set(row.id, row);
  }

  return sortProductRows([...uniqueRows.values()])
    .filter((row) => isBrandVisible(settings, row.brand ?? ""))
    .map((row) => toProduct(row, settings));
}

export async function getProductOptions(productId: string) {
  const supabase = getSupabaseClient();
  const { data: optionData, error: optionError } = await supabase
    .from("product_options")
    .select(
      "id, name, input_type, is_required, max_selections, display_order",
    )
    .eq("product_id", productId)
    .order("display_order", { ascending: true, nullsFirst: false });

  if (optionError) {
    throw new Error(`Failed to load product options: ${optionError.message}`);
  }

  const optionRows = (optionData ?? []) as ProductOptionRow[];
  if (optionRows.length === 0) {
    return [];
  }

  const optionIds = optionRows.map((option) => option.id);
  const { data: valueData, error: valueError } = await supabase
    .from("option_values")
    .select("option_id, value, price_modifier, display_order")
    .in("option_id", optionIds)
    .order("display_order", { ascending: true, nullsFirst: false });

  if (valueError) {
    throw new Error(`Failed to load option values: ${valueError.message}`);
  }

  const valuesByOption = new Map<string, ProductOptionValue[]>();
  for (const row of (valueData ?? []) as ProductOptionValueRow[]) {
    if (!row.option_id) continue;

    const values = valuesByOption.get(row.option_id) ?? [];
    values.push({
      value: row.value ?? "",
      price: row.price_modifier ?? 0,
      display_order: row.display_order ?? 0,
    });
    valuesByOption.set(row.option_id, values);
  }

  return optionRows.map(
    (option): ProductOption => ({
      option_id: option.id,
      name: option.name ?? "",
      type: option.input_type ?? "radio",
      is_required: option.is_required ?? false,
      max_selections: option.max_selections,
      display_order: option.display_order ?? 0,
      values: valuesByOption.get(option.id) ?? [],
    }),
  );
}
