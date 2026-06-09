"use client";

import Link from "next/link";
import { useSession } from 'next-auth/react';
import {
  IoCloseOutline,
  IoLogInOutline,
  IoLogOutOutline,
  IoPeopleOutline,
  IoPersonOutline,
  IoSearchOutline,
  IoShirtOutline,
  IoTicketOutline,
} from "react-icons/io5";
import clsx from "clsx";

import { useUIStore } from "@/src/client/stores";
import { logout } from "@/src/server/actions";

export const Sidebar = () => {
  const isSideMenuOpen = useUIStore((state) => state.isSideMenuOpen);
  const closeMenu = useUIStore((state) => state.closeSideMenu);
  const session = useSession();

  const isAuthenticated = !!session.data?.user;
  const isAdmin = session.data?.user?.role === 'admin';

  return (
    <div>

      {
        isSideMenuOpen && (
          <>
            <div className="fixed top-0 left-0 w-screen h-screen z-10 bg-black opacity-30" />
            <div onClick={closeMenu} className="fade-in fixed top-0 left-0 w-screen h-screen z-10 backdrop-filter backdrop-blur-sm" />
          </>
        )
      }
      
      <aside
        className={clsx(
          "fixed p-5 right-0 top-0 w-125 h-screen bg-white z-20 shadow-2xl transform transition-all duration-300",
          {
            "translate-x-full": !isSideMenuOpen,
          }
        )}
      >
        <IoCloseOutline
          size={50}
          className="absolute top-5 right-5 cursor-pointer"
          onClick={closeMenu}
        />

        <div className="relative mt-14">
          <IoSearchOutline size={20} className="absolute top-2 left-2" />
          <input
            type="text"
            placeholder="Buscar"
            className="w-full bg-gray-50 rounded pl-10 py-1 pr-10 border-b-2 text-xl border-gray-200 focus:outline-none focus:border-blue-500"
          />
        </div>

        {
          isAuthenticated ? (
            <>
              <Link
                href="/profile"
                onClick={closeMenu}
                className="flex items-center mt-5 p-2 hover:bg-gray-100 rounded transition-all cursor-pointer"
              >
                <IoPersonOutline size={30} />
                <span className="ml-3 text-xl">Perfil</span>
              </Link>
              <Link
                href="/"
                onClick={closeMenu}
                className="flex items-center mt-5 p-2 hover:bg-gray-100 rounded transition-all cursor-pointer"
              >
                <IoTicketOutline size={30} />
                <span className="ml-3 text-xl">Ordenes</span>
              </Link>
              <button
                className="flex items-center w-full mt-5 p-2 hover:bg-gray-100 rounded transition-all cursor-pointer"
                onClick={() => {
                  logout();
                  closeMenu();
                }}
              >
                <IoLogOutOutline size={30} />
                <span className="ml-3 text-xl">Salir</span>
              </button>

              <div className="w-full h-px bg-gray-200 my-10" />

              {
                isAdmin && (
                  <>
                    <Link
                      href="/"
                      onClick={closeMenu}
                      className="flex items-center mt-5 p-2 hover:bg-gray-100 rounded transition-all cursor-pointer"
                    >
                      <IoShirtOutline size={30} />
                      <span className="ml-3 text-xl">Productos</span>
                    </Link>
                    <Link
                      href="/"
                      onClick={closeMenu}
                      className="flex items-center mt-5 p-2 hover:bg-gray-100 rounded transition-all cursor-pointer"
                    >
                      <IoTicketOutline size={30} />
                      <span className="ml-3 text-xl">Ordenes</span>
                    </Link>
                    <Link
                      href="/"
                      onClick={closeMenu}
                      className="flex items-center mt-5 p-2 hover:bg-gray-100 rounded transition-all cursor-pointer"
                    >
                      <IoPeopleOutline size={30} />
                      <span className="ml-3 text-xl">Usuarios</span>
                    </Link>
                  </>
                )
              }
            </>
          ) : (
            <Link
              href="/auth/login"
              onClick={closeMenu}
              className="flex items-center mt-5 p-2 hover:bg-gray-100 rounded transition-all cursor-pointer"
            >
              <IoLogInOutline size={30} />
              <span className="ml-3 text-xl">Ingresar</span>
            </Link>
          )
        }
      </aside>
    </div>
  );
};
