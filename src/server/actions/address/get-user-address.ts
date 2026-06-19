'use server';

import type { IUserAddressRepository } from "../../interfaces";
import { inject } from "../../providers";
import type { TFormUserAddress } from "@/src/core/types";

function getUserAddressAction(userAddressRepository: IUserAddressRepository) {
  return async (userId: string): Promise<Partial<TFormUserAddress>> => {
    if (!userId) {
      return {};
    }

    const result = await userAddressRepository.findByUserId(userId);

    if (!result.isOk) {
      return {};
    }

    const { country_id, ...rest } = result.data.toJson();

    return {
      ...rest,
      country: country_id,
    };
  };
}

export const getUserAddress = getUserAddressAction(inject('userAddressRepository') as IUserAddressRepository);
