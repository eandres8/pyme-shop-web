import { create } from "zustand";
import { persist } from "zustand/middleware";

import { TCartProduct } from "@/src/core/types";

type CartState = {
  cart: TCartProduct[];

  getTotalItems: () => number;

  addProductToCart: (product: TCartProduct) => void;
  // updateProductQuantity
  // removeProduct
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      cart: [],

      getTotalItems: () => {
        const cartItems = (get().cart as TCartProduct[]);
        console.log({ cartItems });
        return cartItems.reduce((prev, { quantity }) => prev + quantity, 0);
      },
      addProductToCart: (product: TCartProduct) => {
        const { cart } = get();

        const hasProduct = cart.some(
          (item) => item.id === product.id && item.size === product.size,
        );

        if (!hasProduct) {
          set({ cart: [...cart, product] });
          return;
        }

        set({
          cart: cart.map((item) =>
            item.id === product.id && item.size === product.size
              ? product
              : item,
          ),
        });
      },
    }),
    {
      name: "pyme-shop",
    },
  ),
);
