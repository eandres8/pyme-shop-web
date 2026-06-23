import { titleFont } from "@/src/config/fonts";
import { AccountTypeSelector } from "./ui/account-type-selector/AccountTypeSelector";

export default function NewAccountPage() {
  return (
    <main className="flex flex-col min-h-screen pt-14 md:pt-28">
      <h1 className={`${titleFont.className} text-4xl mb-5 text-center`}>Nueva cuenta</h1>

      <AccountTypeSelector />
    </main>
  );
}
