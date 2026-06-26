import { redirect } from "next/navigation";

import { auth } from "@/src/auth.config";
import { PendingAction, Title } from "@/src/shared/components/ui";
import { getTenantByUserId, getTenantConfig } from "@/src/server/actions";
import type { TStoreConfig } from "@/src/core/types";

type TConfig = {
  tenant: string;
  pendingItems: TStoreConfig[];
};

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/login");
  }

  const user = session.user;
  
  const [result, resultConfig] = await Promise.all([
    getTenantByUserId(user.id),
    getTenantConfig(),
  ]);

  const tenant = result.success ? result.data : null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const config = resultConfig.success ? resultConfig.data! : { tenant: '', pendingItems: [] } as TConfig;

  return (
    <div>
      <Title title="Perfil" />

      <article className="flex flex-col items-center gap-2 md:gap-10 mb-4 md:mb-10">
        <div className="flex flex-col w-2/4 gap-8">
          <section className="flex flex-col gap-2">
            <div className="p-4 rounded-sm bg-gray-100 mb-2">
              <p>
                Comparte el link de la tienda: <span className="text-semibold underline">{`${config.tenant}.local`} </span>
              </p>
            </div>
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
        <span className="border border-gray-200 w-full"></span>
        <div className="flex flex-col gap-2">
          <h3 className="font-semibold">Mis tareas</h3>
          <p>Estas son unas configuraciones pendientes que necesitas para tener lista tu tienda y mostrar mejor tu catálogo de productos</p>
          <div className="flex flex-wrap gap-4 p-4 md:p-10">
            {
              config?.pendingItems?.map((pi) => (
                <PendingAction key={pi.id} {...pi} />
              ))
            }
          </div>
        </div>
      </article>
    </div>
  );
}
