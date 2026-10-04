import type { Book, Genre } from "@/db/schema";

const colors: Record<Genre, string> = {
  Fiction: "bg-indigo-600",
  Mystery: "bg-slate-600",
  Science: "bg-teal-600",
  History: "bg-amber-600",
};

// Stands in for a cover picture: a block in the genre's colour with the title.
export function BookCover({ book }: { book: Pick<Book, "title" | "genre"> }) {
  return (
    <div
      className={`flex aspect-[2/3] items-center justify-center rounded-md p-4 text-center font-semibold text-white ${colors[book.genre]}`}
    >
      {book.title}
    </div>
  );
}
