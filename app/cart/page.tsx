import Link from "next/link";
import { db } from "@/db";
import { cartLines, cartTotal } from "@/lib/cart";
import { formatCents } from "@/lib/money";
import { CartLine } from "./cart-line";
import { currentCart } from "./current-cart";

export default async function CartPage() {
  const cart = await currentCart();
  const lines = cart === undefined ? [] : cartLines(db, cart.id);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Cart</h1>

      {lines.length === 0 ? (
        <p className="text-sm text-gray-500">
          Your cart is empty.{" "}
          <Link href="/" className="text-blue-700 hover:underline">
            Browse the catalogue
          </Link>
        </p>
      ) : (
        <>
          <table className="w-full overflow-hidden rounded-lg border border-gray-200 bg-white text-sm">
            <thead className="bg-gray-50 text-left text-gray-500">
              <tr>
                <th className="px-4 py-2 font-medium">Book</th>
                <th className="px-4 py-2 text-right font-medium">Price</th>
                <th className="px-4 py-2 text-right font-medium">Quantity</th>
                <th className="px-4 py-2" />
                <th className="px-4 py-2 text-right font-medium">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {lines.map((line) => (
                <CartLine key={line.id} line={line} />
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-gray-200">
                <td colSpan={4} className="px-4 py-2 text-right font-medium">
                  Total
                </td>
                <td className="px-4 py-2 text-right font-semibold">{formatCents(cartTotal(lines))}</td>
              </tr>
            </tfoot>
          </table>

          <div className="flex justify-end">
            <Link href="/checkout" className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700">
              Checkout
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
