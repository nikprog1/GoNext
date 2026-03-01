import { getDb } from './db';
import { generateUUID } from '../utils/uuid';
import type { Place } from '../types';

function parsePlace(row: Record<string, unknown>): Place {
  const photos = JSON.parse(String(row.photos ?? '[]')) as string[];
  return {
    id: String(row.id),
    name: String(row.name),
    description: String(row.description),
    visitlater: Boolean(row.visitlater),
    liked: Boolean(row.liked),
    dd: String(row.dd),
    photos,
    createdAt: String(row.createdAt),
  };
}

export async function getAllPlaces(): Promise<Place[]> {
  const db = await getDb();
  const result = await db.getAllAsync<Record<string, unknown>>(
    'SELECT * FROM places ORDER BY createdAt DESC'
  );
  return result.map(parsePlace);
}

export async function getPlaceById(id: string): Promise<Place | null> {
  const db = await getDb();
  const result = await db.getFirstAsync<Record<string, unknown>>(
    'SELECT * FROM places WHERE id = ?',
    [id]
  );
  return result ? parsePlace(result) : null;
}

export async function createPlace(place: Omit<Place, 'id' | 'createdAt'>): Promise<Place> {
  const db = await getDb();
  const id = generateUUID();
  const createdAt = new Date().toISOString();
  const photos = JSON.stringify(place.photos ?? []);

  await db.runAsync(
    `INSERT INTO places (id, name, description, visitlater, liked, dd, photos, createdAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      place.name,
      place.description,
      place.visitlater ? 1 : 0,
      place.liked ? 1 : 0,
      place.dd,
      photos,
      createdAt,
    ]
  );

  return { ...place, id, photos: place.photos ?? [], createdAt };
}

export async function updatePlace(place: Place): Promise<void> {
  const db = await getDb();
  const photos = JSON.stringify(place.photos);

  await db.runAsync(
    `UPDATE places SET name = ?, description = ?, visitlater = ?, liked = ?, dd = ?, photos = ?
     WHERE id = ?`,
    [
      place.name,
      place.description,
      place.visitlater ? 1 : 0,
      place.liked ? 1 : 0,
      place.dd,
      photos,
      place.id,
    ]
  );
}

export async function deletePlace(id: string): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM places WHERE id = ?', [id]);
}
