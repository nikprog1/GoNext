/** Место в поездке — факт посещения, заметки, фото */
export interface TripPlace {
  placeId: string;
  order: number;
  visited: boolean;
  visitDate: string | null;
  notes: string;
  photos: string[];
}
