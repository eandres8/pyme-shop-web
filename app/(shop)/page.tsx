import { Title } from "@/src/shared/components/ui";
import { initialData } from "@/src/data/seed/seed";
import { ProductGrid } from "@/src/shared/components/product";
import { Product } from "@/src/core/entities/product.entity";
import { getPaginatedProductsWithImages } from "@/src/actions";

const products = initialData.products.map((p) =>
  Product.fromJson({
    ...p,
    in_stock: p.inStock,
  }),
);

export default async function Home() {

  const productsTemp = await getPaginatedProductsWithImages();


  return (
    <>
      <Title title="Tienda" subtitle="Todos los productos" className="mb-2" />
      <ProductGrid
        products={products}
      />
    </>
  );
}
