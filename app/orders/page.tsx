import Link from "next/link";
import { db } from "@/db";
import { formatDate } from "@/lib/dates";
import { formatCents } from "@/lib/money";
import { listOrders } from "@/lib/orders";
import { StatusBadge } from "@/app/status-badge";

export default async function OrdersPage() {
  const orders = listOrders(db);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Orders</h1>

      {orders.length === 0 ? (
        <p className="text-sm text-gray-500">No orders yet.</p>
      ) : (
        <table className="w-full overflow-hidden rounded-lg border border-gray-200 bg-white text-sm">
          <thead className="bg-gray-50 text-left text-gray-500">
            <tr>
              <th className="px-4 py-2 font-medium">Order</th>
              <th className="px-4 py-2 font-medium">Placed</th>
              <th className="px-4 py-2 font-medium">Customer</th>
              <th className="px-4 py-2 text-right font-medium">Books</th>
              <th className="px-4 py-2 text-right font-medium">Total</th>
              <th className="px-4 py-2 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {orders.map((order) => (
              <tr key={order.id}>
                <td className="px-4 py-2">
                  <Link href={`/orders/${order.id}`} className="font-medium text-blue-700 hover:underline">
                    {order.number}
                  </Link>
                </td>
                <td className="px-4 py-2">{formatDate(order.createdAt)}</td>
                <td className="px-4 py-2">{order.customerName}</td>
                <td className="px-4 py-2 text-right">{order.bookCount}</td>
                <td className="px-4 py-2 text-right">{formatCents(order.total)}</td>
                <td className="px-4 py-2">
                  <StatusBadge status={order.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
