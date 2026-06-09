'use client';

import { useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import { SubmitHandler, useForm } from 'react-hook-form';

import { login, registerUser } from "@/src/server/actions";

type FormInputs = {
  email: string;
  name: string;
  password: string;
};

export const RegisterForm: React.FC = () => {
  const [errorMsg, setErrorMsg] = useState('');
  const { register, handleSubmit, formState: { errors } } = useForm<FormInputs>();

  const onSubmit: SubmitHandler<FormInputs> = async (data) => {
    setErrorMsg('');
    const resp = await registerUser(data);

    if (!resp.success) {
      setErrorMsg(resp.message);
      return;
    }

    await login(data.email, data.password);
    window.location.replace('/');
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col">
      <label htmlFor="email">Nombre completo</label>
      <input
        className={
          clsx(
            "px-5 py-2 border border-gray-300 bg-gray-50 rounded mb-5",
            {
              "border-red-500": !!errors.name,
            }
          )
        }
        type="text"
        {...register('name', { required: true })}
      />

      <label htmlFor="email">Correo electrónico</label>
      <input
        className={
          clsx(
            "px-5 py-2 border border-gray-300 bg-gray-50 rounded mb-5",
            {
              "border-red-500": !!errors.email,
            }
          )
        }
        type="email"
        {...register('email', { required: true, pattern: /^\S+@\S+$/i })}
      />
      
      <label htmlFor="email">Contraseña</label>
      <input
        className={
          clsx(
            "px-5 py-2 border border-gray-300 bg-gray-50 rounded mb-5",
            {
              "border-red-500": !!errors.password,
            }
          )
        }
        type="password"
        {...register('password', { required: true, minLength: 6 })}
      />

      <span className="text-red-500 w-full text-center mb-2">{errorMsg}</span>

      <button type="submit" className="btn-primary">Crear cuenta</button>

      {/* divisor l ine */}
      <div className="flex items-center my-5">
        <div className="flex-1 border-t border-gray-500"></div>
        <div className="px-2 text-gray-800">O</div>
        <div className="flex-1 border-t border-gray-500"></div>
      </div>

      <Link href="/auth/login" className="btn-secondary text-center">
        Ingresar
      </Link>
    </form>
  );
};
