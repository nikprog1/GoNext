import * as SQLite from 'expo-sqlite';

const DB_NAME = 'gonext.db';

let db: SQLite.SQLiteDatabase | null = null;

export async function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (db) return db;
  db = await SQLite.openDatabaseAsync(DB_NAME);
  await initSchema(db);
  return db;
}

async function initSchema(database: SQLite.SQLiteDatabase): Promise<void> {
  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS places (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      visitlater INTEGER NOT NULL DEFAULT 1,
      liked INTEGER NOT NULL DEFAULT 0,
      dd TEXT NOT NULL,
      photos TEXT NOT NULL DEFAULT '[]',
      createdAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS trips (
      id TEXT PRIMARY KEY NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      startDate TEXT NOT NULL,
      endDate TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      current INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS trip_places (
      trip_id TEXT NOT NULL,
      place_id TEXT NOT NULL,
      ord INTEGER NOT NULL,
      visited INTEGER NOT NULL DEFAULT 0,
      visit_date TEXT,
      notes TEXT NOT NULL DEFAULT '',
      photos TEXT NOT NULL DEFAULT '[]',
      PRIMARY KEY (trip_id, place_id),
      FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE,
      FOREIGN KEY (place_id) REFERENCES places(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_trip_places_trip ON trip_places(trip_id);
    CREATE INDEX IF NOT EXISTS idx_trip_places_place ON trip_places(place_id);
  `);
  await migratePlacesAddTravelNotes(database);
}

async function migratePlacesAddTravelNotes(database: SQLite.SQLiteDatabase): Promise<void> {
  try {
    await database.execAsync(
      `ALTER TABLE places ADD COLUMN travelNotes TEXT NOT NULL DEFAULT ''`
    );
  } catch {
    // колонка уже существует
  }
}
