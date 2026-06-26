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
): Promise<TActionResponse<string>> {
  const logger = Logger("registerUserStore");

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

  const tenant = Tenant.fromJson({
    name: data.storename,
    address: data.storeaddress,
    phone: data.storephone,
  }).createSlug();

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

  const path = envs.DOMAIN_LOGIN_URL.replace("domain", "pymeshop.local");

  return {
    success: true,
    data: path,
  };
}
