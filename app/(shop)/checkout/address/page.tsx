import { Title } from "@/src/shared/components/ui";
import { AddressForm } from "./ui/address-form/AddressForm";
import { getCountries, getUserAddress } from "@/src/server/actions";
import { auth } from "@/src/auth.config";

export default async function AddressPage() {
  const session = await auth();

  const [countries, userAddress] = await Promise.all([
    getCountries(),
    getUserAddress(session?.user?.id || '')
  ]);

  return (
    <div className="flex flex-col sm:justify-center sm:items-center mb-72 px-10 sm:px-0">
      <div className="w-full  xl:w-250 flex flex-col justify-center text-left">
        <Title title="Dirección" subtitle="Dirección de entrega" />

        <AddressForm countries={countries} userAddress={userAddress} />
      </div>
    </div>
  );
}
