import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Footer, type FooterProps } from './Footer'
import userEvent from '@testing-library/user-event'

function createFooter(overrides: Partial<FooterProps> = {}): FooterProps {
  return {
    tasks: [
      {
        id: '1',
        status: 'todo',
        title: 'title',
        description: 'description',
        createdAt: 0,
        priority: 'low',
        deadline: '',
      },
    ],
    currentTimestamp: 0,
    selectedPriorityFilter: '',
    setSelectedPriorityFilter: vi.fn(),
    onOpenSettingsModal: vi.fn(),
    ...overrides,
  }
}

function renderFooter(overrides: Partial<FooterProps> = {}) {
  const props = createFooter(overrides)
  render(<Footer {...props} />)
}

describe('Footer', () => {
  it('displays all elements and counters', () => {
    const props = createFooter({
      tasks: [
        {
          id: '1',
          status: 'todo',
          title: 'title',
          description: 'description',
          createdAt: 0,
          priority: 'low',
          deadline: new Date(2026, 9, 7).getTime(),
        },
      ],
      currentTimestamp: new Date(2026, 9, 8).getTime(),
    })
    renderFooter(props)

    expect(screen.getByText('Всего: 1')).toBeInTheDocument()
    expect(screen.getByText('В работе: 0')).toBeInTheDocument()
    expect(screen.getByText('Просрочено: 1')).toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: 'Приоритет:' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Настройки' })).toBeInTheDocument()
  })

  it('calls setSelectedPriorityFilter when priority selected', async () => {
    const user = userEvent.setup()
    const setSelectedPriorityFilter = vi.fn()
    const props = createFooter({
      selectedPriorityFilter: '',
      setSelectedPriorityFilter,
    })
    renderFooter(props)

    const select = screen.getByRole('combobox', { name: 'Приоритет:' })
    await user.selectOptions(select, screen.getByRole('option', { name: 'Высокий' }))
    expect(setSelectedPriorityFilter).toHaveBeenCalledWith('high')
  })

  it('calls setSelectedPriorityFilter with empty string when "Все" is selected', async () => {
    const user = userEvent.setup()
    const setSelectedPriorityFilter = vi.fn()
    const props = createFooter({
      selectedPriorityFilter: 'low',
      setSelectedPriorityFilter,
    })
    renderFooter(props)

    const select = screen.getByRole('combobox', { name: 'Приоритет:' })
    await user.selectOptions(select, screen.getByRole('option', { name: 'Все' }))
    expect(setSelectedPriorityFilter).toHaveBeenCalledWith('')
  })

  it('calls onOpenSettingsModal when settings clicked', async () => {
    const user = userEvent.setup()
    const onOpenSettingsModal = vi.fn()
    const props = createFooter({
      onOpenSettingsModal,
    })
    renderFooter(props)

    await user.click(screen.getByRole('button', { name: 'Настройки' }))
    expect(onOpenSettingsModal).toHaveBeenCalledTimes(1)
  })
})
