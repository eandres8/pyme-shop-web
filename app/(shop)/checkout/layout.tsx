import { redirect } from "next/navigation";

import { auth } from "@/src/auth.config";
import type { TLayoutProps } from "@/src/core/types";

export default async function CheckoutLayout({ children }: TLayoutProps) {
  const session = await auth();

  if (!session?.user) {
    redirect("/");
  }

  return (
    <>
      {children}
    </>
  )
}