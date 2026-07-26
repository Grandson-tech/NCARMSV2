import { getSupabaseClient } from './client.js';

function unwrap(result) {
  if (result.error) throw result.error;
  return result.data;
}

function getBucket(bucket) {
  if (!bucket || typeof bucket !== 'string') {
    throw new TypeError('A storage bucket name is required.');
  }

  return getSupabaseClient().storage.from(bucket);
}

export function uploadFile(bucket, path, file, options = {}) {
  return getBucket(bucket).upload(path, file, options).then(unwrap);
}

export function downloadFile(bucket, path) {
  return getBucket(bucket).download(path).then(unwrap);
}

export function listFiles(bucket, path = '', options = {}) {
  return getBucket(bucket).list(path, options).then(unwrap);
}

export function removeFiles(bucket, paths) {
  return getBucket(bucket).remove(paths).then(unwrap);
}

export function createSignedFileUrl(bucket, path, expiresIn) {
  return getBucket(bucket).createSignedUrl(path, expiresIn).then(unwrap);
}

export function getPublicFileUrl(bucket, path) {
  return getBucket(bucket).getPublicUrl(path).data;
}
