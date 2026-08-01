export function normalizeUniversity(value) {
  if (typeof value !== 'string') return '';
  return value
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase()
    .replace(/\b(?:university|college|institute|polytechnic|technical|school)\b/g, (match) => match.toLowerCase())
    .replace(/\b(?:of)\b/g, 'of')
    .trim();
}

export function formatUniversityName(value) {
  const normalized = normalizeUniversity(value);
  if (!normalized) return '';
  return normalized
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
