import type { TLayoutProps } from "@/src/core/types";
import { Footer, TopHomeMenu } from "@/src/shared/components/ui";

export default async function HomeLayout({ children }: TLayoutProps) {
  return (
    <main className="min-h-screen">
      <TopHomeMenu />
      
      <div className="md:px-4 lg:px-10">
        <div className="flex justify-center">
          <section className="w-full max-w-7xl">
            {children}
          </section>
        </div>
      </div>

      <Footer />
    </main>
  );
}
