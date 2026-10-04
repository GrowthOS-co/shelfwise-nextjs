"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { db } from "@/db";
import { getBook } from "@/lib/books";
import { addToCart, findCartItem, removeCartLine, updateCartLine } from "@/lib/cart";
import { ShopError } from "@/lib/shop-error";
import { CART_COOKIE, currentCart } from "./current-cart";

// The add and update forms show a refused request's error next to the form.
// They send the book id as a field rather than binding it to the action: with
// useActionState and a bound action, a form posted without JavaScript never
// gets a response.
export type CartFormState = { error: string | null };

export async function addToCartAction(
  _state: CartFormState,
  form: FormData,
): Promise<CartFormState> {
  const bookId = Number(form.get("bookId"));
  if (getBook(db, bookId) === undefined) notFound();
  const cookieStore = await cookies();
  let token: string;
  try {
    token = addToCart(
      db,
      cookieStore.get(CART_COOKIE)?.value,
      bookId,
      Number(form.get("quantity")),
    );
  } catch (error) {
    if (error instanceof ShopError) return { error: error.message };
    throw error;
  }
  cookieStore.set(CART_COOKIE, token, { httpOnly: true, sameSite: "lax", path: "/" });
  revalidatePath("/", "layout");
  redirect("/cart");
}

// The cart line for this book in this browser's cart; 404 when there is none.
async function cartWithLine(bookId: number) {
  const cart = await currentCart();
  if (cart === undefined || findCartItem(db, cart.id, bookId) === undefined) notFound();
  return cart;
}

export async function updateCartLineAction(
  _state: CartFormState,
  form: FormData,
): Promise<CartFormState> {
  const bookId = Number(form.get("bookId"));
  const cart = await cartWithLine(bookId);
  try {
    updateCartLine(db, cart.id, bookId, Number(form.get("quantity")));
  } catch (error) {
    if (error instanceof ShopError) return { error: error.message };
    throw error;
  }
  revalidatePath("/", "layout");
  return { error: null };
}

export async function removeCartLineAction(bookId: number) {
  const cart = await cartWithLine(bookId);
  removeCartLine(db, cart.id, bookId);
  revalidatePath("/", "layout");
}
