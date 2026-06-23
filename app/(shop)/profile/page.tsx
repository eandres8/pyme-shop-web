import { redirect } from "next/navigation";

import { auth } from "@/src/auth.config";
import { Title } from "@/src/shared/components/ui";
import { getTenantByUserId } from "@/src/server/actions";

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/");
  }

  const user = session.user;
  
  const result = await getTenantByUserId(user.id);

  const tenant = result.success ? result.data : null;

  return (
    <div>
      <Title title="Perfil" />

      <article className="flex flex-col items-center gap-2 md:gap-10 mb-4 md:mb-10">
        <div className="flex flex-col w-2/4 gap-8">
          <section className="flex flex-col gap-2">
            <h3 className="font-bold text-xl mb-2">Usuario</h3>
            <div className="flex flex-col md:flex-row gap-2 md:gap-20">
              <div>
                <span className="font-semibold">Nombre</span>
                <p>{user.name}</p>
              </div>
              <div>
                <span className="font-semibold">Correo</span>
                <p>{user.email}</p>
              </div>
            </div>
          </section>
          {
            !!tenant && (
              <section className="flex flex-col gap-2">
                <h3 className="font-bold text-xl mb-2">Tienda</h3>
                <div className="flex flex-col md:flex-row gap-2 md:gap-20">
                  <div>
                    <span className="font-semibold">Nombre</span>
                    <p>{tenant.name}</p>
                  </div>
                  <div>
                    <span className="font-semibold">Teléfono</span>
                    <p>{tenant.phone}</p>
                  </div>
                  <div>
                    <span className="font-semibold">Dirección</span>
                    <p>{tenant.address}</p>
                  </div>
                </div>
              </section>
            )
          }
        </div>
      </article>
    </div>
  );
}
