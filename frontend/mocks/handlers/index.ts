/**
 * MSW Handlers Index
 * Exports all mock service worker handlers in the correct order
 * 
 * Order matters:
 * 1. Auth handlers (highest priority)
 * 2. Shelter-specific handlers
 * 3. Profile and resource handlers
 * 4. Feature handlers
 */

import { authHandlers } from './authHandlers'
import { shelterAuthHandlers } from './shelterAuthHandlers'
import { shelterDashboardHandlers } from './shelterDashboardHandlers'
import { shelterHandlers } from './shelterHandlers'
import { shelterRequestHandlers } from './shelterRequestHandlers'
import { shelterResidentsHandlers } from './shelterResidentsHandlers'
import { shelterMedicalHandlers } from './shelterMedicalHandlers'
import { profileHandlers } from './profileHandlers'
import { resourceHandlers } from './resourceHandlers'
import { recommendationsHandlers } from './recommendationsHandler'
import { followupHandlers } from './followupHandlers'
import { matchesHandlers } from './matchesHandler'
import { analyticsHandlers } from './analyticsHandler'

// Export all handlers in the correct order
export const handlers = [
  // 1. Auth handlers (highest priority)
  ...authHandlers,
  ...shelterAuthHandlers,
  
  // 2. Shelter-specific handlers
  ...shelterDashboardHandlers,
  ...shelterHandlers,
  ...shelterRequestHandlers,
  ...shelterResidentsHandlers,
  ...shelterMedicalHandlers,
  
  // 3. Profile and resource handlers
  ...profileHandlers,
  ...resourceHandlers,
  
  // 4. Feature handlers
  ...recommendationsHandlers,
  ...followupHandlers,
  ...matchesHandlers,
  ...analyticsHandlers,
]

// Export individual handler groups for selective use
export {
  authHandlers,
  shelterAuthHandlers,
  shelterDashboardHandlers,
  shelterHandlers,
  shelterRequestHandlers,
  shelterResidentsHandlers,
  shelterMedicalHandlers,
  profileHandlers,
  resourceHandlers,
  recommendationsHandlers,
  followupHandlers,
  matchesHandlers,
  analyticsHandlers,
}
