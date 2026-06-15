import Link from "next/link";
import { IoCardOutline } from "react-icons/io5";

import { Title } from "@/src/shared/components/ui";
import { getOrderListByUser } from "@/src/server/actions";

export default async function OrdersPage() {

  const result = await getOrderListByUser();

  const orders = result.success ? result.data : [];

  return (
    <div className="flex flex-col">
      <Title title="Ordenes" />

      <div className="flex mb-10">
        <table className="min-w-full">
          <thead className="bg-gray-200 border-b border-b-gray-300">
            <tr>
              <th
                scope="col"
                className="text-sm font-medium text-gray-900 px-6 py-4 text-left"
              >
                #ID
              </th>
              <th
                scope="col"
                className="text-sm font-medium text-gray-900 px-6 py-4 text-left"
              >
                Nombre completo
              </th>
              <th
                scope="col"
                className="text-sm font-medium text-gray-900 px-6 py-4 text-left"
              >
                Estado
              </th>
              <th
                scope="col"
                className="text-sm font-medium text-gray-900 px-6 py-4 text-left"
              >
                Opciones
              </th>
            </tr>
          </thead>
          <tbody>
            {
              orders?.map((o) => (
                <tr key={o.id} className="bg-white border-b border-b-gray-300 transition duration-300 ease-in-out hover:bg-gray-100">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {o.id.split('-').at(-1)}
                  </td>
                  <td className="text-sm text-gray-900 font-light px-6 py-4 whitespace-nowrap">
                    {o.user_name}
                  </td>
                  <td className="flex items-center text-sm text-gray-900 font-light px-6 py-4 whitespace-nowrap">
                    {
                      o.is_paid
                      ? (
                        <>
                          <IoCardOutline className="text-green-800" />
                          <span className="mx-2 text-green-800">Pagada</span>
                        </>
                      ) : (
                        <>
                          <IoCardOutline className="text-red-500" />
                          <span className="mx-2 text-red-500">Pendiente</span>
                        </>
                      )
                    }
                  </td>
                  <td className="text-sm text-gray-900 font-light px-6 ">
                    <Link href={`/orders/${o.id}`} className="hover:underline">
                      Ver orden
                    </Link>
                  </td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>
    </div>
  );
}
