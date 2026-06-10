'use server';

import { UserAddress } from "@/src/core/entities";
import { userAddressRepository } from "../../providers";

export async function deleteUserAddress(userId: string) {
  const result = await userAddressRepository.remove(userId);

  if (!result.isOk) {
    return null;
  }

  return result.data<UserAddress>().toJson();
}
