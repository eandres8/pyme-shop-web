import { getPaginatedProductsWithImages } from "@/src/server/actions";
import { ProductGrid } from "@/src/shared/components/product/product-grid/ProductGrid";
import { Pagination, Title } from "@/src/shared/components/ui";

const subtitles: Record<string, string> = {
  men: 'Hombres',
  women: 'Mujeres',
  kid: 'Niños',
};

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ page?: string }>;
};

export default async function GlobalCategory({ params, searchParams }: Props) {
  const { id } = await params;
  const { page } = await searchParams;

  const { data, currentPage, totalPages } = await getPaginatedProductsWithImages({
    page: page ? Number(page) : undefined,
    category: id,
  });

  return (
    <>
      <Title title={`Artículos de ${subtitles[id]}`} subtitle="Todos los productos" className="mb-2" />
      <ProductGrid
        products={data}
      />

      <Pagination totalPages={totalPages} currentPage={currentPage} />
    </>
  );
}
