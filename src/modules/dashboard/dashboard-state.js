import { getActiveCycle } from '../../shared/active-cycle-manager.js';
import { loadDashboardStatistics } from './dashboard-service.js';

/**
 * Controller-owned Dashboard state. The active-cycle manager remains the sole
 * owner of active-cycle state; this model only coordinates one refresh result.
 */
export function createDashboardState({ profile }) {
  let snapshot = null;
  let refreshRequest = null;

  const refresh = async (activeCycle = null) => {
    if (refreshRequest) return refreshRequest;
    refreshRequest = Promise.resolve(activeCycle ?? getActiveCycle())
      .then(async (cycle) => Object.freeze({
        profile,
        activeCycle: cycle,
        statistics: await loadDashboardStatistics({ activeCycle: cycle }),
      }))
      .then((nextSnapshot) => {
        snapshot = nextSnapshot;
        return snapshot;
      })
      .finally(() => { refreshRequest = null; });
    return refreshRequest;
  };

  return Object.freeze({ refresh, getSnapshot: () => snapshot });
}
