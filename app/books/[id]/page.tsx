import { notFound } from "next/navigation";
import { db } from "@/db";
import { getBook } from "@/lib/books";
import { formatCents } from "@/lib/money";
import { BookCover } from "@/app/book-cover";
import { AddToCartForm } from "../add-to-cart-form";

export default async function BookPage({ params }: PageProps<"/books/[id]">) {
  const { id } = await params;
  const book = getBook(db, Number(id));
  if (book === undefined) notFound();

  return (
    <div className="grid gap-8 sm:grid-cols-[14rem_1fr]">
      <BookCover book={book} />

      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">{book.title}</h1>
          <p className="text-gray-600">by {book.author}</p>
        </div>

        <p>{book.description}</p>

        <dl className="grid gap-4 rounded-lg border border-gray-200 bg-white p-5 text-sm sm:grid-cols-3">
          <div>
            <dt className="text-gray-500">Genre</dt>
            <dd className="font-medium">{book.genre}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Published</dt>
            <dd className="font-medium">{book.publishedYear}</dd>
          </div>
          <div>
            <dt className="text-gray-500">ISBN</dt>
            <dd className="font-medium">{book.isbn}</dd>
          </div>
        </dl>

        <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-5">
          <p>
            <span className="text-2xl font-semibold">{formatCents(book.priceCents)}</span>
            <span className={`ml-3 text-sm ${book.stock === 0 ? "text-red-700" : "text-gray-500"}`}>
              {book.stock === 0 ? "Out of stock" : `${book.stock} in stock`}
            </span>
          </p>
          {book.stock > 0 && <AddToCartForm bookId={book.id} />}
        </div>
      </div>
    </div>
  );
}
