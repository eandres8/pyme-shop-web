import Image from "next/image";
import { IoCheckmark } from "react-icons/io5";

export default async function HomePage() {

  return (
    <>
      <article className="flex flex-col md:flex-row justify-center p-4 md:p-10 gap-2 md:gap-6 md:mb-10">
        <section className="flex flex-col p-4 justify-center gap-4 w-full md:w-5/12" id="home">
          <h1 className="text-4xl w-3/5">
            Catálogo en linea
          </h1>
          <p className="max-w-2xs">
            Ingresa al mundo de las tiendas virtuales de una forma facil y crece tu negocio sin preocupaciones extras.
          </p>
        </section>
        <section className="flex p-4 w-full md:w-7/12">
          <Image
            src="/images/landing_store.png"
            className="p-5 sm:p-0"
            width={700}
            height={700}
            alt="Landing page for web info"
          />
        </section>
      </article>

      <article className="flex flex-col justify-center p-4 gap-2 w-full mb-2 md:mb-10">
        <h2 className="text-xl font-bold mb-2 md:mb-4 text-gray-400" id="pricing">Precios</h2>
        <div className="flex flex-col md:flex-row justify-center gap-2 md:gap-10">
          <section className="border border-gray-100 rounded-md p-4">
            <div className="flex flex-col gap-4 w-3xs">
              <h3 className="font-semibold text-2xl text-center">Free</h3>
              <p className="flex gap-1 items-center">
                <IoCheckmark />
                <span>nombre de tienda</span>
              </p>
              <p className="flex gap-1 items-center">
                <IoCheckmark />
                <span>1 cuenta administrativa</span>
              </p>
              <p className="flex gap-1 items-center">
                <IoCheckmark />
                <span>25 productos</span>
              </p>
              <p className="flex gap-1 items-center">
                <IoCheckmark />
                <span>Pedidos por whatsapp</span>
              </p>
            </div>
          </section>
          <section className="border border-gray-100 rounded-md p-4">
            <div className="flex flex-col gap-4 w-3xs">
              <h3 className="font-semibold text-xl text-center">$25.000 / mes</h3>
              <p className="flex gap-1 items-center">
                <IoCheckmark />
                <span>nombre de tienda</span>
              </p>
              <p className="flex gap-1 items-center">
                <IoCheckmark />
                <span>5 cuenta administrativas</span>
              </p>
              <p className="flex gap-1 items-center">
                <IoCheckmark />
                <span>productos ilimitados</span>
              </p>
              <p className="flex gap-1 items-center">
                <IoCheckmark />
                <span>Pedidos por whatsapp</span>
              </p>
              <p className="flex gap-1 items-center">
                <IoCheckmark />
                <span>Pagos en linea</span>
              </p>
              <p className="flex gap-1 items-center">
                <IoCheckmark />
                <span>Gestión de ordenes de pedidos</span>
              </p>
            </div>
          </section>
        </div>
      </article>
    </>
  );
}
