import { notFound } from "next/navigation";

import { initialData } from "@/src/data/seed/seed";
import { titleFont } from "@/src/config/fonts";
import { QuantitySelector, SizeSelector } from "@/src/shared/components/product";

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function ProductDetail({ params }: Props) {
  const { slug } = await params;

  const product = initialData.products.find((p) => p.slug === slug);

  if (!product) {
      notFound();
    }

  return (
    <article className="mt-5 mb-20 grid grid-cols-1 md:grid-cols-3 gap-3">
      <div className="col-span-1 md:col-span-2">
        <h1>Hola mundo</h1>
      </div>

      <div className="col-span-1 px-5">
        <h1 className={`${titleFont.className} antialiased font-bold text-xl`}>
          {product.title}
        </h1>
        <p className="text-lg mb-5">
          ${product.price}
        </p>
        <SizeSelector availableSizes={product.sizes} selectedSize="XL" />

        <QuantitySelector quantity={1} />

        <button className="btn-primary my-5">
          Agregar al carrito
        </button>
        <h3 className="font-bold text-sm">Descripción</h3>
        <p className="font-light">{product.description}</p>
      </div>
    </article>
  );
}
