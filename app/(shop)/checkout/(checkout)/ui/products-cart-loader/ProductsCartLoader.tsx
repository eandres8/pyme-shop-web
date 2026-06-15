"use client";

import { useCartStore } from "@/src/client/stores";
import { useHydrateValidate } from "@/src/client/data/hooks";
import { ProductsInCart } from "@/src/shared/components";

export const ProductsCartLoader: React.FC = () => {
  const products = useCartStore((state) => state.cart);
  const isLoaded = useHydrateValidate();

  if (!isLoaded) {
    return <p>Cargando...</p>;
  }

  return (
    <ProductsInCart products={products} />
  );
}