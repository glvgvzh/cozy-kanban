import { useEffect, useState } from 'react'

export function useCurrentDay() {
  const [currentTimestamp, setCurrentTimestamp] = useState(() => Date.now())

  useEffect(() => {
    const nextDate = new Date(currentTimestamp)
    nextDate.setDate(nextDate.getDate() + 1)
    nextDate.setHours(0, 0, 0, 0)
    const msLeftUntilNextMidnight = nextDate.getTime() - currentTimestamp
    const timer = setTimeout(() => {
      setCurrentTimestamp(Date.now())
    }, msLeftUntilNextMidnight)
    return () => clearTimeout(timer)
  }, [currentTimestamp, setCurrentTimestamp])

  useEffect(() => {
    function handleVisibilityChange() {
      if (
        document.visibilityState === 'visible' &&
        new Date(currentTimestamp).setHours(0, 0, 0, 0) !== new Date().setHours(0, 0, 0, 0)
      ) {
        setCurrentTimestamp(Date.now())
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [currentTimestamp, setCurrentTimestamp])

  return { currentTimestamp }
}
