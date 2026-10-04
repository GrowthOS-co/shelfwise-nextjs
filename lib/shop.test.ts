import { eq } from "drizzle-orm";
import { beforeEach, describe, expect, it } from "vitest";
import type { Db } from "@/db";
import { books, orders, type Book } from "@/db/schema";
import { getBook } from "./books";
import { addToCart, cartLines, cartTotal, createCart, findCart } from "./cart";
import { getOrder, placeOrder } from "./orders";
import { ShopError } from "./shop-error";
import { testDatabase } from "./test-database";

let db: Db;
let nextIsbn = 9781999900014;

beforeEach(() => {
  db = testDatabase();
});

function addBook(overrides: Partial<Omit<Book, "id">> = {}): number {
  return db
    .insert(books)
    .values({
      title: "Salt and Saffron",
      author: "Rafael Okoye",
      isbn: String(nextIsbn++),
      genre: "Fiction",
      publishedYear: 2019,
      description: "Two rival cooks share one small kitchen for a summer.",
      priceCents: 1499,
      stock: 10,
      ...overrides,
    })
    .returning({ id: books.id })
    .get().id;
}

const details = {
  customerName: "Mira Shah",
  email: "mira.shah@example.com",
  shippingAddress: "88 Harbor Road\nPortland, ME 04101",
};

function cartOf(token: string) {
  const cart = findCart(db, token);
  if (cart === undefined) throw new Error(`No cart with token ${token}.`);
  return cart;
}

describe("cartTotal", () => {
  it("adds up quantity times each book's current price", () => {
    const lantern = addBook({ title: "The Lantern Keeper's Daughter", priceCents: 1699 });
    const locker = addBook({ title: "The Ninth Locker", priceCents: 1399 });
    const token = addToCart(db, undefined, lantern, 2);
    addToCart(db, token, locker, 1);

    expect(cartTotal(cartLines(db, cartOf(token).id))).toBe(4797);
  });
});

describe("addToCart", () => {
  it("refuses to go over the stock and leaves the cart as it was", () => {
    const book = addBook({ title: "Cold Case at Fern Hollow", stock: 2 });
    const token = addToCart(db, undefined, book, 2);

    expect(() => addToCart(db, token, book, 1)).toThrow(
      new ShopError("Only 2 left in stock of Cold Case at Fern Hollow."),
    );
    expect(cartLines(db, cartOf(token).id).map((line) => line.quantity)).toEqual([2]);
  });
});

describe("placeOrder", () => {
  it("copies titles and prices, takes the books out of stock and empties the cart", () => {
    const lantern = addBook({ title: "The Lantern Keeper's Daughter", priceCents: 1699, stock: 12 });
    const locker = addBook({ title: "The Ninth Locker", priceCents: 1399, stock: 15 });
    const token = addToCart(db, undefined, lantern, 2);
    addToCart(db, token, locker, 1);
    const cart = cartOf(token);

    const id = placeOrder(db, cart.id, details, new Date("2026-10-03T16:05:00Z"));
    db.update(books).set({ priceCents: 9999 }).where(eq(books.id, lantern)).run();

    const order = getOrder(db, id);
    expect(order?.number).toBe("ORD-0001");
    expect(
      order?.items.map((item) => [item.title, item.unitPriceCents, item.quantity]),
    ).toEqual([
      ["The Lantern Keeper's Daughter", 1699, 2],
      ["The Ninth Locker", 1399, 1],
    ]);
    expect(order?.total).toBe(4797);
    expect(getBook(db, lantern)?.stock).toBe(10);
    expect(getBook(db, locker)?.stock).toBe(14);
    expect(cartLines(db, cart.id)).toEqual([]);
  });

  it("refuses an empty cart and creates no order", () => {
    const cart = createCart(db);

    expect(() => placeOrder(db, cart.id, details, new Date())).toThrow(
      new ShopError("Your cart is empty."),
    );
    expect(db.select().from(orders).all()).toEqual([]);
  });
});
