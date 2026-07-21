import { notFound } from "next/navigation";

import { PageNotFound, Pagination, Title } from "@/src/shared/components/ui";
import { ProductGrid } from "@/src/shared/components/product";
import { getPaginatedProductsWithImages } from "@/src/server/actions";
import { getTenantBySlug } from "@/src/server/actions/tenant/get-tenant-by-slug/get-tenant-by-slug";

type Props = {
  params: Promise<{ storeSlug: string }>;
  searchParams: Promise<{ page?: string }>;
};

export default async function StoreHomePage({ params, searchParams }: Props) {
  const { storeSlug } = await params;
  const { page } = await searchParams;

  const tenant = await getTenantBySlug(storeSlug);

  if (!tenant) {
    notFound();
  }

  const { data, currentPage, totalPages } = await getPaginatedProductsWithImages({
    page: page ? Number(page) : undefined,
    tenantId: tenant.id,
  });

  return (
    <>
      <Title title={tenant.name} subtitle="Todos los productos" className="mb-2" />

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
