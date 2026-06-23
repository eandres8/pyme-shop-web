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
      <div className="flex justify-center sm:w-87.5 md:w-full h-screen items-center">
        {children}
      </div>
    </main>
  )
}