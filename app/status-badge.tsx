import type { OrderStatus } from "@/db/schema";

const styles: Record<OrderStatus, string> = {
  placed: "bg-blue-100 text-blue-800",
  shipped: "bg-green-100 text-green-800",
};

export function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${styles[status]}`}>
      {status}
    </span>
  );
}
