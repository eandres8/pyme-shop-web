import Link from "next/link";
import { IoCartOutline } from "react-icons/io5";

export default function EmptyPage() {
  return (
    <div className="flex items-center justify-center h-200">
      <IoCartOutline size={80} className="mx-5" />
      <div className="flex flex-col items-center">
        <h1 className="text-xl font-semibold">El carrito está vacio</h1>
        <Link href="/" className="text-blue-500 mt-2 text-4xl">
          Ir al inicio
        </Link>
      </div>
    </div>
  );
}
