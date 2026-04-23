/* eslint-disable @typescript-eslint/no-explicit-any */
export const getCart = () => {
  if (typeof window === "undefined") return [];
  return JSON.parse(localStorage.getItem("cart") || "[]");
};

export const saveCart = (cart: any[]) => {
  localStorage.setItem("cart", JSON.stringify(cart));
};

export const addToCart = (product: any, qty: number = 1) => {
  const cart = getCart();

  cart.push({
    ...product,
    qty,
    cartId: `${Date.now()}-${Math.random()}`,
  });

  saveCart(cart);

  window.dispatchEvent(new Event("cart:update"));
};
export const removeFromCart = (cartId: number) => {
  const cart = getCart().filter((item: any) => item.cartId !== cartId);
  saveCart(cart);
};
