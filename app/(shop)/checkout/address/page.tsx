import { Title } from "@/src/shared/components/ui";
import { AddressForm } from "./ui/address-form/AddressForm";
import { getCountries } from "@/src/server/actions";

export default async function AddressPage() {
  const countries = await getCountries();

  return (
    <div className="flex flex-col sm:justify-center sm:items-center mb-72 px-10 sm:px-0">
      <div className="w-full  xl:w-250 flex flex-col justify-center text-left">
        <Title title="Dirección" subtitle="Dirección de entrega" />

        <AddressForm countries={countries} />
      </div>
    </div>
  );
}
