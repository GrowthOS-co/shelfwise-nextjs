import { desc, eq, max, sql } from "drizzle-orm";
import type { Db, Tx } from "@/db";
import { books, cartItems, orderItems, orders, type OrderItem } from "@/db/schema";
import { cartLines, stockError } from "./cart";
import { ShopError } from "./shop-error";

export type CheckoutDetails = {
  customerName: string;
  email: string;
  shippingAddress: string;
};

// Priced at the prices copied when the order was placed.
export function orderTotal(items: Pick<OrderItem, "quantity" | "unitPriceCents">[]): number {
  return items.reduce((sum, item) => sum + item.quantity * item.unitPriceCents, 0);
}

function withTotals<T extends { items: Pick<OrderItem, "quantity" | "unitPriceCents">[] }>(
  order: T,
) {
  return {
    ...order,
    bookCount: order.items.reduce((sum, item) => sum + item.quantity, 0),
    total: orderTotal(order.items),
  };
}

export function listOrders(db: Db) {
  return db.query.orders
    .findMany({
      with: { items: true },
      orderBy: [desc(orders.createdAt), desc(orders.id)],
    })
    .sync()
    .map(withTotals);
}

export function getOrder(db: Db, id: number) {
  const order = db.query.orders
    .findFirst({ where: eq(orders.id, id), with: { items: true } })
    .sync();
  if (order === undefined) return undefined;
  return withTotals(order);
}

function nextOrderNumber(db: Db | Tx): string {
  const row = db.select({ last: max(orders.id) }).from(orders).get();
  const next = (row?.last ?? 0) + 1;
  return `ORD-${String(next).padStart(4, "0")}`;
}

// Turns the cart into an order: copies each book's title and current price,
// takes the quantities out of stock and empties the cart, all or nothing.
export function placeOrder(
  db: Db,
  cartId: number | undefined,
  details: CheckoutDetails,
  now: Date,
): number {
  return db.transaction((tx) => {
    const lines = cartId === undefined ? [] : cartLines(tx, cartId);
    if (cartId === undefined || lines.length === 0) {
      throw new ShopError("Your cart is empty.");
    }
    for (const line of lines) {
      if (line.quantity > line.book.stock) throw stockError(line.book);
    }

    const { id } = tx
      .insert(orders)
      .values({ ...details, number: nextOrderNumber(tx), createdAt: now.toISOString() })
      .returning({ id: orders.id })
      .get();
    tx.insert(orderItems)
      .values(
        lines.map((line) => ({
          orderId: id,
          bookId: line.book.id,
          title: line.book.title,
          unitPriceCents: line.book.priceCents,
          quantity: line.quantity,
        })),
      )
      .run();
    for (const line of lines) {
      tx.update(books)
        .set({ stock: sql`${books.stock} - ${line.quantity}` })
        .where(eq(books.id, line.book.id))
        .run();
    }
    tx.delete(cartItems).where(eq(cartItems.cartId, cartId)).run();
    return id;
  });
}

export function markOrderShipped(db: Db, id: number, now: Date) {
  const order = db.select().from(orders).where(eq(orders.id, id)).get();
  if (order === undefined) throw new Error(`Order ${id} does not exist.`);
  if (order.status !== "placed") {
    throw new ShopError(`Order ${order.number} is ${order.status} and cannot be shipped.`);
  }
  db.update(orders)
    .set({ status: "shipped", shippedAt: now.toISOString() })
    .where(eq(orders.id, id))
    .run();
}
