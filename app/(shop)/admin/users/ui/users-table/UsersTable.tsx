'use client';

import type { TPublicUser } from "@/src/core/types";
import { changeUserRole } from "@/src/server/actions";

type Props = {
  users: TPublicUser[];
};

export const UsersTable: React.FC<Props> = ({ users }) => {
  const handleChangeRole = (userId: string) => (event: React.ChangeEvent<HTMLSelectElement>) => {
    changeUserRole(userId, event.target.value);
  }

  return (
    <table className="min-w-full">
      <thead className="bg-gray-200 border-b border-b-gray-300">
        <tr>
          <th
            scope="col"
            className="text-sm font-medium text-gray-900 px-6 py-4 text-left"
          >
            email
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
            Role
          </th>
        </tr>
      </thead>
      <tbody>
        {
          users.map((u) => (
            <tr
              key={u.id}
              className="bg-white border-b border-b-gray-300 transition duration-300 ease-in-out hover:bg-gray-100"
            >
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {u.email}
              </td>
              <td className="text-sm text-gray-900 font-light px-6 py-4 whitespace-nowrap">
                {u.name}
              </td>
              <td className="text-sm text-gray-900 font-light px-6 ">
                <select value={u.role} className="w-full text-sm text-gray-900 p-2 bg-gray-100" onChange={handleChangeRole(u.id)}>
                  <option value="admin">Administrador</option>
                  <option value="user">Usuario</option>
                </select>
              </td>
            </tr>
          ))
        }
      </tbody>
    </table>
  );
};
