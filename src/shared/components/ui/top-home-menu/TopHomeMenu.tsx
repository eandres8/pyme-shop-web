'use client';

import Link from "next/link";

import { titleFont } from "@/src/config/fonts";

export const TopHomeMenu = () => {
  return (
    <nav className="flex px-5 justify-between items-center w-full p-4">
      <div>
        <Link href="/">
          <span className={`${titleFont.className} antialiased font-bold`}>Pyme</span>
          <span> | Shop</span>
        </Link>
      </div>
      

      <div className="flex items-center gap-4">
        <Link href="/#home" className="mx-6">
          Inicio
        </Link>
        <Link href="/#pricing" className="mx-6">
          Precios
        </Link>
        <Link href="/auth/new-account" className="mx-6 btn-primary">
          Crear mi tienda
        </Link>
      </div>
    </nav>
  );
}
