import type { TLayoutProps } from "@/src/core/types";
import { Sidebar, TopMenu } from "@/src/shared/components/ui";

export default function ShopLayout({ children }: TLayoutProps) {
  return (
    <main className="min-h-screen">
      <TopMenu />
      <Sidebar />
      
      <div className="px-4 md:px-10">
        <article className="flex justify-center">
          <section className="max-w-7xl">
            {children}
          </section>
        </article>
      </div>
    </main>
  );
}
