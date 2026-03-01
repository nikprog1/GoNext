import { getRandomValues } from 'expo-crypto';

const HEX = '0123456789abcdef';

/** Генерирует UUID v4 с помощью expo-crypto (без пакета uuid). */
export function generateUUID(): string {
  const bytes = new Uint8Array(16);
  getRandomValues(bytes);
  bytes[6] = (bytes[6]! & 0x0f) | 0x40;
  bytes[8] = (bytes[8]! & 0x3f) | 0x80;
  let s = '';
  for (let i = 0; i < 16; i++) {
    s += HEX[bytes[i]! >> 4] + HEX[bytes[i]! & 0x0f];
    if (i === 3 || i === 5 || i === 7 || i === 9) s += '-';
  }
  return s;
}
