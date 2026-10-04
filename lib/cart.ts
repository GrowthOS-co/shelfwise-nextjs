import { randomBytes } from "node:crypto";
import { and, asc, eq } from "drizzle-orm";
import type { Db, Tx } from "@/db";
import { books, cartItems, carts, type Book } from "@/db/schema";
import { ShopError } from "./shop-error";

export function stockError(book: Pick<Book, "title" | "stock">): ShopError {
  if (book.stock === 0) return new ShopError(`${book.title} is out of stock.`);
  return new ShopError(`Only ${book.stock} left in stock of ${book.title}.`);
}

export function findCart(db: Db | Tx, token: string) {
  return db.select().from(carts).where(eq(carts.token, token)).get();
}

export function createCart(db: Db | Tx) {
  return db
    .insert(carts)
    .values({ token: randomBytes(16).toString("hex") })
    .returning()
    .get();
}

export function cartLines(db: Db | Tx, cartId: number) {
  return db.query.cartItems
    .findMany({
      where: eq(cartItems.cartId, cartId),
      with: { book: true },
      orderBy: asc(cartItems.id),
    })
    .sync();
}

export function findCartItem(db: Db | Tx, cartId: number, bookId: number) {
  return db
    .select()
    .from(cartItems)
    .where(and(eq(cartItems.cartId, cartId), eq(cartItems.bookId, bookId)))
    .get();
}

// Priced at the book's current price: a cart is not an order yet.
export function cartTotal(
  lines: { quantity: number; book: Pick<Book, "priceCents"> }[],
): number {
  return lines.reduce((sum, line) => sum + line.quantity * line.book.priceCents, 0);
}

export function cartCount(lines: { quantity: number }[]): number {
  return lines.reduce((sum, line) => sum + line.quantity, 0);
}

function findBook(db: Db | Tx, id: number) {
  const book = db.select().from(books).where(eq(books.id, id)).get();
  if (book === undefined) throw new Error(`Book ${id} does not exist.`);
  return book;
}

// Adds to the cart with this token, creating a cart when there is none.
// Returns the token of the cart the book went into.
export function addToCart(
  db: Db,
  token: string | undefined,
  bookId: number,
  quantity: number,
): string {
  return db.transaction((tx) => {
    const book = findBook(tx, bookId);
    const cart = (token === undefined ? undefined : findCart(tx, token)) ?? createCart(tx);
    const item = findCartItem(tx, cart.id, bookId);
    const newQuantity = (item?.quantity ?? 0) + quantity;
    if (newQuantity > book.stock) throw stockError(book);

    if (item === undefined) {
      tx.insert(cartItems).values({ cartId: cart.id, bookId, quantity }).run();
    } else {
      tx.update(cartItems)
        .set({ quantity: newQuantity })
        .where(eq(cartItems.id, item.id))
        .run();
    }
    return cart.token;
  });
}

// A quantity of 0 removes the line.
export function updateCartLine(db: Db, cartId: number, bookId: number, quantity: number) {
  if (quantity === 0) {
    removeCartLine(db, cartId, bookId);
    return;
  }
  const book = findBook(db, bookId);
  if (quantity > book.stock) throw stockError(book);
  db.update(cartItems)
    .set({ quantity })
    .where(and(eq(cartItems.cartId, cartId), eq(cartItems.bookId, bookId)))
    .run();
}

export function removeCartLine(db: Db, cartId: number, bookId: number) {
  db.delete(cartItems)
    .where(and(eq(cartItems.cartId, cartId), eq(cartItems.bookId, bookId)))
    .run();
}
