import type { Metadata } from "next";

import "./globals.css";
import { inter } from "@/src/config/fonts";
import { AuthProvider } from "@/src/client/providers";

export const metadata: Metadata = {
  title: {
    template: '%s - Pyme Shop',
    default: 'Inicio',
  },
  description: "Tienda para ofrecer al público productos de pequeños empresarios",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.className} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
