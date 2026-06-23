"use client";

import { useState } from "react";
import { IoStorefrontOutline } from "react-icons/io5";
import { GoPerson } from "react-icons/go";

import { RegisterForm } from "../register-form/RegisterForm";
import { RegisterStoreForm } from "../register-store-form/RegisterStoreForm";

export const AccountTypeSelector: React.FC = () => {
  const [formType, setFormType] = useState<'IDLE' | 'USER' | 'SHOP'>('IDLE');

  const onSetFormType = (formkey: 'USER' | 'SHOP') => () => {
    setFormType(formkey);
  }

  return (
    <>
      {
        formType === 'IDLE' && (
          <section className="flex justify-between gap-8 p-8">
            <button
              className="flex px-8 py-4 flex-col items-center gap-2 hover:cursor-pointer hover:underline hover:bg-gray-50 rounded-md"
              onClick={onSetFormType('USER')}
            >
              <span>
                <GoPerson size={100} />
              </span>
              <span>
                Cliente
              </span>
            </button>
            <button
              className="flex px-8 py-4 flex-col items-center gap-2 hover:cursor-pointer hover:underline hover:bg-gray-50 rounded-md"
              onClick={onSetFormType('SHOP')}
            >
              <span>
                <IoStorefrontOutline size={100} />
              </span>
              <span>
                Tienda
              </span>
            </button>
          </section>
        )
      }
      {
        formType === 'USER' && <RegisterForm />
      }
      {
        formType === 'SHOP' && (
          <RegisterStoreForm />
        )
      }
    </>
  );
};
