"use client";

import clsx from "clsx";
import Link from "next/link";
import { IoCheckmarkCircleOutline, IoTimeOutline } from "react-icons/io5";

type Props = {
  id: string;
  url: string;
  success: boolean;
  title: string;
  description: string;
};

export const PendingAction: React.FC<Props> = ({
  url,
  success,
  title,
  description,
}) => {
  return (
    <section
      className={clsx("border-2 rounded-md p-4", {
        "border-green-500": success,
        "border-amber-500": !success,
      })}
    >
      <Link href={url} className="flex flex-col gap-4 w-3xs">
        <h3 className="font-semibold flex gap-1 items-start">
          {success ? (
            <IoCheckmarkCircleOutline className="text-green-500" size={24} />
          ) : (
            <IoTimeOutline className="text-amber-500" size={24} />
          )}
          {title}
        </h3>
        <div className="flex px-1">
          <span className="border border-gray-200 w-full"></span>
        </div>
        <p className="">
          <span>{description}</span>
        </p>
      </Link>
    </section>
  );
};
