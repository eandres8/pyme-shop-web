import Link from "next/link";
import { IoAddOutline } from "react-icons/io5";

import { getPaginatedProductsWithImages } from "@/src/server/actions";
import { Pagination, Title } from "@/src/shared/components/ui";
import { currencyFormat } from "@/src/shared/utils";
import { ProductImage } from "@/src/shared/components/product";

type Props = {
  searchParams: Promise<{ page?: string }>;
};


export default async function ProductsAdminPage({ searchParams }: Props) {
  const { page } = await searchParams;
  
  const { data: products, currentPage, totalPages } = await getPaginatedProductsWithImages({
    page: page ? Number(page) : undefined,
  });

  return (
    <div className="flex flex-col">
      <Title title="Administración de productos" />

      <div className="flex justify-end mb-5">
        <Link href="/admin/product/new" className="flex items-center gap-2 btn-primary">
          <IoAddOutline size={20} />
          Nuevo
        </Link>        
      </div>

      <div className="flex flex-col mb-10">
        <table className="min-w-full">
          <thead className="bg-gray-200 border-b border-b-gray-300">
            <tr>
              <th
                scope="col"
                className="text-sm font-medium text-gray-900 px-6 py-4 text-left"
              >
                Imagen
              </th>
              <th
                scope="col"
                className="text-sm font-medium text-gray-900 px-6 py-4 text-left"
              >
                Título
              </th>
              <th
                scope="col"
                className="text-sm font-medium text-gray-900 px-6 py-4 text-left"
              >
                Precio
              </th>
              <th
                scope="col"
                className="text-sm font-medium text-gray-900 px-6 py-4 text-left"
              >
                Género
              </th>
              <th
                scope="col"
                className="text-sm font-medium text-gray-900 px-6 py-4 text-left"
              >
                Stock
              </th>
              <th
                scope="col"
                className="text-sm font-medium text-gray-900 px-6 py-4 text-left"
              >
                Tallas
              </th>
            </tr>
          </thead>
          <tbody>
            {products?.map((p) => (
              <tr
                key={p.id}
                className="bg-white border-b border-b-gray-300 transition duration-300 ease-in-out hover:bg-gray-100"
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  <Link href={`/admin/product/${p.slug}`}>
                    <ProductImage
                      src={p.images?.at(0)}
                      width={80}
                      height={80}
                      alt={p.title}
                      className="w-20 h-20 object-cover rounded"
                    />
                  </Link>
                </td>
                <td className="text-sm text-gray-900 font-light px-6 py-4 whitespace-nowrap">
                  <Link href={`/admin/product/${p.slug}`} className="hover:underline hover:cursor-pointer">
                    {p.title}
                  </Link>
                </td>
                <td className="text-sm text-gray-900 font-bold px-6">
                  {currencyFormat(p.price)}
                </td>
                <td className="text-sm text-gray-900 font-light px-6">
                  {p.gender}
                </td>
                <td className="text-sm text-gray-900 font-bold px-6">
                  {p.inStock}
                </td>
                <td className="text-sm text-gray-900 font-bold px-6">
                  {p.sizes.join(', ')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <Pagination totalPages={totalPages} currentPage={currentPage} />
      </div>
    </div>
  );
}
