import { cookies } from "next/headers";
import { db } from "@/db";
import { findCart } from "@/lib/cart";

// The browser keeps its cart's token in this cookie.
export const CART_COOKIE = "cart_token";

// This browser's cart, if it has one.
export async function currentCart() {
  const token = (await cookies()).get(CART_COOKIE)?.value;
  return token === undefined ? undefined : findCart(db, token);
}
