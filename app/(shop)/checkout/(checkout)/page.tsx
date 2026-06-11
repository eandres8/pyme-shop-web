import Link from "next/link";

import { Title } from "@/src/shared/components/ui";
import { ProductsInCart } from "./ui/products-in-cart/ProductsInCart";
import { PlaceOrder } from "./ui/place-order/PlaceOrder";

export default function CheckoutPage() {
  return (
    <div className="flex justify-center items-center mb-72 px-10 sm:px-0">
      <div className="flex flex-col w-250">
        <Title title="Verificar orden" />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
          {/* Carrito */}
          <div className="flex flex-col mt-5 gap-4">
            <span className="text-xl">Ajustar elementos</span>
            <Link href="/cart" className="underline mb-5">
              Editar elementos del carrito
            </Link>

            <ProductsInCart /> 
          </div>

          {/* Checkout */}
          <PlaceOrder />
        </div>
      </div>
    </div>
  );
}
