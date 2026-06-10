export type TUserAddress = {
  readonly id?: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly address: string;
  readonly addressInfo?: string;
  readonly postalCode: string;
  readonly city: string;
  readonly countryId: string;
  readonly phone: string;
  readonly userId: string;
};

export type TFormUserAddress = { country: string } & Omit<TUserAddress, 'userId' | 'id' | 'countryId'>

export type TUserAddressEntity = {
  readonly id: string;
  readonly address: string;
  readonly city: string;
  readonly phone: string;
  readonly first_name: string;
  readonly last_name: string;
  readonly address_info: string | null;
  readonly postal_code: string;
  readonly is_active: boolean;
  readonly created_at: Date;
  readonly updated_at: Date;
  readonly country_id: string;
  readonly user_id: string;
};
