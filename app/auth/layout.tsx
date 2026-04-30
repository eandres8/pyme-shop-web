import { TLayoutProps } from "@/src/core/types";

export default function AuthLayout({ children }: TLayoutProps) {
  return (
    <main className="min-h-screen bg-gray-400">
      {children}
    </main>
  )
}