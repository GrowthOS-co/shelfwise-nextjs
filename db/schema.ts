import { relations, sql } from "drizzle-orm";
import { check, integer, sqliteTable, text, unique } from "drizzle-orm/sqlite-core";

export const genres = ["Fiction", "Mystery", "Science", "History"] as const;
export type Genre = (typeof genres)[number];

// Money is stored as whole cents.
export const books = sqliteTable(
  "books",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    title: text("title").notNull(),
    author: text("author").notNull(),
    isbn: text("isbn").notNull().unique(),
    genre: text("genre", { enum: genres }).notNull(),
    publishedYear: integer("published_year").notNull(),
    description: text("description").notNull(),
    priceCents: integer("price_cents").notNull(),
    stock: integer("stock").notNull(),
  },
  (table) => [check("books_stock_not_negative", sql`${table.stock} >= 0`)],
);

// Date-times are stored as ISO 8601 text in UTC.
export const carts = sqliteTable("carts", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  token: text("token").notNull().unique(),
  createdAt: text("created_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
});

export const cartItems = sqliteTable(
  "cart_items",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    cartId: integer("cart_id")
      .notNull()
      .references(() => carts.id, { onDelete: "cascade" }),
    bookId: integer("book_id")
      .notNull()
      .references(() => books.id),
    quantity: integer("quantity").notNull(),
  },
  (table) => [
    unique("cart_items_cart_book_unique").on(table.cartId, table.bookId),
    check("cart_items_quantity_positive", sql`${table.quantity} >= 1`),
  ],
);

export const orderStatuses = ["placed", "shipped"] as const;
export type OrderStatus = (typeof orderStatuses)[number];

export const orders = sqliteTable("orders", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  number: text("number").notNull().unique(),
  customerName: text("customer_name").notNull(),
  email: text("email").notNull(),
  shippingAddress: text("shipping_address").notNull(),
  status: text("status", { enum: orderStatuses }).notNull().default("placed"),
  createdAt: text("created_at").notNull(),
  shippedAt: text("shipped_at"),
});

// Title and price are copied when the order is placed, so later changes to
// the book do not change the order.
export const orderItems = sqliteTable("order_items", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  orderId: integer("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  bookId: integer("book_id")
    .notNull()
    .references(() => books.id),
  title: text("title").notNull(),
  unitPriceCents: integer("unit_price_cents").notNull(),
  quantity: integer("quantity").notNull(),
});

export const cartsRelations = relations(carts, ({ many }) => ({
  items: many(cartItems),
}));

export const cartItemsRelations = relations(cartItems, ({ one }) => ({
  cart: one(carts, { fields: [cartItems.cartId], references: [carts.id] }),
  book: one(books, { fields: [cartItems.bookId], references: [books.id] }),
}));

export const ordersRelations = relations(orders, ({ many }) => ({
  items: many(orderItems),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, { fields: [orderItems.orderId], references: [orders.id] }),
  book: one(books, { fields: [orderItems.bookId], references: [books.id] }),
}));

export type Book = typeof books.$inferSelect;
export type Cart = typeof carts.$inferSelect;
export type CartItem = typeof cartItems.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type OrderItem = typeof orderItems.$inferSelect;
