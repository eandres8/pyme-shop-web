import type { Metadata } from "next";

import { inter } from "@/src/config/fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    template: '%s - Pyme Shop',
    default: 'Home',
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
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
