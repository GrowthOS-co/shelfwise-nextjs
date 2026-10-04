"use server";

import { notFound, redirect } from "next/navigation";
import { db } from "@/db";
import { getOrder, markOrderShipped } from "@/lib/orders";
import { ShopError } from "@/lib/shop-error";

// Like the cart forms, the order id comes as a field rather than bound to the
// action (see app/cart/actions.ts).
export type MarkShippedFormState = { error: string | null };

export async function markOrderShippedAction(
  _state: MarkShippedFormState,
  form: FormData,
): Promise<MarkShippedFormState> {
  const id = Number(form.get("orderId"));
  if (getOrder(db, id) === undefined) notFound();
  try {
    markOrderShipped(db, id, new Date());
  } catch (error) {
    if (error instanceof ShopError) return { error: error.message };
    throw error;
  }
  redirect(`/orders/${id}`);
}
