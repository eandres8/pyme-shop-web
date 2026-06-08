/* eslint-disable react/no-unescaped-entities */
import Link from "next/link";
import Image from "next/image";

import { Title } from "@/src/shared/components/ui";
import { Product } from "@/src/core/entities";

const productsInCart: Product[] = [];

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
              Editar compra
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
                  <p>${product.price} x 3</p>
                  <p className="font-bold">Subtotal: ${product.price * 3}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Checkout */}
          <div className="flex flex-col gap-2 bg-white rounded-xl shadow-xl p-7 h-fit">
            <h2 className="text-2xl mb-2 font-semibold">Dirección de entrega</h2>
            <div className="mb-5">
              <p>Jhon Wick</p>
              <p>Calle fake 123</p>
              <p>Col. Centro</p>
              <p>Bogotá, Colombia</p>
            </div>

            <div className="w-full h-0.5 rounded bg-gray-200 mb-2" />

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
              <p className="mb-5">
                <span className="text-xs">
                  Al hacer clic en "Generar orden", aceptas nuestros <a href="#" className="underline">Terminos y condiciones</a> y nuestras <a href="#" className="underline">políticas de privacidad</a>.
                </span>
              </p>
              <Link href="/orders/123" className="flex btn-primary justify-center">
                Generar orden
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
