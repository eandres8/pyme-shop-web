import { notFound } from "next/navigation";

import { getPaginatedProductsWithImages } from "@/src/server/actions";
import { getTenantBySlug } from "@/src/server/actions/tenant/get-tenant-by-slug/get-tenant-by-slug";
import { ProductGrid } from "@/src/shared/components/product";
import { Pagination, Title } from "@/src/shared/components/ui";


const subtitles: Record<string, string> = {
  men: 'Hombres',
  women: 'Mujeres',
  kid: 'Niños',
};

type Props = {
  params: Promise<{ storeSlug: string; id: string }>;
  searchParams: Promise<{ page?: string }>;
};

export default async function Category({ params, searchParams }: Props) {
  const { storeSlug, id } = await params;
  const { page, } = await searchParams;

  const tenant = await getTenantBySlug(storeSlug);

  if (!tenant) {
    notFound();
  }

  const { data, currentPage, totalPages } = await getPaginatedProductsWithImages({
    page: page ? Number(page) : undefined,
    category: id,
    tenantId: tenant.id,
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
