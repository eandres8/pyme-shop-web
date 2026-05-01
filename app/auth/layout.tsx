import { TLayoutProps } from "@/src/core/types";

export default function AuthLayout({ children }: TLayoutProps) {
  return (
    <main className="flex justify-center">
      <div className="w-full sm:w-87.5 px-10">
        {children}
      </div>
    </main>
  )
}