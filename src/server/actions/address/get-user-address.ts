'use server';

import { UserAddress } from "@/src/core/entities";
import { userAddressRepository } from "../../providers";
import type { TFormUserAddress } from "@/src/core/types";

export async function getUserAddress(userId: string): Promise<Partial<TFormUserAddress>> {
  if (!userId) {
    return {};
  }

  const result = await userAddressRepository.findByUserId(userId);

  if (!result.isOk) {
    return {};
  }

  const { country_id, ...rest } = result.data<UserAddress>().toJson();

  return {
    ...rest,
    country: country_id,
  };
}