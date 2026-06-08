"use client";

import { useActionState } from "react";
import Link from "next/link";
import { IoAlertCircleOutline } from "react-icons/io5";

import { authenticate } from "@/src/server/actions";

export const LoginForm: React.FC = () => {
  const [errorMessage, formAction, isPending] = useActionState(
    authenticate,
    undefined,
  );

  return (
    <form action={formAction} className="flex flex-col">
      <label htmlFor="email">Correo electrónico</label>
      <input
        className="px-5 py-2 border border-gray-300 bg-gray-50 rounded mb-5"
        type="email"
        name="email"
      />

      <label htmlFor="email">Contraseña</label>
      <input
        className="px-5 py-2 border border-gray-300 bg-gray-50 rounded mb-5"
        type="password"
        name="password"
      />

      <button type="submit" className="cursor-pointer btn-primary">
        Ingresar
      </button>
      {errorMessage && (
        <div
          className="flex h-8 items-end space-x-1"
          aria-live="polite"
          aria-atomic="true"
        >
          <IoAlertCircleOutline className="h-5 w-5 text-red-500" />
          <p className="text-sm text-red-500">{errorMessage}</p>
        </div>
      )}

      {/* divisor l ine */}
      <div className="flex items-center my-5">
        <div className="flex-1 border-t border-gray-500"></div>
        <div className="px-2 text-gray-800">O</div>
        <div className="flex-1 border-t border-gray-500"></div>
      </div>

      <Link
        href="/auth/new-account"
        className="cursor-pointer btn-secondary text-center"
      >
        Crear una nueva cuenta
      </Link>
    </form>
  );
};
