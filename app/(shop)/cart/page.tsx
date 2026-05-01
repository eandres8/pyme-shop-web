import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";

import { Title } from "@/src/shared/components/ui";
import { initialData } from "@/src/data/seed/seed";
import { QuantitySelector } from "@/src/shared/components/product";

const productsInCart = [...initialData.products.slice(0, 3)];

export default function CartPage() {

  // redirect('/empty');

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
            {productsInCart.map((product) => (
              <div key={product.slug} className="flex">
                <Image
                  src={`/images/products/${product.images.at(0)}`}
                  alt={product.title}
                  width={100}
                  height={100}
                  style={{
                    width: '100px',
                    height: '100px',
                  }}
                  className="mr-5 rounded"
                />

                <div>
                  <p>{product.title}</p>
                  <p>${product.price}</p>
                  <QuantitySelector quantity={3} />
                  <button className="underline mt-3">Remover</button>
                </div>
              </div>
            ))}
          </div>

          {/* Checkout */}
          <div className="flex flex-col gap-2 bg-white rounded-xl shadow-xl p-7 h-fit">
            <h2 className="text-2xl mb-2 font-semibold">Resumen de orden</h2>

            <div className="flex flex-col mb-2">
              <div className="flex justify-between">
                <span>No. Productos</span>
                <span>{productsInCart.length} artículos</span>
              </div>
              
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>$ 1200</span>
              </div>
              
              <div className="flex justify-between">
                <span>Impuestos (15%)</span>
                <span>$ 1200</span>
              </div>
              
              <div className="flex justify-between mt-2">
                <span className="text-2xl">Total:</span>
                <span className="text-2xl text-right">$ 1200</span>
              </div>
            </div>

            <div className="mb-2 w-full">
              <Link href="/checkout/address" className="flex btn-primary justify-center">
                Checkout
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
