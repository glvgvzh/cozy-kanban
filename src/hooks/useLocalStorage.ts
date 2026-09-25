import { useEffect, useState } from 'react'
import type { Dispatch, SetStateAction } from 'react'

function useLocalStorage<T>(key: string, initialValue: T): [T, Dispatch<SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => {
    const storedValue = localStorage.getItem(key)
    if (storedValue === null) {
      return initialValue
    }
    return JSON.parse(storedValue) ?? initialValue
  })
  useEffect(() => localStorage.setItem(key, JSON.stringify(value)), [value, key])
  return [value, setValue]
}

export default useLocalStorage
