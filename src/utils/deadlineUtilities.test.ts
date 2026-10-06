import { describe, expect, it } from 'vitest'
import { formatDate } from './deadlineUtilities'

describe('formatDate', () => {
  it('formats timestamp as YYYY-MM-DD', () => {
    const timestamp = new Date(2026, 9, 6).getTime()

    expect(formatDate(timestamp)).toBe('2026-10-06')
  })
})
