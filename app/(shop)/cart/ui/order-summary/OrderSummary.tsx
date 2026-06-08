'use client';

import Link from "next/link";

import { useHydrateValidate } from "@/src/client/data/hooks";
import { useCartStore } from "@/src/client/stores";
import { currencyFormat } from "@/src/shared/utils";

export const OrderSummary: React.FC = () => {
  const { getSummaryInfo } = useCartStore();
  const isLoaded = useHydrateValidate();
 
  const { itemsInCart, subTotal, tax, total } = getSummaryInfo();

  if (!isLoaded) {
    return <p>Cargando...</p>;
  }
  
  return (
    <div className="flex flex-col gap-2 bg-white rounded-xl shadow-xl p-7 h-fit">
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
        <Link
          href="/checkout/address"
          className="flex btn-primary justify-center"
        >
          Checkout
        </Link>
      </div>
    </div>
  );
};
