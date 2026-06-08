import Link from "next/link";

import { Title } from "@/src/shared/components/ui";
import { ProductCartList } from "./ui/product-cart-list/ProductCartList";
import { OrderSummary } from "./ui/order-summary/OrderSummary";

export default function CartPage() {
  return (
    <div className="flex justify-center items-center mb-72 px-10 sm:px-0">
      <div className="flex flex-col w-250">
        <Title title="Carrito" />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
          {/* Carrito */}
          <div className="flex flex-col mt-5 gap-4">
            <span className="text-xl">Agregar mas items</span>
            <Link href="/" className="underline mb-5">
              Continua comprando
            </Link>

            {/* Items */}
            <ProductCartList />
            
          </div>

          {/* Checkout */}
          <OrderSummary />
        </div>
      </div>
    </div>
  );
}
