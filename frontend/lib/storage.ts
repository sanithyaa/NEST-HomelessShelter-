import localforage from 'localforage'

// Configure localforage for IndexedDB storage
localforage.config({
  driver: localforage.INDEXEDDB,
  name: 'HomelessAid',
  version: 1.0,
  storeName: 'app_data',
  description: 'Local storage for HomelessAid application',
})

export const storage = {
  async setItem<T>(key: string, value: T): Promise<T> {
    return await localforage.setItem(key, value)
  },

  async getItem<T>(key: string): Promise<T | null> {
    return await localforage.getItem<T>(key)
  },

  async removeItem(key: string): Promise<void> {
    return await localforage.removeItem(key)
  },

  async clear(): Promise<void> {
    return await localforage.clear()
  },

  async keys(): Promise<string[]> {
    return await localforage.keys()
  },
}

export default storage
