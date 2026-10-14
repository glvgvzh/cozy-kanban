import { useEffect, useState } from 'react'
import type { Dispatch, SetStateAction } from 'react'

export function useLocalStorage<T>(key: string, initialValue: T): [T, Dispatch<SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => {
    const storedValue = localStorage.getItem(key)
    if (storedValue === null) {
      return initialValue
    }
    try {
      const parsedStorageValue: T = JSON.parse(storedValue)
      return parsedStorageValue ?? initialValue
    } catch {
      return initialValue
    }
  })
  useEffect(() => localStorage.setItem(key, JSON.stringify(value)), [value, key])
  return [value, setValue]
}
