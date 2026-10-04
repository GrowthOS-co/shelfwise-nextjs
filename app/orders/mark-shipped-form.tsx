"use client";

import { useActionState } from "react";
import { markOrderShippedAction } from "./actions";

export function MarkShippedForm({ orderId }: { orderId: number }) {
  const [state, formAction, pending] = useActionState(markOrderShippedAction, { error: null });

  return (
    <form action={formAction} className="text-right">
      <input type="hidden" name="orderId" value={orderId} />
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-green-700 px-4 py-2 text-sm font-medium text-white hover:bg-green-600"
      >
        Mark as shipped
      </button>
      {state.error && (
        <p aria-live="polite" className="mt-1 text-sm text-red-700">
          {state.error}
        </p>
      )}
    </form>
  );
}
