export type CartItem = {
  id: number;
  name: string;
  image: string;
  qty: number;
  price: {
    selling: number;
    original: number;
  };
  cartId: number;
  espresso?: string;
  sweet?: string;
};
