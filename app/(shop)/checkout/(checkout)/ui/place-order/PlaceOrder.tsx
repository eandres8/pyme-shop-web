"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import clsx from "clsx";

import { useHydrateValidate } from "@/src/client/data/hooks";
import { useAddressStore, useCartStore } from "@/src/client/stores";
import { placeOrder } from "@/src/server/actions";
import { OrderInfo } from "@/src/shared/components/cart";

export const PlaceOrder: React.FC = () => {
  const isLoaded = useHydrateValidate();
  const router = useRouter();
  const address = useAddressStore((state) => state.address);
  const cart = useCartStore((state) => state.cart);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [errMessage, setErrMessage] = useState('');
  const { getSummaryInfo } = useCartStore();
  const clearCart = useCartStore(state => state.clearCart);

  const order = getSummaryInfo();

  const onPlaceOrder = async () => {
    setIsPlacingOrder(true);
    setErrMessage('');

    const productsToOrder = cart.map((c) => ({
      productId: c.id,
      quantity: c.quantity,
      size: c.size,
    }));

    const result = await placeOrder(productsToOrder, address);

    if (!result.success) {
      setErrMessage(result.message);
      setIsPlacingOrder(false);
      return;
    }

    clearCart();
    router.replace(`/orders/${result.data?.id}`);
  };

  if (!isLoaded) {
    return <p>Cargando...</p>;
  }

  return (
    <OrderInfo order={order} address={address}>
      <div className="mb-2 w-full">
        <p className="mb-5">
          <span className="text-xs">
            Al hacer clic en &quot;Generar orden&quot;, aceptas nuestros{" "}
            <a href="#" className="underline">
              Terminos y condiciones
            </a>{" "}
            y nuestras{" "}
            <a href="#" className="underline">
              políticas de privacidad
            </a>
            .
          </span>
        </p>

        {
          errMessage && <p className="text-red-500 text-sm mb-2">*{errMessage}</p>
        }

        <button
          // href="/orders/123"
          onClick={onPlaceOrder}
          className={clsx({
            "btn-primary": !isPlacingOrder,
            "btn-disabled": isPlacingOrder,
          })}
        >
          Generar orden
        </button>
      </div>
    </OrderInfo>
  );
};
