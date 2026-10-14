import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Toast } from './Toast'
import type { ActiveToast } from '../types'

function createToast(overrides: Partial<ActiveToast> = {}): ActiveToast {
  return {
    id: '1',
    operation: 'create',
    status: 'success',
    ...overrides,
  }
}

describe('Toast', () => {
  function renderToast(toast = createToast()) {
    render(<Toast toast={toast} />)
  }

  type ToastCase = [
    operation: ActiveToast['operation'],
    status: ActiveToast['status'],
    message: string,
    className: string,
  ]

  const cases: ToastCase[] = [
    ['create', 'success', 'Задача создана', 'toast-success'],
    ['create', 'fail', 'Ошибка создания задачи', 'toast-fail'],
    ['update', 'success', 'Задача изменена', 'toast-success'],
    ['update', 'fail', 'Ошибка изменения задачи', 'toast-fail'],
    ['delete', 'success', 'Задача удалена', 'toast-success'],
    ['delete', 'fail', 'Ошибка удаления задачи', 'toast-fail'],
  ]

  it.each(cases)('renders %s toast with %s status', (operation, status, message, className) => {
    renderToast(
      createToast({
        operation,
        status,
      }),
    )
    const toast = screen.getByRole('status')
    expect(screen.getByText(message)).toBeInTheDocument()
    expect(toast).toHaveClass(className)
  })
})
