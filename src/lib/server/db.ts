import { MongoClient, Db } from "mongodb";

// Lazy client: the driver connects on the first operation, so importing this
// module (e.g. during `next build`) never touches the network.
let client: MongoClient | null = null;
let db: Db | null = null;

export function getDb(): Db {
  if (!db) {
    client = new MongoClient(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/fixmate");
    db = client.db();
  }
  return db;
}
