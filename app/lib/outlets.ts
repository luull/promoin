import { BrandKey } from "../types/products";
import { Outlet } from "../types/outlets";
import { getSupabaseClient } from "./supabase";

const OUTLET_COLUMNS = `
  id,
  brand,
  name,
  city_or_regency,
  city,
  regency,
  area,
  address,
  opening_hours_displayed,
  opening_hours,
  phone
`;

export async function getOutletsByBrand(brand: BrandKey) {
  const { data, error } = await getSupabaseClient()
    .from("outlets")
    .select(OUTLET_COLUMNS)
    .eq("brand", brand)
    .order("name", { ascending: true });

  if (error) {
    throw new Error(`Gagal memuat outlet: ${error.message}`);
  }

  return (data ?? []) as Outlet[];
}
