import { create } from "zustand";
import { persist } from "zustand/middleware";

type TAddressState = {
  address: {
    firstName: string;
    lastName: string;
    address: string;
    addressInfo?: string;
    postalCode: string;
    city: string;
    country: string;
    phone: string;
  };

  setAddress: (address: TAddressState['address']) => void;
};

export const useAddressStore = create<TAddressState>()(
  persist(
    (set, get) => ({
      address: {
        firstName: '',
        lastName: '',
        address: '',
        addressInfo: '',
        postalCode: '',
        city: '',
        country: '',
        phone: '',
      },
      // Methods
      setAddress: (address) => {
        set({address});
      },
    }),
    {
      name: 'address-storage',
    }
  ),
);