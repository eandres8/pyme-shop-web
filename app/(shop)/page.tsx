import { PageNotFound } from "@/src/shared/components/ui/not-found/PageNotFound";
import { Pagination } from "@/src/shared/components/ui/pagination/Pagination";
import { Title } from "@/src/shared/components/ui/title/Title";
import { ProductGrid } from "@/src/shared/components/product/product-grid/ProductGrid";
import { getPaginatedProductsWithImages } from "@/src/server/actions";

type Props = {
  searchParams: Promise<{ page?: string }>;
};

export default async function GlobalHomePage({ searchParams }: Props) {
  const { page } = await searchParams;

  const { data, currentPage, totalPages } = await getPaginatedProductsWithImages({
    page: page ? Number(page) : undefined,
  });

  return (
    <>
      <Title title="Catálogo" subtitle="Todos los productos" className="mb-2" />

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
