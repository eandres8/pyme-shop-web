import { getUserFiltered } from "@/src/server/actions";
import { Title } from "@/src/shared/components";
import { UsersTable } from "./ui/users-table/UsersTable";

export default async function UsersAdminPage() {
  const result = await getUserFiltered('tenant');

  const users = result.success ? result.data : [];

  return (
    <div className="flex flex-col">
      <Title title="Administración de usuarios" />

      <div className="flex mb-10">
        <UsersTable users={users} />
      </div>
    </div>
  );
}
