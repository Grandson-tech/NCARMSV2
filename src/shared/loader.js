/** Loads a reusable HTML fragment into a target element. */
export async function loadFragment(target, path) {
  const response = await fetch(path);

  if (!response.ok) {
    throw new Error(`Unable to load layout fragment: ${path}`);
  }

  target.innerHTML = await response.text();
}
