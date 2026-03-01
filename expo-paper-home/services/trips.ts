import { getDb } from './db';
import { generateUUID } from '../utils/uuid';
import { getPlaceById } from './places';
import type { Trip, TripPlace } from '../types';
import type { Place } from '../types';

function parseTrip(row: Record<string, unknown>): Trip {
  return {
    id: String(row.id),
    title: String(row.title),
    description: String(row.description),
    startDate: String(row.startDate),
    endDate: String(row.endDate),
    places: [],
    createdAt: String(row.createdAt),
    current: Boolean(row.current),
  };
}

function parseTripPlace(row: Record<string, unknown>): TripPlace {
  const photos = JSON.parse(String(row.photos ?? '[]')) as string[];
  return {
    placeId: String(row.place_id),
    order: Number(row.ord),
    visited: Boolean(row.visited),
    visitDate: row.visit_date ? String(row.visit_date) : null,
    notes: String(row.notes ?? ''),
    photos,
  };
}

export async function getAllTrips(): Promise<Trip[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<Record<string, unknown>>(
    'SELECT * FROM trips ORDER BY startDate DESC'
  );
  const trips = rows.map(parseTrip);
  for (const trip of trips) {
    trip.places = await getTripPlaces(trip.id);
  }
  return trips;
}

export async function getTripById(id: string): Promise<Trip | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<Record<string, unknown>>(
    'SELECT * FROM trips WHERE id = ?',
    [id]
  );
  if (!row) return null;
  const trip = parseTrip(row);
  trip.places = await getTripPlaces(id);
  return trip;
}

export async function getCurrentTrip(): Promise<Trip | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<Record<string, unknown>>(
    'SELECT * FROM trips WHERE current = 1 LIMIT 1'
  );
  if (!row) return null;
  const trip = parseTrip(row);
  trip.places = await getTripPlaces(trip.id);
  return trip;
}

async function getTripPlaces(tripId: string): Promise<TripPlace[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<Record<string, unknown>>(
    'SELECT * FROM trip_places WHERE trip_id = ? ORDER BY ord',
    [tripId]
  );
  return rows.map(parseTripPlace);
}

export async function createTrip(
  trip: Omit<Trip, 'id' | 'createdAt' | 'places'>
): Promise<Trip> {
  const db = await getDb();
  const id = generateUUID();
  const createdAt = new Date().toISOString();

  await db.runAsync(
    `INSERT INTO trips (id, title, description, startDate, endDate, createdAt, current)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      trip.title,
      trip.description,
      trip.startDate,
      trip.endDate,
      createdAt,
      trip.current ? 1 : 0,
    ]
  );

  return {
    ...trip,
    id,
    places: [],
    createdAt,
  };
}

export async function updateTrip(trip: Trip): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    `UPDATE trips SET title = ?, description = ?, startDate = ?, endDate = ?, current = ?
     WHERE id = ?`,
    [trip.title, trip.description, trip.startDate, trip.endDate, trip.current ? 1 : 0, trip.id]
  );
}

export async function deleteTrip(id: string): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM trip_places WHERE trip_id = ?', [id]);
  await db.runAsync('DELETE FROM trips WHERE id = ?', [id]);
}

export async function setCurrentTrip(tripId: string): Promise<void> {
  const db = await getDb();
  await db.runAsync('UPDATE trips SET current = 0');
  await db.runAsync('UPDATE trips SET current = 1 WHERE id = ?', [tripId]);
}

export async function addPlaceToTrip(
  tripId: string,
  place: Place,
  order?: number
): Promise<void> {
  const db = await getDb();
  const nextOrder =
    order ??
    (await db.getFirstAsync<{ nextOrd: number }>(
      'SELECT COALESCE(MAX(ord), -1) + 1 AS nextOrd FROM trip_places WHERE trip_id = ?',
      [tripId]
    ))?.nextOrd ??
    0;

  const photos = JSON.stringify([]);
  await db.runAsync(
    `INSERT OR REPLACE INTO trip_places (trip_id, place_id, ord, visited, visit_date, notes, photos)
     VALUES (?, ?, ?, 0, NULL, '', ?)`,
    [tripId, place.id, nextOrder, photos]
  );
}

export async function removePlaceFromTrip(tripId: string, placeId: string): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM trip_places WHERE trip_id = ? AND place_id = ?', [
    tripId,
    placeId,
  ]);
}

export async function reorderTripPlaces(
  tripId: string,
  placeIds: string[]
): Promise<void> {
  const db = await getDb();
  for (let i = 0; i < placeIds.length; i++) {
    await db.runAsync(
      'UPDATE trip_places SET ord = ? WHERE trip_id = ? AND place_id = ?',
      [i, tripId, placeIds[i]]
    );
  }
}

export async function updateTripPlace(
  tripId: string,
  placeId: string,
  data: Partial<Pick<TripPlace, 'visited' | 'visitDate' | 'notes' | 'photos'>>
): Promise<void> {
  const db = await getDb();
  const row = await db.getFirstAsync<Record<string, unknown>>(
    'SELECT * FROM trip_places WHERE trip_id = ? AND place_id = ?',
    [tripId, placeId]
  );
  if (!row) return;

  const visited = data.visited !== undefined ? (data.visited ? 1 : 0) : Number(row.visited);
  const visitDate = (data.visitDate ?? row.visit_date) as string | null;
  const notes = String(data.notes ?? row.notes ?? '');
  const photos = JSON.stringify(data.photos ?? JSON.parse(String(row.photos ?? '[]')));

  await db.runAsync(
    `UPDATE trip_places SET visited = ?, visit_date = ?, notes = ?, photos = ?
     WHERE trip_id = ? AND place_id = ?`,
    [visited, visitDate ?? null, notes, photos, tripId, placeId] as (string | number | null)[]
  );
}

/** Следующее место в текущей поездке (первое с visited=false) */
export async function getNextPlace(): Promise<{
  trip: Trip;
  tripPlace: TripPlace;
  place: Place;
} | null> {
  const trip = await getCurrentTrip();
  if (!trip) return null;
  const nextTripPlace = trip.places.find((tp) => !tp.visited);
  if (!nextTripPlace) return null;
  const place = await getPlaceById(nextTripPlace.placeId);
  if (!place) return null;
  return { trip, tripPlace: nextTripPlace, place };
}
