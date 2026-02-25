import "./globals.css";
import type { Metadata } from "next";
import SessionProvider from "@/components/SessionProvider";
import { GeistSans } from "geist/font/sans";

export const metadata: Metadata = {
  title: "WatchVault",
  description: "Movies • TV • Anime tracker",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body
        className={`${GeistSans.className} min-h-screen bg-zinc-950 text-white antialiased`}
      >
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
