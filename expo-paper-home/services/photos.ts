import {
  documentDirectory,
  makeDirectoryAsync,
  copyAsync,
  getInfoAsync,
  deleteAsync,
} from 'expo-file-system/legacy';
import { generateUUID } from '../utils/uuid';

const PHOTOS_SUBDIR = 'gonext/photos/';

function getPhotosDir(): string {
  const base = documentDirectory;
  if (!base) throw new Error('documentDirectory is not available');
  return `${base}${PHOTOS_SUBDIR}`;
}

async function ensurePhotosDir(): Promise<string> {
  const dir = getPhotosDir();
  const info = await getInfoAsync(dir);
  if (!info.exists || !info.isDirectory) {
    await makeDirectoryAsync(dir, { intermediates: true });
  }
  return dir;
}

/** Сохраняет фото по URI и возвращает локальный путь для хранения в БД */
export async function savePhoto(uri: string): Promise<string> {
  const dir = await ensurePhotosDir();
  const filename = `${generateUUID()}.jpg`;
  const destPath = `${dir}${filename}`;
  await copyAsync({ from: uri, to: destPath });
  return destPath;
}

/** Удаляет фото по пути */
export async function deletePhoto(path: string): Promise<void> {
  try {
    const info = await getInfoAsync(path);
    if (info.exists) {
      await deleteAsync(path);
    }
  } catch {
    // игнорируем ошибки удаления
  }
}

/** Проверяет, существует ли файл по пути */
export async function photoExists(path: string): Promise<boolean> {
  const info = await getInfoAsync(path);
  return info.exists;
}
