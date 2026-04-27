// Activity logging for recent activity feed
import localforage from 'localforage';

export interface ActivityEvent {
  id: string;
  type: 'profile_created' | 'profile_updated' | 'match_assigned' | 'resource_added' | 'followup_completed' | 'shelter_action';
  message: string;
  timestamp: Date;
  category?: string;
  metadata?: any;
}

const ACTIVITY_KEY = 'recent_activity';
const MAX_ACTIVITIES = 50;

export async function logActivity(event: Omit<ActivityEvent, 'id' | 'timestamp'>) {
  try {
    const activities = await getRecentActivity();
    const newActivity: ActivityEvent = {
      ...event,
      id: `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
    };
    
    activities.unshift(newActivity);
    
    // Keep only the most recent activities
    const trimmed = activities.slice(0, MAX_ACTIVITIES);
    
    await localforage.setItem(ACTIVITY_KEY, trimmed);
    return newActivity;
  } catch (error) {
    console.error('Failed to log activity:', error);
    return null;
  }
}

export async function getRecentActivity(limit = 10): Promise<ActivityEvent[]> {
  try {
    const activities = await localforage.getItem<ActivityEvent[]>(ACTIVITY_KEY) || [];
    return activities.slice(0, limit);
  } catch (error) {
    console.error('Failed to get recent activity:', error);
    return [];
  }
}

export async function clearActivity() {
  try {
    await localforage.removeItem(ACTIVITY_KEY);
  } catch (error) {
    console.error('Failed to clear activity:', error);
  }
}

/**
 * Log shelter-specific activity
 * Convenience function for logging shelter actions with proper categorization
 * 
 * @param message - Human-readable message describing the action
 * @param metadata - Optional additional data about the action
 * @returns The created activity event or null if failed
 * 
 * @example
 * ```ts
 * logShelterActivity('Accepted request for Jane Smith', { requestId: 'req_123' })
 * ```
 */
export async function logShelterActivity(message: string, metadata?: any): Promise<ActivityEvent | null> {
  return logActivity({
    type: 'shelter_action',
    message,
    category: 'shelter',
    metadata,
  });
}
