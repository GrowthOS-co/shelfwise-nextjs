import { asc, eq } from "drizzle-orm";
import type { Db } from "@/db";
import { books, type Genre } from "@/db/schema";

export function listBooks(db: Db, genre: Genre | null) {
  return db
    .select()
    .from(books)
    .where(genre === null ? undefined : eq(books.genre, genre))
    .orderBy(asc(books.title))
    .all();
}

export function getBook(db: Db, id: number) {
  return db.select().from(books).where(eq(books.id, id)).get();
}
