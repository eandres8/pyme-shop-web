export const revalidate = 86400; // 24 horas

import { redirect } from "next/navigation";

import { Pagination, Title } from "@/src/shared/components/ui";
import { ProductGrid } from "@/src/shared/components/product";
import { getPaginatedProductsWithImages } from "@/src/server/actions";

type Props = {
  searchParams: Promise<{ page?: string }>;
};

export default async function Home({ searchParams }: Props) {
  const { page } = await searchParams;

  const { data, currentPage, totalPages } = await getPaginatedProductsWithImages({
    page: page ? Number(page) : undefined,
  });

  if (!data.length) {
    redirect('/');
  }

  return (
    <>
      <Title title="Tienda" subtitle="Todos los productos" className="mb-2" />
      <ProductGrid
        products={data}
      />

      <Pagination totalPages={totalPages} currentPage={currentPage} /> 
    </>
  );
}
