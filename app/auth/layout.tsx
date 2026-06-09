import { redirect } from "next/navigation";

import { auth } from "@/src/auth.config";
import type { TLayoutProps } from "@/src/core/types";

export default async function AuthLayout({ children }: TLayoutProps) {
  const session = await auth();
  
  if (session?.user) {
    redirect('/', 'replace');
  }

  return (
    <main className="flex justify-center">
      <div className="w-full sm:w-87.5 px-10">
        {children}
      </div>
    </main>
  )
}