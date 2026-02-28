import { Linking, Platform } from 'react-native';

/**
 * Парсит GPS из формата "latitude,longitude" (Decimal Degrees)
 */
export function parseDd(dd: string): { lat: number; lng: number } | null {
  const parts = dd.trim().split(/[,\s]+/);
  if (parts.length < 2) return null;
  const lat = parseFloat(parts[0]);
  const lng = parseFloat(parts[1]);
  if (isNaN(lat) || isNaN(lng)) return null;
  return { lat, lng };
}

/**
 * Открывает место на карте (Geo URI или Google Maps)
 */
export async function openOnMap(dd: string): Promise<void> {
  const coords = parseDd(dd);
  if (!coords) return;
  const url =
    Platform.OS === 'ios'
      ? `maps:?q=${coords.lat},${coords.lng}`
      : `https://www.google.com/maps/search/?api=1&query=${coords.lat},${coords.lng}`;
  await Linking.openURL(url);
}

/**
 * Открывает маршрут до места в навигаторе
 */
export async function openInNavigator(dd: string): Promise<void> {
  const coords = parseDd(dd);
  if (!coords) return;
  const url =
    Platform.OS === 'ios'
      ? `maps:?daddr=${coords.lat},${coords.lng}&dirflg=d`
      : `https://www.google.com/maps/dir/?api=1&destination=${coords.lat},${coords.lng}`;
  await Linking.openURL(url);
}
