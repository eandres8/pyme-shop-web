import { TLayoutProps } from "@/src/core/type";

export default function AuthLayout({ children }: TLayoutProps) {
  return (
    <main className="min-h-screen bg-gray-400">
      {children}
    </main>
  )
}