'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { IoSearchOutline, IoCartOutline } from 'react-icons/io5';

import { titleFont } from "@/src/config/fonts";
import { useCartStore, useUIStore } from "@/src/client/stores";

export const TopMenu = () => {
  const closeMenu = useUIStore((state) => state.openSideMenu);
  const totalItemsInCart = useCartStore((state) => state.getTotalItems());

  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoaded(true);
  }, [loaded]);

  return (
    <nav className="flex px-5 justify-between items-center w-full">
      <div>
        <Link href="/">
          <span className={`${titleFont.className} antialiased font-bold`}>Pyme</span>
          <span> | Shop</span>
        </Link>
      </div>

      <div className="hidden sm:block">
        <Link className="m-2 p-2 rounded-md transition-all hover:bg-gray-100" href="/category/men">Hombres</Link>
        <Link className="m-2 p-2 rounded-md transition-all hover:bg-gray-100" href="/category/women">Mujeres</Link>
        <Link className="m-2 p-2 rounded-md transition-all hover:bg-gray-100" href="/category/kid">Niños</Link>
        {/* <Link className="m-2 p-2 rounded-md transition-all hover:bg-gray-100" href="/category/pets">Mascotas</Link> */}
      </div>

      <div className="flex items-center">
        <Link href="/search" className="mx-2">
          <IoSearchOutline className="w-5 h-5" />
        </Link>
        <Link href="/cart" className="mx-2">
          <span className="relative">
            {
              (loaded && totalItemsInCart > 0) && (
                <span className="absolute text-xs rounded-full px-1 font-bold -top-2 -right-2 bg-blue-700 text-white">
                  {totalItemsInCart}
                </span>
              )
            }
            <IoCartOutline className="w-5 h-5" />
          </span>
        </Link>
        <button
          className="m-2 p-2 rounded-md transition-all hover:bg-gray-100"
          onClick={closeMenu}
        >
          Menú
        </button>
      </div>
    </nav>
  )
}
