import "./globals.css";
import { Inter } from "next/font/google";
import Link from "next/link";
import type { Metadata } from "next";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Jewelry Configurator",
  description: "Inspirational 3D configurator for jewelry",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body
        className={`${inter.className} h-full bg-zinc-50 text-zinc-900 dark:bg-zinc-900 dark:text-zinc-50`}
      >
        <header className="h-16 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between px-4">
          <Link href="/" className="font-semibold tracking-tight">
            Jewelry 3D
          </Link>
          <nav className="flex items-center gap-3 text-sm">
            <Link className="hover:underline" href="/configurator">
              Configurator
            </Link>
            <a
              className="hover:underline"
              href="https://example.com"
              target="_blank"
              rel="noreferrer"
            >
              Docs
            </a>
          </nav>
        </header>
        {children}
      </body>
    </html>
  );
}
