"use client";

import { IoAddCircleOutline, IoRemoveCircleOutline } from "react-icons/io5";

type Props = {
  quantity: number;
  onQuantityChanged: (quantity: number) => void;
};

export const QuantitySelector: React.FC<Props> = ({ quantity, onQuantityChanged }) => {
  const onValueChange = (value: number) => {
    if (quantity + value < 1) {
      return;
    }

    onQuantityChanged(quantity + value);
  };

  return (
    <div className="flex">
      <button className="hover:cursor-pointer" onClick={() => onValueChange(-1)}>
        <IoRemoveCircleOutline size={30} />
      </button>
      <span className="w-20 mx-3 px-5 bg-gray-100 text-center rounded">
        {quantity}
      </span>
      <button className="hover:cursor-pointer" onClick={() => onValueChange(1)}>
        <IoAddCircleOutline size={30} />
      </button>
    </div>
  );
};
