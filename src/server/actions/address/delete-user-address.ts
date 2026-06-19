'use server';

import { IUserAddressRepository } from "../../interfaces";
import { inject } from "../../providers";

function deleteUserAddressAction(userAddressRepository: IUserAddressRepository) {
  return async (userId: string) => {
    const result = await userAddressRepository.remove(userId);

    if (!result.isOk) {
      return null;
    }

    return result.data.toJson();
  };
}

export const deleteUserAddress = deleteUserAddressAction(inject('userAddressRepository') as IUserAddressRepository);
