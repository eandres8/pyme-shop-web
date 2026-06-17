"use client";

import { useEffect, useState } from "react";

import { titleFont } from "@/src/config/fonts";
import { getProductStockBySlug } from "@/src/server/actions";

type Props = {
  slug: string;
};

export const StockLabel: React.FC<Props> = ({ slug }) => {
  const [stock, setStock] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const getStock = async () => {
    const productStock = await getProductStockBySlug(slug);

    setStock(productStock);
    setIsLoading(false);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    getStock();
  }, []);

  return (
    <>
      {
        isLoading ? (
          <h1 className={`${titleFont.className} antialiased font-bold text-xl animate-pulse bg-gray-200`}>
            &nbsp;
          </h1>
        ): (
          <h1 className={`${titleFont.className} antialiased font-bold text-xl`}>
            Stock: {stock}
          </h1>
        )
      }
    </>
  );
};
