import { redirect } from "next/navigation";
import { db } from "@/db";
import { cartLines, cartTotal } from "@/lib/cart";
import { formatCents } from "@/lib/money";
import { currentCart } from "@/app/cart/current-cart";
import { CheckoutForm } from "./checkout-form";

export default async function CheckoutPage() {
  const cart = await currentCart();
  const lines = cart === undefined ? [] : cartLines(db, cart.id);
  if (lines.length === 0) redirect("/cart");

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Checkout</h1>

      <table className="w-full overflow-hidden rounded-lg border border-gray-200 bg-white text-sm">
        <thead className="bg-gray-50 text-left text-gray-500">
          <tr>
            <th className="px-4 py-2 font-medium">Book</th>
            <th className="px-4 py-2 text-right font-medium">Quantity</th>
            <th className="px-4 py-2 text-right font-medium">Price</th>
            <th className="px-4 py-2 text-right font-medium">Amount</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {lines.map((line) => (
            <tr key={line.id}>
              <td className="px-4 py-2">{line.book.title}</td>
              <td className="px-4 py-2 text-right">{line.quantity}</td>
              <td className="px-4 py-2 text-right">{formatCents(line.book.priceCents)}</td>
              <td className="px-4 py-2 text-right">{formatCents(line.quantity * line.book.priceCents)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t border-gray-200">
            <td colSpan={3} className="px-4 py-2 text-right font-medium">
              Total
            </td>
            <td className="px-4 py-2 text-right font-semibold">{formatCents(cartTotal(lines))}</td>
          </tr>
        </tfoot>
      </table>

      <CheckoutForm />
    </div>
  );
}
