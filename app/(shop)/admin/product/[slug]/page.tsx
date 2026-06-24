import { redirect } from "next/navigation";

import { getCategoryList, getProductBySlug } from "@/src/server/actions";
import { Title } from "@/src/shared/components/ui";
import { ProductForm } from "./ui/product-form/ProductForm";
import type { TProductData } from "@/src/core/types";

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function AdminProductPage({ params }: Props) {
  const { slug } = await params;

  const [product, categoryList] = await Promise.all([
    getProductBySlug(slug),
    getCategoryList(),
  ]);

  if (!product) {
    redirect('/admin/products');
  }

  const title = slug === 'new' ? 'Nuevo producto' : 'Editar producto';

  return (
    <article>
      <Title title={title} />

      <ProductForm
        product={product.toPlain() as TProductData}
        categories={categoryList}
      />
    </article>
  );
}