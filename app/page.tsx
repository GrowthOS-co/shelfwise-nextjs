import Link from "next/link";
import { db } from "@/db";
import { genres, type Genre } from "@/db/schema";
import { listBooks } from "@/lib/books";
import { formatCents } from "@/lib/money";
import { BookCover } from "./book-cover";

function parseGenre(value: string | string[] | undefined): Genre | null {
  return genres.find((genre) => genre === value) ?? null;
}

export default async function CataloguePage({ searchParams }: PageProps<"/">) {
  const genre = parseGenre((await searchParams).genre);
  const books = listBooks(db, genre);
  const filters: { label: string; genre: Genre | null }[] = [
    { label: "All", genre: null },
    ...genres.map((g) => ({ label: g, genre: g })),
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Catalogue</h1>

      <nav className="flex gap-2 text-sm">
        {filters.map((filter) => (
          <Link
            key={filter.label}
            href={filter.genre ? `/?genre=${filter.genre}` : "/"}
            className={`rounded-full px-3 py-1 ${
              filter.genre === genre ? "bg-gray-900 text-white" : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            {filter.label}
          </Link>
        ))}
      </nav>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {books.map((book) => (
          <div key={book.id} className="space-y-2 rounded-lg border border-gray-200 bg-white p-4">
            <BookCover book={book} />
            <Link href={`/books/${book.id}`} className="block font-medium text-blue-700 hover:underline">
              {book.title}
            </Link>
            <p className="text-sm text-gray-500">{book.author}</p>
            <p className="text-sm font-medium">
              {formatCents(book.priceCents)}
              {book.stock === 0 && <span className="ml-2 text-red-700">Out of stock</span>}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
