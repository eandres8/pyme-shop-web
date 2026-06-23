"use client";

import { useState } from "react";
import { IoLogoWhatsapp } from "react-icons/io5";

import {
  QuantitySelector,
  SizeSelector,
} from "@/src/shared/components/product";
import { Product } from "@/src/core/entities";
import type { TCartProduct, TProduct, TSize } from "@/src/core/types";
import { useCartStore } from "@/src/client/stores";
import { currencyFormat } from "@/src/shared/utils";

type Props = {
  isPremium?: boolean;
  product: Partial<TProduct>;
};

export const AddToCart: React.FC<Props> = ({ isPremium, product }) => {
  const productItem = Product.fromJson(product);

  const addProductToCart = useCartStore((state) => state.addProductToCart);

  const [size, setSize] = useState<TSize | undefined>();
  const [quantity, SetQuantity] = useState<number>(1);
  const [posted, setPosted] = useState<boolean>(false);

  const addToCart = () => {
    setPosted(true);

    if (!size) {
      return;
    }

    const cartProduct: TCartProduct = {
      id: productItem.id,
      title: productItem.title,
      slug: productItem.slug,
      size,
      image: productItem.images.at(0)!,
      price: productItem.price,
      quantity,
    };

    addProductToCart(cartProduct);

    setPosted(false);
    SetQuantity(1);
    setSize(undefined);
  };

  const sentToWhatsapp = () => () => {
    const phone = "573158258459";
    const message = `Hola! Me interesa el siguiente producto:
      - *Producto:* ${product.title}
      - *Precio:* ${currencyFormat(product.price!)}
      - *Referencia:* ${product.id}
      Por favor, confírmame disponibilidad.`;

    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  }

  return (
    <>
      {isPremium && posted && !size && (
        <span className="text-md text-red-500 fade-in">
          Debe de seleccionar una talla*
        </span>
      )}

      {isPremium && (
        <>
          <SizeSelector
            availableSizes={productItem.sizes}
            selectedSize={size}
            onSizeChanged={setSize}
          />

          <QuantitySelector quantity={quantity} onQuantityChanged={SetQuantity} />

          <button
            className="flex items-center justify-center gap-2 btn-primary my-5 cursor-pointer"
            onClick={addToCart}
          >
            Agregar al carrito
          </button>
        </>
      )}

      {!isPremium && (
        <button
          className="flex items-center justify-center gap-2 btn-primary my-5 cursor-pointer"
          onClick={sentToWhatsapp()}
        >
          Lo quiero <IoLogoWhatsapp size={20} />
        </button>
      )}
    </>
  );
};
