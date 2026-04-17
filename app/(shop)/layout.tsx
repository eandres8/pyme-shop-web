import type { TLayoutProps } from "@/src/core/types";
import { TopMenu } from "@/src/shared/components";

export default function ShopLayout({ children }: TLayoutProps) {
  return (
    <main className="min-h-screen">
      <TopMenu />
      <div className="px-4 md:px-10">
        {children}
      </div>
    </main>
  )
}