"use client";

import Image from "next/image";

import { currencyFormat } from "@/src/shared/utils";
import type { TCartProduct } from "@/src/core/types";

type Props = {
  products: TCartProduct[];
};

export const ProductsInCart: React.FC<Props> = ({ products }) => {
  return (
    <>
      {products.map((product) => (
        <div key={`${product.slug}.${product.size}`} className="flex">
          <Image
            src={`/images/products/${product.image}`}
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
            <span>
              <p>
                {product.size} - {product.title} ({product.quantity})
              </p>
            </span>
            <p className="font-bold">{currencyFormat(product.price * product.quantity)}</p>
          </div>
        </div>
      ))}
    </>
  );
};
