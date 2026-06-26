import Link from "next/link";
import Image from "next/image";

import { titleFont } from "@/src/config/fonts";

type Props = {
  redirectTo?: string;
}

export const PageNotFound: React.FC<Props> = ({ redirectTo }) => {
  return (
    <div className="flex flex-col-reverse md:flex-row h-200 justify-center items-center align-middle">
      <div className="text-center px-5 mx-5">
        <h2 className={`${titleFont.className} antialiased text-9xl`}>404</h2>
        <p className="font-semibold">Woops! Lo sentimos mucho.</p>
        {
          redirectTo && (
            <p className="font-light">
              <span>Puedes regresar al </span>
              <Link className="font-normal hover:underline transition-all" href={redirectTo}>
                Inicio
              </Link>
            </p>
          )
        }
      </div>

      <div className="px-5 mx-5">
        <Image
          src="/images/starman_750x750.png"
          className="p-5 sm:p-0"
          width={550}
          height={550}
          alt="not found picture"
        />
      </div>
    </div>
  );
}
