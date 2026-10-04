"use client";

import { useActionState } from "react";
import { addToCartAction } from "@/app/cart/actions";

export function AddToCartForm({ bookId }: { bookId: number }) {
  const [state, formAction, pending] = useActionState(addToCartAction, { error: null });

  return (
    <form action={formAction} className="space-y-2">
      <input type="hidden" name="bookId" value={bookId} />
      <div className="flex items-end gap-2">
        <label className="block text-sm font-medium">
          Quantity
          <input
            name="quantity"
            type="number"
            min="1"
            step="1"
            required
            defaultValue="1"
            className="mt-1 w-20 rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
        </label>
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
        >
          Add to cart
        </button>
      </div>
      {state.error && (
        <p aria-live="polite" className="text-sm text-red-700">
          {state.error}
        </p>
      )}
    </form>
  );
}
