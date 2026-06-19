"use client";

import Link from "next/link";

import { ProductImage, QuantitySelector } from "@/src/shared/components/product";
import { useCartStore } from "@/src/client/stores";
import { useHydrateValidate } from "@/src/client/data/hooks";

export const ProductCartList: React.FC = () => {
  const products = useCartStore((state) => state.cart);
  const updateProductQuantity = useCartStore(
    (state) => state.updateProductQuantity,
  );
  const removeProduct = useCartStore((state) => state.removeProduct);
  const isLoaded = useHydrateValidate();

  if (!isLoaded) {
    return <p>Cargando...</p>;
  }

  return (
    <>
      {products.map((product) => (
        <div key={`${product.slug}.${product.size}`} className="flex">
          <ProductImage
            src={product.image}
            alt={product.title}
            width={100}
            height={100}
            style={{
              width: "100px",
              height: "100px",
            }}
            className="mr-5 rounded"
          />

          <div>
            <Link
              className="hover:underline cursor-pointer"
              href={`/product/${product.slug}`}
            >
              <p>
                {product.size} - {product.title}
              </p>
            </Link>
            <p>${product.price}</p>
            <QuantitySelector
              quantity={product.quantity}
              onQuantityChanged={(quantity: number) =>
                updateProductQuantity(product, quantity)
              }
            />
            <button
              className="cursor-pointer underline mt-3"
              onClick={() => removeProduct(product)}
            >
              Remover
            </button>
          </div>
        </div>
      ))}
    </>
  );
};
