"use client";

import Link from "next/link";
import { useActionState } from "react";
import { formatCents } from "@/lib/money";
import { removeCartLineAction, updateCartLineAction } from "./actions";

export function CartLine({
  line,
}: {
  line: { quantity: number; book: { id: number; title: string; priceCents: number } };
}) {
  const [state, formAction, pending] = useActionState(updateCartLineAction, { error: null });

  return (
    <tr className="align-top">
      <td className="px-4 py-2">
        <Link href={`/books/${line.book.id}`} className="font-medium text-blue-700 hover:underline">
          {line.book.title}
        </Link>
      </td>
      <td className="px-4 py-2 text-right">{formatCents(line.book.priceCents)}</td>
      <td className="px-4 py-2">
        <form action={formAction} className="flex justify-end gap-2">
          <input type="hidden" name="bookId" value={line.book.id} />
          <input
            name="quantity"
            type="number"
            min="0"
            step="1"
            required
            defaultValue={line.quantity}
            aria-label="Quantity"
            className="w-20 rounded-md border border-gray-300 px-2 py-1 text-sm"
          />
          <button
            type="submit"
            disabled={pending}
            className="rounded-md border border-gray-300 bg-white px-3 py-1 text-sm font-medium hover:bg-gray-50"
          >
            Update
          </button>
        </form>
        {state.error && (
          <p aria-live="polite" className="mt-1 text-right text-sm text-red-700">
            {state.error}
          </p>
        )}
      </td>
      <td className="px-4 py-2">
        <form action={removeCartLineAction.bind(null, line.book.id)}>
          <button type="submit" className="text-sm text-gray-500 hover:text-red-700">
            Remove
          </button>
        </form>
      </td>
      <td className="px-4 py-2 text-right">{formatCents(line.quantity * line.book.priceCents)}</td>
    </tr>
  );
}
