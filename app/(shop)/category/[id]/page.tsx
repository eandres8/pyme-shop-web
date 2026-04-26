import { notFound } from "next/navigation";

import { Product } from "@/src/core/entities";
import { initialData } from "@/src/data/seed/seed";
import { ProductGrid } from "@/src/shared/components/product";
import { Title } from "@/src/shared/components/ui";

const products = initialData.products.map((p) =>
  Product.fromJson({
    ...p,
    in_stock: p.inStock,
  }),
);

const subtitles: Record<string, string> = {
  men: 'Hombres',
  women: 'Mujeres',
  kid: 'Niños',
};

type Props = {
  params: Promise<{ id: string }>;
};

export default async function Category({ params }: Props) {
  const { id } = await params;

  if (!['men', 'women', 'kid'].includes(id)) {
    notFound();
  }

  const filteredProducts = products.filter((p) => p.gender === id);

  return (
    <>
      <Title title={`Artículos de ${subtitles[id]}`} subtitle="Todos los productos" className="mb-2" />
      <ProductGrid
        products={filteredProducts}
      />
    </>
  ); 
}
