// Offline sync utilities
import localforage from 'localforage';

const PENDING_QUEUE_KEY = 'pending_sync_queue';

interface PendingRequest {
  id: string;
  url: string;
  method: string;
  data: any;
  timestamp: Date;
  type?: string;
  metadata?: any;
}

export async function addToPendingQueue(url: string, method: string, data: any) {
  try {
    const queue = await getPendingQueue();
    const request: PendingRequest = {
      id: `pending_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      url,
      method,
      data,
      timestamp: new Date(),
    };
    
    queue.push(request);
    await localforage.setItem(PENDING_QUEUE_KEY, queue);
    return request;
  } catch (error) {
    console.error('Failed to add to pending queue:', error);
    return null;
  }
}

export async function getPendingQueue(): Promise<PendingRequest[]> {
  try {
    return await localforage.getItem<PendingRequest[]>(PENDING_QUEUE_KEY) || [];
  } catch (error) {
    console.error('Failed to get pending queue:', error);
    return [];
  }
}

export async function getPendingCount(): Promise<number> {
  const queue = await getPendingQueue();
  return queue.length;
}

export async function syncPending() {
  const queue = await getPendingQueue();
  
  if (queue.length === 0) {
    return { success: true, synced: 0 };
  }

  let synced = 0;
  const remaining: PendingRequest[] = [];
  const errors: string[] = [];

  for (const request of queue) {
    try {
      const response = await fetch(request.url, {
        method: request.method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request.data),
      });

      if (response.ok) {
        synced++;
      } else {
        // Retry failed requests
        remaining.push(request);
        errors.push(`Failed to sync ${request.type || 'action'}: ${response.statusText}`);
      }
    } catch (error) {
      // Keep in queue for retry
      remaining.push(request);
      errors.push(`Network error syncing ${request.type || 'action'}: ${error}`);
    }
  }

  await localforage.setItem(PENDING_QUEUE_KEY, remaining);
  
  // Log sync completion if any actions were synced
  if (synced > 0) {
    console.log(`Synced ${synced} offline actions`);
  }
  
  if (errors.length > 0) {
    console.warn('Sync errors:', errors);
  }
  
  return { success: true, synced, remaining: remaining.length, errors };
}

export async function clearPendingQueue() {
  try {
    await localforage.removeItem(PENDING_QUEUE_KEY);
  } catch (error) {
    console.error('Failed to clear pending queue:', error);
  }
}

/**
 * Enqueue a shelter-specific action for offline sync
 * Convenience function for queueing shelter actions with proper metadata
 * 
 * @param action - Action details including type, endpoint, method, and data
 * @returns The queued request or null if failed
 * 
 * @example
 * ```ts
 * enqueueShelterAction({
 *   type: 'accept_request',
 *   endpoint: '/api/shelter/requests/123/accept',
 *   method: 'POST',
 *   data: { notes: 'Approved' }
 * })
 * ```
 */
export async function enqueueShelterAction(action: {
  type: string;
  endpoint: string;
  method: string;
  data: any;
}): Promise<PendingRequest | null> {
  try {
    const queue = await getPendingQueue();
    const request: PendingRequest = {
      id: `pending_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      url: action.endpoint,
      method: action.method,
      data: action.data,
      timestamp: new Date(),
      type: action.type,
      metadata: { category: 'shelter' },
    };
    
    queue.push(request);
    await localforage.setItem(PENDING_QUEUE_KEY, queue);
    return request;
  } catch (error) {
    console.error('Failed to enqueue shelter action:', error);
    return null;
  }
}

/**
 * Clear all local shelter data from localStorage
 * Used for development/testing purposes
 */
export function clearLocalShelterData() {
  if (typeof window === 'undefined') return

  const keysToRemove = [
    'mock_shelter_residents',
    'mock_shelter_requests',
    'mock_shelter_medical',
    'mock_shelter_followups',
    'mock_shelter_daily_logs',
    'mock_shelter_bed_stats',
    'mock_shelter_discharge_logs',
  ]

  keysToRemove.forEach((key) => {
    localStorage.removeItem(key)
  })
}
