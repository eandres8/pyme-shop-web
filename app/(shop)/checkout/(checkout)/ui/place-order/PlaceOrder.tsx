"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import clsx from "clsx";

import { useHydrateValidate } from "@/src/client/data/hooks";
import { useAddressStore, useCartStore } from "@/src/client/stores";
import { currencyFormat } from "@/src/shared/utils";
import { placeOrder } from "@/src/server/actions";

export const PlaceOrder: React.FC = () => {
  const isLoaded = useHydrateValidate();
  const router = useRouter();
  const address = useAddressStore((state) => state.address);
  const cart = useCartStore((state) => state.cart);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [errMessage, setErrMessage] = useState('');
  const { getSummaryInfo } = useCartStore();
  const clearCart = useCartStore(state => state.clearCart);

  const { itemsInCart, subTotal, tax, total } = getSummaryInfo();

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
    <div className="flex flex-col gap-2 bg-white rounded-xl shadow-xl p-7 h-fit">
      <h2 className="text-2xl mb-2 font-semibold">Dirección de entrega</h2>
      <div className="mb-5">
        <p className="text-xl">
          {address.firstName} {address.lastName}
        </p>
        <p>{address.address}</p>
        <p>{address.addressInfo || "-"}</p>
        <p>
          {address.city}, {address.country}
        </p>
      </div>

      <div className="w-full h-0.5 rounded bg-gray-200 mb-2" />

      <h2 className="text-2xl mb-2 font-semibold">Resumen de orden</h2>

      <div className="flex flex-col mb-2">
        <div className="flex justify-between">
          <span>No. Productos</span>
          <span>{itemsInCart} artículos</span>
        </div>

        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>{currencyFormat(subTotal)}</span>
        </div>

        <div className="flex justify-between">
          <span>Impuestos (15%)</span>
          <span>{currencyFormat(tax)}</span>
        </div>

        <div className="flex justify-between mt-2">
          <span className="text-2xl">Total:</span>
          <span className="text-2xl text-right">{currencyFormat(total)}</span>
        </div>
      </div>

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
    </div>
  );
};
