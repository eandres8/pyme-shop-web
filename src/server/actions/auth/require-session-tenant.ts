'use server';

import { auth } from "@/src/auth.config";

export async function requireSessionTenant(): Promise<string> {
  const session = await auth();
  const tenantId = session?.user?.tenant;

  if (!tenantId) {
    throw new Error("No se pudo resolver el tenant de la sesión del administrador");
  }

  return tenantId;
}
