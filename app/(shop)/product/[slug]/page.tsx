export const revalidate = 604800; // 7 days

import type { Metadata, ResolvingMetadata } from 'next';
import { notFound } from "next/navigation";


import { titleFont } from "@/src/config/fonts";
import {
  ProductMobileSlideShow,
  ProductSlideShow,
  StockLabel,
} from "@/src/shared/components/product";
import { getProductBySlug } from "@/src/server/actions";
import { AddToCart } from './ui/add-to-cart/AddToCart';
import { textFormat } from '@/src/shared/utils';

type Props = {
  params: Promise<{ slug: string }>;
};
 
export async function generateMetadata(
  { params }: Props,
  _parent: ResolvingMetadata
): Promise<Metadata> {
  const slug = (await params).slug
 
  const product = await getProductBySlug(slug);
 
  return {
    title: product.title,
    description: product.description,
    openGraph: {
      title: product.title,
      description: product.description,
      images:[`/images/products/${product.images.at(1)}`]
    }
  }
}

export default async function ProductDetail({ params }: Props) {
  const { slug } = await params;

  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const isPremium = false;

  return (
    <article className="md:mt-5 mb-20 grid grid-cols-1 md:grid-cols-3 gap-3">
      <div className="col-span-1 md:col-span-2">
        {/* Mobile */}
        <ProductMobileSlideShow images={product.images} title={product.title} className="block md:hidden" />
        
        {/* Desktop */}
        <ProductSlideShow images={product.images} title={product.title} className="hidden md:block" />
      </div>

      <div className="col-span-1 px-5">
        <StockLabel slug={product.slug} />

        <h1 className={`${titleFont.className} antialiased font-bold text-xl`}>
          {product.title}
        </h1>
        <p className="text-lg mb-5">${product.price}</p>
        
        <AddToCart product={product.toJson()} isPremium={isPremium} />

        <p className="flex gap-1 items-center">
          tienda: 
          <span className="text-sm px-2 py-1 rounded-xl bg-gray-100">
            {textFormat(product.tenant.name).toTitle()}
          </span>
        </p>
        <h3 className="font-bold text-sm mt-4">Descripción</h3>
        <p className="font-light">{product.description}</p>
      </div>
    </article>
  );
}
