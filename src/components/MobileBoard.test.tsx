import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { MobileBoard, type MobileBoardProps } from './MobileBoard'
import { type SwipeEventData, useSwipeable } from 'react-swipeable'

// изначально показывается активная колонка и только её задачи
// свайп влево/вправо меняет активную колонку
// свайпы не выводят индекс за границы — с первой нельзя уйти правее назад, с последней нельзя уйти дальше влево

vi.mock('react-swipeable', () => {
  return {
    useSwipeable: vi.fn().mockReturnValue({}),
  }
})

vi.mock('@dnd-kit/react', () => ({
  useDroppable: () => ({
    ref: vi.fn(),
  }),
  useDraggable: () => ({
    ref: vi.fn(),
  }),
}))

function createMobileBoard(overrides: Partial<MobileBoardProps> = {}): MobileBoardProps {
  return {
    filteredTasks: [
      {
        id: '1',
        status: 'todo',
        title: 'test-1',
        description: '',
        createdAt: 0,
        priority: 'low',
        deadline: '',
      },
    ],
    setSelectedTaskId: vi.fn(),
    searchQuery: '',
    currentTimestamp: 0,
    ...overrides,
  }
}

function renderMobileBoard(overrides: Partial<MobileBoardProps> = {}) {
  render(<MobileBoard {...createMobileBoard(overrides)} />)
}

describe('MobileBoard', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  it('displays active column from localStorage', () => {
    localStorage.setItem('mobileActiveColumnIndex', JSON.stringify(1))
    renderMobileBoard({
      filteredTasks: [
        {
          id: '1',
          status: 'inProgress',
          title: 'test-1',
          description: '',
          createdAt: 0,
          priority: 'low',
          deadline: '',
        },
        {
          id: '2',
          status: 'todo',
          title: 'test-2',
          description: '',
          createdAt: 0,
          priority: 'low',
          deadline: '',
        },
      ],
    })
    expect(screen.getByText('В работе')).toBeInTheDocument()
    expect(screen.getByText('test-1')).toBeInTheDocument()
    expect(screen.queryByText('test-2')).not.toBeInTheDocument()
  })

  it('reacts on left swipe', () => {
    const mockedUseSwipeable = vi.mocked(useSwipeable)
    renderMobileBoard()
    expect(screen.getByText('Запланировано')).toBeInTheDocument()
    expect(screen.getByText('test-1')).toBeInTheDocument()
    const onSwipedLeft = mockedUseSwipeable.mock.calls[0][0].onSwipedLeft
    act(() => onSwipedLeft!({} as SwipeEventData))
    expect(screen.getByText('В работе')).toBeInTheDocument()
  })

  it('does not swipe beyond first and last columns', () => {
    const mockedUseSwipeable = vi.mocked(useSwipeable)
    renderMobileBoard()
    expect(screen.getByText('Запланировано')).toBeInTheDocument()
    expect(screen.getByText('test-1')).toBeInTheDocument()
    const { onSwipedLeft, onSwipedRight } = mockedUseSwipeable.mock.calls[0][0]
    act(() => onSwipedRight!({} as SwipeEventData))
    expect(screen.getByText('Запланировано')).toBeInTheDocument()
    act(() => onSwipedLeft!({} as SwipeEventData))
    expect(screen.getByText('В работе')).toBeInTheDocument()
    act(() => onSwipedLeft!({} as SwipeEventData))
    expect(screen.getByText('Готово')).toBeInTheDocument()
    act(() => onSwipedLeft!({} as SwipeEventData))
    expect(screen.getByText('Готово')).toBeInTheDocument()
  })
})
