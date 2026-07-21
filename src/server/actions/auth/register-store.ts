"use server";

import { Tenant, User } from "@/src/core/entities";
import { tenantRepository, userRepository } from "../../providers";
import type { TActionResponse, TPublicUser } from "@/src/core/types";
import { Logger } from "@/src/core/utils";
import { envs } from "@/src/config/envs";

type TNewUserStore = {
  name: string;
  email: string;
  password: string;
  storename: string;
  storeaddress: string;
  storephone: string;
};

export async function registerUserStore(
  data: TNewUserStore,
): Promise<TActionResponse<TPublicUser>> {
  const logger = Logger("registerUserStore");

  const tenant = Tenant.fromJson({
    name: data.storename,
    address: data.storeaddress,
    phone: data.storephone,
  }).createSlug();

  // Reserved-word guard: a store slug must not collide with a top-level route
  // (admin, api, ...). Reject before creating anything so no orphan user is left.
  if (envs.BACKLIST_KEY_WORDS.includes(tenant.slug)) {
    logger.error(`Reserved store slug rejected: ${tenant.slug}`);
    return {
      success: false,
      message: "El nombre de la tienda no está permitido",
    };
  }

  const user = User.fromJson(data).toAdmin().cipherPass();

  const result = await userRepository.create(user);

  if (!result.isOk) {
    logger.error(result.error.message);
    return {
      success: false,
      message: "No se pudo crear el usuario",
    };
  }

  const newUser = result.data;

  const resultStore = await tenantRepository.createWithAdmin(
    tenant,
    newUser.id,
  );

  if (!resultStore.isOk) {
    logger.error(resultStore.error.message);
    return {
      success: false,
      message: "No se pudo crear la tienda",
    };
  }

  return {
    success: true,
    data: result.data.toPublic(),
  };
}
