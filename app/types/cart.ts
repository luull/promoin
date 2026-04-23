export type CartItem = {
  id: number;
  name: string;
  image: string;
  brand: string;
  qty: number;
  price: {
    selling: number;
    original: number;
  };
  cartId: number;
  options: {
    name: string;
    value: string;
    price: number;
  }[];
};
