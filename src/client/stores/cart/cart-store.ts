import { create } from "zustand";
import { persist } from "zustand/middleware";

import { TCartProduct } from "@/src/core/types";

type CartState = {
  cart: TCartProduct[];

  getTotalItems: () => number;
  getSummaryInfo: () => {
    tax: number;
    total: number;
    subTotal: number;
    itemsInCart: number;
  };

  addProductToCart: (product: TCartProduct) => void;
  updateProductQuantity: (product: TCartProduct, quantity: number) => void;
  removeProduct: (product: TCartProduct) => void;
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      cart: [],

      getTotalItems: () => {
        const cartItems = get().cart as TCartProduct[];

        return cartItems.reduce((prev, { quantity }) => prev + quantity, 0);
      },
      // END getTotalItems
      getSummaryInfo: () => {
        const { cart } = get();

        const subTotal = cart.reduce((prev, item) => {
          return prev + ( item.quantity * item.price );
        }, 0);
        const tax = subTotal * 0.15;
        const total = subTotal + tax;
        const itemsInCart = cart.reduce((prev, { quantity }) => prev + quantity, 0);

        return {
          tax,
          total,
          subTotal,
          itemsInCart,
        };
      },
      // END getSummaryInfo
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
      // END addProductToCart
      updateProductQuantity: (product: TCartProduct, quantity: number) => {
        set(({ cart }) => ({
          cart: cart.map((item) =>
            item.id === product.id && item.size === product.size
              ? { ...item, quantity }
              : item,
          ),
        }));
      },
      // END updateProductQuantity
      removeProduct: (product: TCartProduct) => {
        set(({ cart }) => ({
          cart: cart.filter(
            (item) => item.id !== product.id || item.size !== product.size,
          ),
        }));
      },
    }),
    {
      name: "pyme-shop",
    },
  ),
);
