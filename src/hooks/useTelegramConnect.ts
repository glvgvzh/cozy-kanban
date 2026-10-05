import { useState } from 'react'
import useLocalStorage from './useLocalStorage'

function useTelegramConnect() {
  const [telegramCode, setTelegramCode] = useLocalStorage('telegramCode', '')
  const [isTelegramConnected, setIsTelegramConnected] = useState(false)

  async function verifyCode(code: string) {
    try {
      const response = await fetch(`http://localhost:3000/api/boards/${code}/status`)
      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`)
      }
      const answer = await response.json()
      if (answer.telegramConnected) {
        setIsTelegramConnected(true)
        return true
      } else {
        setIsTelegramConnected(false)
        return false
      }
    } catch (error) {
      setIsTelegramConnected(false)
      console.error(error)
      return false
    }
  }

  return { telegramCode, setTelegramCode, verifyCode, isTelegramConnected }
}

export default useTelegramConnect
