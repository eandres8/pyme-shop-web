import { IoCardOutline } from "react-icons/io5";
import clsx from "clsx";

import { Title } from "@/src/shared/components/ui";
import { getOrderById } from "@/src/server/actions";
import { redirect } from "next/navigation";
import { OrderInfo, ProductsInCart } from "@/src/shared/components/cart";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function OrderDetailPage({ params }: Props) {
  const { id } = await params;

  const resp = await getOrderById(id);

  if (!resp.success) {
    redirect("/");
  }

  const { address, orderProducts, ...order } = resp.data;
  const isPaid = order.isPaid;

  return (
    <div className="flex justify-center items-center mb-72 px-10 sm:px-0">
      <div className="flex flex-col w-250">
        <Title title={`Orden #${id.split("-").at(-1)}`} />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
          {/* Carrito */}
          <div className="flex flex-col mt-5 gap-4">
            <PaidStatus isPaid={isPaid} />

            {/* Items */}
            <ProductsInCart products={orderProducts} />
          </div>

          {/* Checkout */}
          <OrderInfo order={order} address={address}>
            <PaidStatus isPaid={isPaid} />
          </OrderInfo>
        </div>
      </div>
    </div>
  );
}

const PaidStatus: React.FC<{ isPaid: boolean; }> = ({ isPaid }) => {
  return (
    <div
      className={clsx(
        "flex items-center gap-2 rounded-lg py-2 px-3.5 text-xs font-bold text-white mb-5",
        {
          "bg-red-500": !isPaid,
          "bg-green-700": isPaid,
        },
      )}
    >
      <IoCardOutline size={30} />
      {
        isPaid
        ? <span>Pagada</span>
        : <span>Pendiente de pago</span>
      }
    </div>
  );
}
