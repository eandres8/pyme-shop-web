import clsx from "clsx";

import { TSize } from "@/src/core/types/product.type";

type Props = {
  selectedSize?: TSize;
  availableSizes: TSize[];
  onSizeChanged: (size: TSize) => void;
};

export const SizeSelector: React.FC<Props> = ({
  availableSizes,
  selectedSize,
  onSizeChanged,
}) => {
  return (
    <div className="my-5">
      <h3 className="font-bold mb-4">Tallas disponibles</h3>
      <div className="flex">
        {availableSizes.map((sz) => (
          <button
            key={sz}
            onClick={() => onSizeChanged(sz)}
            className={clsx("mx-2 hover:underline text-lg hover:cursor-pointer", {
              underline: selectedSize === sz,
            })}
          >
            {sz}
          </button>
        ))}
      </div>
    </div>
  );
};
