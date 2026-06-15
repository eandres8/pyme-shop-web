import type { TFormUserAddress } from "@/src/core/types";
import { currencyFormat } from "@/src/shared/utils";

type Props = {
  address: TFormUserAddress;
  order: {
    tax: number;
    total: number;
    subTotal: number;
    itemsInCart: number;
  };
  children: React.ReactNode;
};

export const OrderInfo: React.FC<Props> = ({ address, order, children }) => {
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
          <span>{order.itemsInCart} artículos</span>
        </div>

        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>{currencyFormat(order.subTotal)}</span>
        </div>

        <div className="flex justify-between">
          <span>Impuestos (15%)</span>
          <span>{currencyFormat(order.tax)}</span>
        </div>

        <div className="flex justify-between mt-2">
          <span className="text-2xl">Total:</span>
          <span className="text-2xl text-right">{currencyFormat(order.total)}</span>
        </div>
      </div>

      {children}
    </div>
  );
};
