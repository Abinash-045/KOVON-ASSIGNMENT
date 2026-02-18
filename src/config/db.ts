import { Db, MongoClient } from 'mongodb';

let client: MongoClient | null = null;
let db: Db | null = null;

export async function connectDb(mongoUri: string, dbName = 'kovon'): Promise<Db> {
  if (db) return db;

  client = new MongoClient(mongoUri);
  await client.connect();
  db = client.db(dbName);
  return db;
}

export function getDb(): Db {
  if (!db) {
    throw new Error('Database not connected. Call connectDb() first.');
  }
  return db;
}

export async function disconnectDb() {
  if (client) {
    await client.close();
  }
  client = null;
  db = null;
}

