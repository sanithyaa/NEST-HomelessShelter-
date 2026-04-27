import { useState, useEffect } from 'react'
import { storage } from '@/lib/storage'

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(initialValue)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadStoredValue = async () => {
      try {
        const item = await storage.getItem<T>(key)
        if (item !== null) {
          setStoredValue(item)
        }
      } catch (error) {
        console.error(`Error loading ${key} from storage:`, error)
      } finally {
        setIsLoading(false)
      }
    }

    loadStoredValue()
  }, [key])

  const setValue = async (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      await storage.setItem(key, valueToStore)
    } catch (error) {
      console.error(`Error saving ${key} to storage:`, error)
    }
  }

  return [storedValue, setValue, isLoading] as const
}
