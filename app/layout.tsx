import type { Metadata } from "next";
import { Geist } from "next/font/google";
import Link from "next/link";
import { db } from "@/db";
import { cartCount, cartLines } from "@/lib/cart";
import { currentCart } from "./cart/current-cart";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Shelfwise",
  description: "An independent bookshop",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const cart = await currentCart();
  const count = cart === undefined ? 0 : cartCount(cartLines(db, cart.id));

  return (
    <html lang="en" className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full bg-gray-50 font-sans text-gray-900">
        <header className="border-b border-gray-200 bg-white">
          <nav className="mx-auto flex max-w-5xl items-center gap-6 px-6 py-4">
            <Link href="/" className="text-lg font-semibold">
              Shelfwise
            </Link>
            <Link href="/" className="text-sm text-gray-600 hover:text-gray-900">
              Catalogue
            </Link>
            <Link href="/orders" className="text-sm text-gray-600 hover:text-gray-900">
              Orders
            </Link>
            <Link href="/cart" className="ml-auto text-sm text-gray-600 hover:text-gray-900">
              Cart ({count})
            </Link>
          </nav>
        </header>
        <main className="mx-auto max-w-5xl px-6 py-8">{children}</main>
      </body>
    </html>
  );
}
