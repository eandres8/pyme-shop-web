import { titleFont } from "@/src/config/fonts";
import clsx from "clsx";
import Link from "next/link";

type Props = {
  className?: string;
};

export const Footer: React.FC<Props> = () => {
  return (
    <footer className="flex gap-2 w-full justify-center text-xs pb-10">
      <Link href="/">
        <span className={clsx(titleFont.className, 'antialiased font-bold')}>Pyme</span>
        <span> | shop </span>
        <span>© {new Date().getFullYear()}</span>
      </Link>
      <Link href="/">
        Privacidad y manejo de datos
      </Link>
      <Link href="/">
        Ubicaciones
      </Link>
    </footer>
  );
}
