'use client';

import Link from "next/link";
import { IoSearchOutline, IoCartOutline } from 'react-icons/io5';

import { titleFont } from "@/src/config/fonts";
import { useUIStore } from "@/src/data/stores";

export const TopMenu = () => {
  const closeMenu = useUIStore((state) => state.openSideMenu);

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
        <Link className="m-2 p-2 rounded-md transition-all hover:bg-gray-100" href="/category/kids">Niños</Link>
        <Link className="m-2 p-2 rounded-md transition-all hover:bg-gray-100" href="/category/pets">Mascotas</Link>
      </div>

      <div className="flex items-center">
        <Link href="/search" className="mx-2">
          <IoSearchOutline className="w-5 h-5" />
        </Link>
        <Link href="/cart" className="mx-2">
          <span className="relative">
            <span className="absolute text-xs rounded-full px-1 font-bold -top-2 -right-2 bg-blue-700 text-white">3</span>
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
