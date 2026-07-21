import { notFound, permanentRedirect } from "next/navigation";

import { getProductBySlug } from "@/src/server/actions";

type Props = {
  params: Promise<{ slug: string }>;
};

/**
 * Legacy `/product/<slug>` URLs redirect to the slug-scoped
 * `/<store-slug>/product/<slug>`, resolving the owning tenant from the
 * product's `tenant_id`. Unknown products 404 (no redirect).
 */
export default async function LegacyProductRedirect({ params }: Props) {
  const { slug } = await params;

  const product = await getProductBySlug(slug);

  if (!product.id || !product.tenant.slug) {
    notFound();
  }

  permanentRedirect(`/${product.tenant.slug}/product/${slug}`);
}
