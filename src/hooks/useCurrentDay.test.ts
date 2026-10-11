import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useCurrentDay } from './useCurrentDay'
import { act } from 'react'

describe('useCurrentDay', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 9, 11, 12, 0, 0))
  })
  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('returns current timestamp on initialization', () => {
    expect(renderHook(() => useCurrentDay()).result.current).toStrictEqual({
      currentTimestamp: new Date(2026, 9, 11, 12, 0, 0).getTime(),
    })
  })

  it('changes current timestamp on midnight', () => {
    const midnight = new Date(2026, 9, 12, 0, 0, 0).getTime()
    const now = new Date(2026, 9, 11, 12, 0, 0).getTime()
    const { result } = renderHook(() => useCurrentDay())
    act(() => vi.advanceTimersByTime(midnight - now))
    expect(result.current.currentTimestamp).toBe(midnight)
  })

  it('updates current timestamp on visibilitychange when page is visible and day has changed', () => {
    const { result } = renderHook(() => useCurrentDay())
    expect(result.current.currentTimestamp).toBe(new Date(2026, 9, 11, 12, 0, 0).getTime())
    vi.setSystemTime(new Date(2026, 9, 12, 0, 0, 0))
    vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('visible')
    act(() => document.dispatchEvent(new Event('visibilitychange')))
    expect(result.current.currentTimestamp).toBe(new Date(2026, 9, 12, 0, 0, 0).getTime())
  })

  it('does not update current timestamp on visibilitychange when day has not changed', () => {
    const { result } = renderHook(() => useCurrentDay())
    const initialTimestamp = new Date(2026, 9, 11, 12, 0, 0).getTime()
    expect(result.current.currentTimestamp).toBe(initialTimestamp)
    vi.setSystemTime(new Date(2026, 9, 11, 18, 0, 0))
    vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('visible')
    act(() => document.dispatchEvent(new Event('visibilitychange')))
    expect(result.current.currentTimestamp).toBe(initialTimestamp)
  })

  it('does not update current timestamp on visibilitychange when page is hidden', () => {
    const { result } = renderHook(() => useCurrentDay())
    const initialTimestamp = new Date(2026, 9, 11, 12, 0, 0).getTime()
    expect(result.current.currentTimestamp).toBe(initialTimestamp)
    vi.setSystemTime(new Date(2026, 9, 12, 0, 0, 0))
    vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('hidden')
    act(() => document.dispatchEvent(new Event('visibilitychange')))
    expect(result.current.currentTimestamp).toBe(initialTimestamp)
  })
})
