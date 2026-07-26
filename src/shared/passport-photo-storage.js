import { DOCUMENT_STORAGE_BUCKET } from '../config/document-storage.js';
import { createSignedFileUrl, removeFiles, uploadFile } from '../../supabase/storage.js';
import { createPassportPhotoStoragePath } from './document-storage-path.js';

export const PASSPORT_PHOTO_MAX_BYTES = 2 * 1024 * 1024;
export const PASSPORT_PHOTO_ALLOWED_TYPES = Object.freeze(['image/jpeg', 'image/png', 'image/webp']);

const signedUrlCache = new Map();

export function getPassportPhotoValidationMessage(file) {
  if (!file) return '';
  if (!PASSPORT_PHOTO_ALLOWED_TYPES.includes(file.type)) return 'Choose a JPEG, PNG, or WEBP passport photo.';
  if (file.size <= 0) return 'Choose a non-empty passport photo file.';
  if (file.size > PASSPORT_PHOTO_MAX_BYTES) return 'Passport photo must be 2 MB or smaller.';
  return '';
}

function isExternalUrl(reference) {
  return /^(https?:|data:|blob:)/i.test(reference);
}

function normaliseReference(reference) {
  return typeof reference === 'string' ? reference.trim() : '';
}

export async function uploadPassportPhoto(file) {
  const validationMessage = getPassportPhotoValidationMessage(file);
  if (validationMessage) throw new Error(validationMessage);
  const path = createPassportPhotoStoragePath(file.name);
  await uploadFile(DOCUMENT_STORAGE_BUCKET, path, file, { contentType: file.type, upsert: false });
  return path;
}

export async function removePassportPhoto(reference) {
  const path = normaliseReference(reference);
  if (!path || isExternalUrl(path)) return;
  await removeFiles(DOCUMENT_STORAGE_BUCKET, [path]);
  signedUrlCache.delete(path);
}

export function resolvePassportPhotoUrl(reference) {
  const path = normaliseReference(reference);
  if (!path) return Promise.resolve('');
  if (isExternalUrl(path)) return Promise.resolve(path);
  if (!signedUrlCache.has(path)) {
    const request = createSignedFileUrl(DOCUMENT_STORAGE_BUCKET, path, 3600)
      .then((result) => result?.signedUrl ?? '')
      .catch((error) => {
        signedUrlCache.delete(path);
        throw error;
      });
    signedUrlCache.set(path, request);
  }
  return signedUrlCache.get(path);
}
