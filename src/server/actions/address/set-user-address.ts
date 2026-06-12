"use server";

import type { TFormUserAddress } from "@/src/core/types";
import { userAddressRepository } from "../../providers";
import { UserAddress } from "@/src/core/entities";
import type { Result } from "@/src/core/utils";

export async function setUserAddress(
  address: TFormUserAddress,
  userId: string,
) {
  const userAddress = UserAddress.fromJson({
    ...address,
    countryId: address.country,
    userId,
  });

  const findUserAddress = await userAddressRepository.findByUserId(userId);

  if (findUserAddress.isOk === false) {
    throw findUserAddress.error;
  }

  if (!findUserAddress.data.id) {
    const result = await userAddressRepository.create(userAddress);

    return _responseData(result as Result<UserAddress>);
  }

  const updateResult = await userAddressRepository.update(userAddress);

  return _responseData(updateResult as Result<UserAddress>);
}

const _responseData = (address: Result<UserAddress>) => {
  return {
    success: address.isOk,
    ...(address.isOk ? { data: address.data.toJson() } : {}),
    ...(address.isOk === false
      ? { message: address.error.message }
      : {}),
  };
};
