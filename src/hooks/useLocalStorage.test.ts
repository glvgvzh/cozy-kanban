import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useLocalStorage } from './useLocalStorage'
import { act } from 'react'

type Task = {
  id: number
}

describe('useLocalStorage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('returns initial value when there is no stored value in localStorage', () => {
    const hookObject = renderHook(() => useLocalStorage<Task[]>('tasks', []))
    expect(hookObject.result.current[0]).toStrictEqual([])
  })

  it('returns stored value when it exists in localStorage', () => {
    const storageTasks = [{ id: 1 }, { id: 2 }]
    localStorage.setItem('tasks', JSON.stringify(storageTasks))
    const hookObject = renderHook(() => useLocalStorage<Task[]>('tasks', []))
    expect(hookObject.result.current[0]).toStrictEqual(storageTasks)
  })

  it('stores updated value in localStorage', () => {
    const tasks = [{ id: 1 }, { id: 2 }]
    const hookObject = renderHook(() => useLocalStorage<Task[]>('tasks', []))
    const setValue = hookObject.result.current[1]
    act(() => {
      setValue(tasks)
    })
    const str = localStorage.getItem('tasks')
    expect(str).not.toBeNull()
    expect(JSON.parse(str!)).toStrictEqual(tasks)
  })
})
