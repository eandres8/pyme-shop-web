import type { TUserAddress, TUserAddressEntity } from "../types";

export class UserAddress {
  private constructor(
    readonly id: string,
    readonly firstName: string,
    readonly lastName: string,
    readonly address: string,
    readonly addressInfo: string,
    readonly postalCode: string,
    readonly city: string,
    readonly countryId: string,
    readonly phone: string,
    readonly userId: string,
  ) {}

  static fromJson(data: Partial<TUserAddress>) {
    return new UserAddress(
      data?.id || '',
      data?.firstName || '',
      data?.lastName || '',
      data?.address || '',
      data?.addressInfo || '',
      data?.postalCode || '',
      data?.city || '',
      data?.countryId || '',
      data?.phone || '',
      data?.userId || '',
    );
  }

  static fromEntity(data: Partial<TUserAddressEntity>) {
    return new UserAddress(
      data?.id || '',
      data?.first_name || '',
      data?.last_name || '',
      data?.address || '',
      data?.address_info || '',
      data?.postal_code || '',
      data?.city || '',
      data?.country_id || '',
      data?.phone || '',
      data?.user_id || '',
    );
  }

  toJson() {
    return {
      ...( this.id ? { id: this.id } : {}),
      first_name: this.firstName,
      last_name: this.lastName,
      address: this.address,
      address_info: this.addressInfo,
      postal_code: this.postalCode,
      city: this.city,
      country_id: this.countryId,
      phone: this.phone,
      user_id: this.userId,
    };
  }
}