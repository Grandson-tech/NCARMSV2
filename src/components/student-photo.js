function initialsFor(fullName) {
  const initials = String(fullName ?? '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
  return initials || 'ST';
}

export function createStudentPhoto({ url, fullName, size = 'h-24 w-24' }) {
  const container = document.createElement('div');
  container.className = `flex ${size} shrink-0 items-center justify-center overflow-hidden rounded-full bg-blue-50 text-sm font-semibold text-blue-800 ring-1 ring-inset ring-blue-100`;
  const renderInitials = () => {
    container.replaceChildren();
    container.textContent = initialsFor(fullName);
    container.setAttribute('aria-label', `Initials avatar for ${fullName || 'student'}`);
  };
  const imageUrl = typeof url === 'string' ? url.trim() : '';
  if (!imageUrl) {
    renderInitials();
    return container;
  }
  renderInitials();
  resolvePassportPhotoUrl(imageUrl).then((resolvedUrl) => {
    if (!resolvedUrl) return;
    const image = document.createElement('img');
    image.className = 'h-full w-full object-cover';
    image.src = resolvedUrl;
    image.alt = `Passport photo of ${fullName || 'student'}`;
    image.addEventListener('error', renderInitials, { once: true });
    container.replaceChildren(image);
    container.removeAttribute('aria-label');
  }).catch(renderInitials);
  return container;
}
import { resolvePassportPhotoUrl } from '../shared/passport-photo-storage.js';
