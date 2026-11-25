import { BrandKey } from "./products";

export type Outlet = {
  id: number;
  brand: BrandKey;
  name: string;
  city_or_regency: string | null;
  city: string | null;
  regency: string | null;
  area: string | null;
  address: string | null;
  opening_hours_displayed: string | null;
  opening_hours: string | null;
  phone: string | null;
};
