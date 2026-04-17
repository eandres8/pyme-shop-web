import { TLayoutProps } from "@/src/core/type";

export default function ShopLayout({ children }: TLayoutProps) {
  return (
    <main className="min-h-screen">
      {children}
    </main>
  )
}