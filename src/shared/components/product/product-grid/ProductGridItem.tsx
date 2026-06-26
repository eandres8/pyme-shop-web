'use client';

import { useState } from "react";
import Link from "next/link";

import type { TProduct } from "@/src/core/types";
import { Product } from "@/src/core/entities";
import { ProductImage } from "../product-image/ProductImage";
import { currencyFormat } from "@/src/shared/utils";

type Props = {
  product: Partial<TProduct>;
};

export const ProductGridItem: React.FC<Props> = ({ product: p }) => {
  const product = Product.fromJson(p);
  const [displayImage, setDisplayImage] = useState(product.images.at(0));

  return (
    <div className="rounde-md overflow-hidden fade-in">
      <Link
        href={`/product/${product.slug}`}
        onMouseEnter={() => setDisplayImage(product.images.at(1))}
        onMouseLeave={() => setDisplayImage(product.images.at(0))}
      >
        <ProductImage
          className="w-full object-cover"
          width={500}
          height={500}
          src={displayImage}
          alt={product.title}
        />
      </Link>
      <div className="p-4 flex flex-col">
        <Link className="hover:text-blue-600 hover:cursor-pointer" href={`/product/${product.slug}`}>{product.title}</Link>
        <div className="flex justify-between">
          <span className="font-bold">{currencyFormat(product.price)}</span>
          <span className="text-sm px-2 py-1 rounded-xl bg-gray-100">{product.tenant.name}</span>
        </div>
      </div>
    </div>
  );
};
