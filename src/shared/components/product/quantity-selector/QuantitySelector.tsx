"use client";

import { useState } from "react";
import { IoAddCircleOutline, IoRemoveCircleOutline } from "react-icons/io5";

type Props = {
  quantity: number;
};

export const QuantitySelector: React.FC<Props> = ({ quantity }) => {
  const [count, setCount] = useState(quantity);

  const onQuantityChange = (value: number) => {
    setCount((val) => {
      if (val + value < 1) {
        return val;
      }

      return val + value;
    });
  };

  return (
    <div className="flex">
      <button className="" onClick={() => onQuantityChange(-1)}>
        <IoRemoveCircleOutline size={30} />
      </button>
      <span className="w-20 mx-3 px-5 bg-gray-100 text-center rounded">
        {count}
      </span>
      <button className="" onClick={() => onQuantityChange(1)}>
        <IoAddCircleOutline size={30} />
      </button>
    </div>
  );
};
