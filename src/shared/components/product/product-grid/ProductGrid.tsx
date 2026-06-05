import { Product } from "@/src/core/entities/product.entity";
import { ProductGridItem } from "./ProductGridItem";

type Props = {
  products: Product[];
};

export const ProductGrid: React.FC<Props> = ({ products }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-10 mb-10">
      {
        products.map((product) => (
          <ProductGridItem key={product.slug} product={product.toJson()} />
        ))
      }
    </div>
  )
}
