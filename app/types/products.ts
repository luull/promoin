export const brands = [
  {
    id: "fore",
    name: "Fore Coffee",
    tagline: "Everyday Fresh Coffee",
    logo: "/logos/fore.png",
    bg: "bg-green-100",
    button: "bg-green-600 text-white",
    border: "border-green-500",
  },
  {
    id: "kopken",
    name: "Kopi Kenangan",
    tagline: "Daily Fresh Drinks",
    logo: "/logos/kopi-kenangan.png",
    bg: "bg-red-100",
    button: "bg-black text-white",
    border: "border-red-500",
  },
  {
    id: "tomoro",
    name: "Tomoro Coffee",
    tagline: "Fresh Everyday Coffee",
    logo: "/logos/tomoro.png",
    bg: "bg-orange-100",
    button: "bg-black text-white",
    border: "border-orange-500",
  },
  {
    id: "starbuck",
    name: "Starbucks",
    tagline: "Everyday Fresh Coffee",
    logo: "/logos/starbuck.png",
    bg: "bg-green-200",
    button: "bg-green-600 text-white",
    border: "border-green-500",
  },
];

export interface Product {
  id: number;
  product_id: string;
  image: string;
  name: string;
  category: string;
  brand: string;
  desc: string;
  price: {
    original: number;
    selling: number;
  };
  is_active: boolean;
  has_options: boolean;
  fields_format: string;
}

export type BrandKey = "fore" | "kopken" | "tomoro" | "starbuck";
