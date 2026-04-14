import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const DB_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DB_DIR, "restaurants.db");

if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

let db: Database.Database;

function getDb(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma("journal_mode = WAL");
    db.pragma("foreign_keys = ON");
    initializeSchema(db);
  }
  return db;
}

function initializeSchema(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS restaurants (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      genre TEXT NOT NULL,
      price_range TEXT NOT NULL CHECK(price_range IN ('~2000', '2000~4000', '4000~6000', '6000~')),
      location TEXT NOT NULL,
      capacity INTEGER,
      url TEXT,
      notes TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
    );

    CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      organizer TEXT NOT NULL,
      scheduled_date TEXT,
      status TEXT NOT NULL DEFAULT 'voting' CHECK(status IN ('voting', 'decided', 'done')),
      decided_restaurant_id INTEGER REFERENCES restaurants(id),
      created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
    );

    CREATE TABLE IF NOT EXISTS event_candidates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
      restaurant_id INTEGER NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
      UNIQUE(event_id, restaurant_id)
    );

    CREATE TABLE IF NOT EXISTS votes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
      restaurant_id INTEGER NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
      voter_name TEXT NOT NULL,
      comment TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
      UNIQUE(event_id, voter_name)
    );

    CREATE TABLE IF NOT EXISTS visit_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      restaurant_id INTEGER NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
      event_id INTEGER REFERENCES events(id),
      visited_date TEXT NOT NULL,
      participant_count INTEGER,
      rating INTEGER CHECK(rating BETWEEN 1 AND 5),
      comment TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
    );
  `);
}

export default getDb;
