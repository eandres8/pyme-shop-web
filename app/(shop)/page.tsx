export const revalidate = 86400; // 24 horas

import { PageNotFound, Pagination, Title } from "@/src/shared/components/ui";
import { ProductGrid } from "@/src/shared/components/product";
import { getPaginatedProductsWithImages } from "@/src/server/actions";

type Props = {
  searchParams: Promise<{ page?: string }>;
};

export default async function MainPage({ searchParams }: Props) {
  const { page } = await searchParams;

  const { data, currentPage, totalPages } = await getPaginatedProductsWithImages({
    page: page ? Number(page) : undefined,
  });

  return (
    <>
      <Title title="Tienda" subtitle="Todos los productos" className="mb-2" />

      {
        !data.length && <PageNotFound />
      }

      {data.length && (
        <>
          <ProductGrid products={data} />

          <Pagination totalPages={totalPages} currentPage={currentPage} />
        </>
      )}
    </>
  );
}
