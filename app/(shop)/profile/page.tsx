import { redirect } from "next/navigation";

import { auth } from "@/src/auth.config";
import { Title } from "@/src/shared/components/ui";

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/");
  }

  return (
    <div>
      <Title title="Perfil" />

      <pre>{JSON.stringify(session.user, null, 2)}</pre>

      <h3>{ session.user.role }</h3> 
    </div>
  );
}
