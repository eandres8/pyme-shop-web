export const revalidate = 604800; // 7 days

import type { Metadata, ResolvingMetadata } from 'next';
import { notFound } from "next/navigation";
import { IoLogoWhatsapp } from "react-icons/io5";

import { titleFont } from "@/src/config/fonts";
import {
  ProductMobileSlideShow,
  ProductSlideShow,
  QuantitySelector,
  SizeSelector,
  StockLabel,
} from "@/src/shared/components/product";
import { getProductBySlug } from "@/src/server/actions";

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
        <SizeSelector availableSizes={product.sizes} selectedSize="XL" />

        <QuantitySelector quantity={1} />

        <button className="flex items-center justify-center gap-2 btn-primary my-5">
          Lo quiero <IoLogoWhatsapp size={20} />
        </button>

        <h3 className="font-bold text-sm">Descripción</h3>
        <p className="font-light">{product.description}</p>
      </div>
    </article>
  );
}
