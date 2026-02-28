import type { TripPlace } from './trip-place';

/** Поездка — маршрут с датами и упорядоченным списком мест */
export interface Trip {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  places: TripPlace[];
  createdAt: string;
  current: boolean;
}
