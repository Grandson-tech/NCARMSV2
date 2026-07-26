import { selectRows, callDatabaseFunction } from '../../supabase/database.js';

const CYCLE_COLUMNS = 'id, name, year, is_active';
let cachedActiveCycle = null;
let hasLoadedActiveCycle = false;
let activeCycleRequest = null;
const listeners = new Set();

/**
 * Subscribe to active cycle changes.
 * Returns an unsubscribe function.
 */
export function subscribeToActiveCycleChanges(callback) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

/**
 * Notify all listeners of a cycle change.
 */
function notifyListeners(cycle) {
  listeners.forEach(callback => callback(cycle));
}

/**
 * Fetch the active cycle from the database and cache it.
 * This is the single source of truth retrieval.
 */
export async function loadAndCacheActiveCycle({ force = false } = {}) {
  if (!force && hasLoadedActiveCycle) return cachedActiveCycle;
  if (!force && activeCycleRequest) return activeCycleRequest;
  activeCycleRequest = selectRows('attachment_cycles', {
    columns: CYCLE_COLUMNS,
    filters: { is_active: true },
  }).then((cycles) => {
    const activeCycle = cycles[0] || null;
    cachedActiveCycle = activeCycle ? {
      id: activeCycle.id,
      name: activeCycle.name,
      year: activeCycle.year,
      isActive: true,
    } : null;
    hasLoadedActiveCycle = true;
    return cachedActiveCycle;
  }).finally(() => { activeCycleRequest = null; });
  return activeCycleRequest;
}

/**
 * Get the cached active cycle without fetching from DB.
 * Returns null if not yet loaded.
 */
export function getCachedActiveCycle() {
  return cachedActiveCycle;
}

/**
 * Get the active cycle, loading from cache or DB if needed.
 */
export async function getActiveCycle() {
  if (hasLoadedActiveCycle) {
    return cachedActiveCycle;
  }
  return loadAndCacheActiveCycle();
}

/**
 * Activate a cycle and notify all listeners.
 * Updates the cache and fires change events.
 */
export async function activateAndNotifyCycle(cycleId) {
  // Update in database
  await callDatabaseFunction('activate_attachment_cycle', { target_cycle_id: cycleId });
  
  // Reload cache from database
  await loadAndCacheActiveCycle({ force: true });
  
  // Notify all listeners of the change
  notifyListeners(cachedActiveCycle);
}

/**
 * Clear the cache (useful for testing or forcing a refresh).
 */
export function clearActiveCycleCache() {
  cachedActiveCycle = null;
  hasLoadedActiveCycle = false;
  activeCycleRequest = null;
}
