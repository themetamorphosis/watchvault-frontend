import "./globals.css";
import type { Metadata } from "next";
import SessionProvider from "@/components/SessionProvider";
import { GeistSans } from "geist/font/sans";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "WatchVault",
  description: "Movies • TV • Anime tracker",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${GeistSans.className} min-h-screen bg-zinc-950 text-white antialiased`}
      >
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[9999] focus:rounded focus:bg-white focus:px-3 focus:py-2 focus:text-black"
        >
          Skip to content
        </a>
        <SessionProvider>
          <main id="main-content">{children}</main>
        </SessionProvider>
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
