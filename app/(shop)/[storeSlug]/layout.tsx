import { notFound } from "next/navigation";

import { getTenantBySlug } from "@/src/server/actions/tenant/get-tenant-by-slug/get-tenant-by-slug";
import { tenantRepository } from "@/src/server/providers";
import { TenantProvider } from "@/src/client/providers/tenant-provider/tenant-provider";

// Per-store ISR: pre-render known store slugs, generate unknown ones on demand
// and revalidate them within this window (moved off the former global home page).
export const revalidate = 86400; // 24 horas

export async function generateStaticParams() {
  const result = await tenantRepository.listSlugs();

  if (!result.isOk) {
    return [];
  }

  return result.data.map((storeSlug) => ({ storeSlug }));
}

type Props = {
  children: React.ReactNode;
  params: Promise<{ storeSlug: string }>;
};

export default async function StoreLayout({ children, params }: Props) {
  const { storeSlug } = await params;

  const tenant = await getTenantBySlug(storeSlug);

  if (!tenant) {
    notFound();
  }

  return (
    <>
      <TenantProvider name={tenant.name} slug={tenant.slug} />
      {children}
    </>
  );
}
