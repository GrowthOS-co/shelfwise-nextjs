// Replaces everything in the database with the sample shop below. Order times
// are relative to now. The stock figures are what is left after the sample
// orders, so seeding does not take the orders out of stock again.
import { sql } from "drizzle-orm";
import { db } from "./index";
import {
  books,
  cartItems,
  carts,
  orderItems,
  orders,
  type Book,
  type OrderStatus,
} from "./schema";

type SampleBook = Omit<Book, "id">;

const sampleBooks: SampleBook[] = [
  { title: "The Lantern Keeper's Daughter", author: "Clara Whitlow", genre: "Fiction", publishedYear: 2021, priceCents: 1699, stock: 12, isbn: "9781999900014", description: "A lighthouse keeper's daughter inherits the light and a box of unsent letters." },
  { title: "Salt and Saffron", author: "Rafael Okoye", genre: "Fiction", publishedYear: 2019, priceCents: 1499, stock: 8, isbn: "9781999900021", description: "Two rival cooks share one small kitchen for a summer." },
  { title: "A Year Without Winter", author: "Ingrid Solberg", genre: "Fiction", publishedYear: 2023, priceCents: 2199, stock: 5, isbn: "9781999900038", description: "A northern town waits for snow that never comes." },
  { title: "The Quiet Orchard", author: "Hannah Mercer", genre: "Fiction", publishedYear: 2018, priceCents: 1299, stock: 0, isbn: "9781999900045", description: "Three sisters return to sell the family orchard." },
  { title: "Paper Boats", author: "Dev Malhotra", genre: "Fiction", publishedYear: 2022, priceCents: 1599, stock: 20, isbn: "9781999900052", description: "Childhood friends reunite in the city where they grew up." },
  { title: "Tidewater", author: "June Calloway", genre: "Fiction", publishedYear: 2020, priceCents: 1799, stock: 3, isbn: "9781999900069", description: "A ferry captain's last season on the river." },
  { title: "The Ninth Locker", author: "Marcus Hale", genre: "Mystery", publishedYear: 2021, priceCents: 1399, stock: 15, isbn: "9781999900076", description: "A key found in a library book opens a locker no one has rented." },
  { title: "Death at Low Tide", author: "Agnes Pryor", genre: "Mystery", publishedYear: 2017, priceCents: 1199, stock: 9, isbn: "9781999900083", description: "A body on the sandbar and only one set of footprints." },
  { title: "The Cartographer's Alibi", author: "Simone Duval", genre: "Mystery", publishedYear: 2022, priceCents: 1899, stock: 6, isbn: "9781999900090", description: "A mapmaker swears she was somewhere that does not exist." },
  { title: "Cold Case at Fern Hollow", author: "Peter Lindqvist", genre: "Mystery", publishedYear: 2019, priceCents: 1299, stock: 2, isbn: "9781999900106", description: "A retired detective reopens the case that ended his career." },
  { title: "Silent Bell", author: "Okonkwo Adeyemi", genre: "Mystery", publishedYear: 2023, priceCents: 2099, stock: 11, isbn: "9781999900113", description: "The church bell stops ringing the night the organist vanishes." },
  { title: "The Last Train to Halden", author: "Ruth Ellery", genre: "Mystery", publishedYear: 2020, priceCents: 1499, stock: 0, isbn: "9781999900120", description: "Six passengers, one stalled train, and a missing ticket." },
  { title: "Small Worlds: A Field Guide to Microbes", author: "Elena Ruiz", genre: "Science", publishedYear: 2021, priceCents: 2499, stock: 7, isbn: "9781999900137", description: "The tiny life all around us, with photographs and simple experiments." },
  { title: "The Shape of Time", author: "Arjun Sen", genre: "Science", publishedYear: 2018, priceCents: 2299, stock: 4, isbn: "9781999900144", description: "How clocks, planets and physics agree on what a second is." },
  { title: "Rivers of Air", author: "Molly Hargreaves", genre: "Science", publishedYear: 2022, priceCents: 1999, stock: 10, isbn: "9781999900151", description: "The winds and currents that carry weather around the world." },
  { title: "Why Bridges Stand", author: "Tomas Novak", genre: "Science", publishedYear: 2020, priceCents: 2699, stock: 5, isbn: "9781999900168", description: "The engineering behind ten famous bridges." },
  { title: "The Clever Octopus", author: "Fiona Banks", genre: "Science", publishedYear: 2023, priceCents: 1799, stock: 14, isbn: "9781999900175", description: "What scientists have learned about how octopuses think." },
  { title: "Counting the Stars", author: "Kenji Mori", genre: "Science", publishedYear: 2019, priceCents: 2199, stock: 1, isbn: "9781999900182", description: "A short history of measuring the night sky." },
  { title: "The Spice Roads", author: "Leila Nasser", genre: "History", publishedYear: 2020, priceCents: 2899, stock: 6, isbn: "9781999900199", description: "Traders, ports and the routes that carried pepper and cinnamon." },
  { title: "Empire of Clay", author: "Victor Hume", genre: "History", publishedYear: 2017, priceCents: 2499, stock: 3, isbn: "9781999900205", description: "The rise and fall of an ancient kingdom of potters." },
  { title: "Harbor Lights: A History of Lighthouses", author: "Grace Okafor", genre: "History", publishedYear: 2021, priceCents: 1999, stock: 8, isbn: "9781999900212", description: "Two thousand years of keeping ships off the rocks." },
  { title: "The Printer's Revolution", author: "Samuel Wren", genre: "History", publishedYear: 2018, priceCents: 2299, stock: 9, isbn: "9781999900229", description: "How cheap printing changed who could read and what they read." },
  { title: "Letters from the Front", author: "Anne Delacroix", genre: "History", publishedYear: 2022, priceCents: 1899, stock: 12, isbn: "9781999900236", description: "Ordinary soldiers' letters home, collected and explained." },
  { title: "Cities Under Sand", author: "Hamid Rahimi", genre: "History", publishedYear: 2023, priceCents: 2699, stock: 4, isbn: "9781999900243", description: "Desert cities lost and found again by archaeologists." },
];

type SampleOrder = {
  customerName: string;
  email: string;
  shippingAddress: string;
  placedHoursAgo: number;
  status: OrderStatus;
  shippedHoursAgo?: number;
  items: [book: number, quantity: number][]; // book is an index into sampleBooks
};

const sampleOrders: SampleOrder[] = [
  { customerName: "Ben Turner", email: "ben.turner@example.com", shippingAddress: "14 Elm Street\nSpringfield, IL 62704", placedHoursAgo: 9 * 24, status: "shipped", shippedHoursAgo: 7 * 24, items: [[0, 1], [12, 1]] },
  { customerName: "Mira Shah", email: "mira.shah@example.com", shippingAddress: "88 Harbor Road\nPortland, ME 04101", placedHoursAgo: 2 * 24, status: "placed", items: [[6, 2]] },
  { customerName: "Carlos Mendes", email: "carlos.mendes@example.com", shippingAddress: "301 Pine Avenue, Apt 4B\nAustin, TX 78701", placedHoursAgo: 3, status: "placed", items: [[18, 1], [4, 1], [16, 1]] },
];

const now = Date.now();

function hoursAgo(hours: number): string {
  return new Date(now - hours * 3_600_000).toISOString();
}

db.transaction((tx) => {
  tx.delete(orderItems).run();
  tx.delete(orders).run();
  tx.delete(cartItems).run();
  tx.delete(carts).run();
  tx.delete(books).run();
  tx.run(sql`DELETE FROM sqlite_sequence`);

  const bookIds = sampleBooks.map(
    (book) => tx.insert(books).values(book).returning({ id: books.id }).get().id,
  );

  sampleOrders.forEach((sample, index) => {
    const { id } = tx
      .insert(orders)
      .values({
        number: `ORD-${String(index + 1).padStart(4, "0")}`,
        customerName: sample.customerName,
        email: sample.email,
        shippingAddress: sample.shippingAddress,
        status: sample.status,
        createdAt: hoursAgo(sample.placedHoursAgo),
        shippedAt: sample.shippedHoursAgo === undefined ? null : hoursAgo(sample.shippedHoursAgo),
      })
      .returning({ id: orders.id })
      .get();
    tx.insert(orderItems)
      .values(
        sample.items.map(([book, quantity]) => ({
          orderId: id,
          bookId: bookIds[book],
          title: sampleBooks[book].title,
          unitPriceCents: sampleBooks[book].priceCents,
          quantity,
        })),
      )
      .run();
  });
});

console.log(`Seeded ${sampleBooks.length} books and ${sampleOrders.length} orders.`);
