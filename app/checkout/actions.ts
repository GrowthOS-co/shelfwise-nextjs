"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { placeOrder, type CheckoutDetails } from "@/lib/orders";
import { ShopError } from "@/lib/shop-error";
import { currentCart } from "@/app/cart/current-cart";

// What was typed comes back with the error, so the form keeps it.
export type CheckoutFormState = { error: string | null; details: CheckoutDetails };

export async function placeOrderAction(
  _state: CheckoutFormState,
  form: FormData,
): Promise<CheckoutFormState> {
  const details: CheckoutDetails = {
    customerName: String(form.get("customerName")).trim(),
    email: String(form.get("email")).trim(),
    shippingAddress: String(form.get("shippingAddress")).trim(),
  };
  const cart = await currentCart();
  let id: number;
  try {
    id = placeOrder(db, cart?.id, details, new Date());
  } catch (error) {
    if (error instanceof ShopError) return { error: error.message, details };
    throw error;
  }
  revalidatePath("/", "layout");
  redirect(`/orders/${id}`);
}
