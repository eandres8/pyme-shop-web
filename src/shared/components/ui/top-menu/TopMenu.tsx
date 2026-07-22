'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { IoSearchOutline, IoCartOutline } from 'react-icons/io5';

import { titleFont } from "@/src/config/fonts";
import { useCartStore, useTenantStore, useUIStore } from "@/src/client/stores";
import { useHydrateValidate } from "@/src/client/data/hooks";
import { textFormat } from "@/src/shared/utils";

// First segments that are NOT store slugs (session-scoped / global areas).
// On these routes there is no store context so storefront links fall back to root.
export const NON_STORE_SEGMENTS = new Set([
  "admin", "cart", "checkout", "orders", "profile", "products",
  "empty", "search", "auth", "api", "product", "category", "landing",
]);

export const TopMenu = () => {
  const closeMenu = useUIStore((state) => state.openSideMenu);
  const totalItemsInCart = useCartStore((state) => state.getTotalItems());
  const tenantName = useTenantStore((state) => state.name);
  const pathname = usePathname();

  const isLoaded = useHydrateValidate();

  const firstSegment = pathname.split("/").filter(Boolean)[0];
  const storeSlug = firstSegment && !NON_STORE_SEGMENTS.has(firstSegment) ? firstSegment : "";
  const storeBase = storeSlug ? `/${storeSlug}` : "";

  const brandSuffix = textFormat(tenantName || "Shop").toTitle();

  return (
    <nav className="flex px-5 justify-between items-center w-full">
      <div>
        <Link href={storeBase || "/"}>
          <span className={`${titleFont.className} antialiased font-bold`}>Pyme</span>
          <span> | {brandSuffix}</span>
        </Link>
      </div>

      <div className="hidden sm:block">
        <Link className="m-2 p-2 rounded-md transition-all hover:bg-gray-100" href={`${storeBase}/category/men`}>Hombres</Link>
        <Link className="m-2 p-2 rounded-md transition-all hover:bg-gray-100" href={`${storeBase}/category/women`}>Mujeres</Link>
        <Link className="m-2 p-2 rounded-md transition-all hover:bg-gray-100" href={`${storeBase}/category/kid`}>Niños</Link>
        {/* <Link className="m-2 p-2 rounded-md transition-all hover:bg-gray-100" href={`${storeBase}/category/pets`}>Mascotas</Link> */}
      </div>

      <div className="flex items-center">
        <Link href="/search" className="mx-2">
          <IoSearchOutline className="w-5 h-5" />
        </Link>
        <Link href={
          (totalItemsInCart === 0 && isLoaded)
          ? "/empty"
          : "/cart"
        } className="mx-2">
          <span className="relative">
            {
              (isLoaded && totalItemsInCart > 0) && (
                <span className="absolute text-xs rounded-full px-1 font-bold -top-2 -right-2 bg-blue-700 text-white fade-in">
                  {totalItemsInCart}
                </span>
              )
            }
            <IoCartOutline className="w-5 h-5" />
          </span>
        </Link>
        <button
          className="m-2 p-2 rounded-md transition-all hover:bg-gray-100 cursor-pointer"
          onClick={closeMenu}
        >
          Menú
        </button>
      </div>
    </nav>
  )
}
