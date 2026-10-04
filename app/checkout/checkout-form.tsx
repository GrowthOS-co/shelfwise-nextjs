"use client";

import { useActionState } from "react";
import { placeOrderAction } from "./actions";

const input = "mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm";

export function CheckoutForm() {
  const [state, formAction, pending] = useActionState(placeOrderAction, {
    error: null,
    details: { customerName: "", email: "", shippingAddress: "" },
  });

  return (
    <form action={formAction} className="space-y-4 rounded-lg border border-gray-200 bg-white p-6">
      {state.error && (
        <p aria-live="polite" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-medium">
          Name
          <input name="customerName" required defaultValue={state.details.customerName} className={input} />
        </label>
        <label className="block text-sm font-medium">
          Email
          <input name="email" type="email" required defaultValue={state.details.email} className={input} />
        </label>
      </div>
      <label className="block text-sm font-medium">
        Shipping address
        <textarea name="shippingAddress" rows={3} required defaultValue={state.details.shippingAddress} className={input} />
      </label>
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
      >
        Place order
      </button>
    </form>
  );
}
