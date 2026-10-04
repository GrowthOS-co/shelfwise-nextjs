import { notFound } from "next/navigation";
import { db } from "@/db";
import { formatDateTime } from "@/lib/dates";
import { formatCents } from "@/lib/money";
import { getOrder } from "@/lib/orders";
import { StatusBadge } from "@/app/status-badge";
import { MarkShippedForm } from "../mark-shipped-form";

export default async function OrderPage({ params }: PageProps<"/orders/[id]">) {
  const { id } = await params;
  const order = getOrder(db, Number(id));
  if (order === undefined) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold">{order.number}</h1>
          <StatusBadge status={order.status} />
        </div>
        {order.status === "placed" && <MarkShippedForm orderId={order.id} />}
      </div>

      <dl className="grid gap-4 rounded-lg border border-gray-200 bg-white p-5 text-sm sm:grid-cols-3">
        <div>
          <dt className="text-gray-500">Placed</dt>
          <dd className="font-medium">{formatDateTime(order.createdAt)}</dd>
        </div>
        {order.shippedAt && (
          <div>
            <dt className="text-gray-500">Shipped</dt>
            <dd className="font-medium">{formatDateTime(order.shippedAt)}</dd>
          </div>
        )}
        <div>
          <dt className="text-gray-500">Customer</dt>
          <dd className="font-medium">{order.customerName}</dd>
        </div>
        <div>
          <dt className="text-gray-500">Email</dt>
          <dd className="font-medium">{order.email}</dd>
        </div>
        <div>
          <dt className="text-gray-500">Ship to</dt>
          <dd className="whitespace-pre-line font-medium">{order.shippingAddress}</dd>
        </div>
      </dl>

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
          {order.items.map((item) => (
            <tr key={item.id}>
              <td className="px-4 py-2">{item.title}</td>
              <td className="px-4 py-2 text-right">{item.quantity}</td>
              <td className="px-4 py-2 text-right">{formatCents(item.unitPriceCents)}</td>
              <td className="px-4 py-2 text-right">{formatCents(item.quantity * item.unitPriceCents)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t border-gray-200">
            <td colSpan={3} className="px-4 py-2 text-right font-medium">
              Total
            </td>
            <td className="px-4 py-2 text-right font-semibold">{formatCents(order.total)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
