import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import App from './App'

describe('App', () => {
  beforeEach(() => {
    vi.mocked(localStorage.getItem).mockReturnValue(null)
    vi.mocked(localStorage.setItem).mockClear()
  })

  it('renders the TODO title', () => {
    render(<App />)
    expect(screen.getByRole('heading', { name: 'TODO' })).toBeInTheDocument()
  })

  it('renders input field and add button', () => {
    render(<App />)
    expect(screen.getByPlaceholderText('Add a new task...')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Add' })).toBeInTheDocument()
  })

  it('shows empty message when no todos exist', () => {
    render(<App />)
    expect(screen.getByText('No tasks yet. Add one above!')).toBeInTheDocument()
  })

  it('adds a new todo when clicking add button', async () => {
    const user = userEvent.setup()
    render(<App />)

    const input = screen.getByPlaceholderText('Add a new task...')
    const addButton = screen.getByRole('button', { name: 'Add' })

    await user.type(input, 'New task')
    await user.click(addButton)

    expect(screen.getByText('New task')).toBeInTheDocument()
    expect(input).toHaveValue('')
  })

  it('adds a new todo when pressing Enter', async () => {
    const user = userEvent.setup()
    render(<App />)

    const input = screen.getByPlaceholderText('Add a new task...')

    await user.type(input, 'Enter task{Enter}')

    expect(screen.getByText('Enter task')).toBeInTheDocument()
  })

  it('does not add empty todo', async () => {
    const user = userEvent.setup()
    render(<App />)

    const addButton = screen.getByRole('button', { name: 'Add' })
    await user.click(addButton)

    expect(screen.getByText('No tasks yet. Add one above!')).toBeInTheDocument()
  })

  it('does not add whitespace-only todo', async () => {
    const user = userEvent.setup()
    render(<App />)

    const input = screen.getByPlaceholderText('Add a new task...')
    const addButton = screen.getByRole('button', { name: 'Add' })

    await user.type(input, '   ')
    await user.click(addButton)

    expect(screen.getByText('No tasks yet. Add one above!')).toBeInTheDocument()
  })

  it('toggles todo completion status', async () => {
    const user = userEvent.setup()
    render(<App />)

    const input = screen.getByPlaceholderText('Add a new task...')
    await user.type(input, 'Toggle task{Enter}')

    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).not.toBeChecked()

    await user.click(checkbox)
    expect(checkbox).toBeChecked()

    await user.click(checkbox)
    expect(checkbox).not.toBeChecked()
  })

  it('deletes a todo', async () => {
    const user = userEvent.setup()
    render(<App />)

    const input = screen.getByPlaceholderText('Add a new task...')
    await user.type(input, 'Delete me{Enter}')

    expect(screen.getByText('Delete me')).toBeInTheDocument()

    const deleteButton = screen.getByRole('button', { name: 'Delete' })
    await user.click(deleteButton)

    expect(screen.queryByText('Delete me')).not.toBeInTheDocument()
  })

  it('shows completion stats when todos exist', async () => {
    const user = userEvent.setup()
    render(<App />)

    const input = screen.getByPlaceholderText('Add a new task...')
    await user.type(input, 'Task 1{Enter}')
    await user.type(input, 'Task 2{Enter}')

    expect(screen.getByText('0 / 2 completed')).toBeInTheDocument()

    const checkboxes = screen.getAllByRole('checkbox')
    await user.click(checkboxes[0])

    expect(screen.getByText('1 / 2 completed')).toBeInTheDocument()
  })

  it('loads todos from localStorage on mount', () => {
    const savedTodos = [
      { id: 1, text: 'Saved task', completed: false },
      { id: 2, text: 'Completed task', completed: true },
    ]
    vi.mocked(localStorage.getItem).mockReturnValue(JSON.stringify(savedTodos))

    render(<App />)

    expect(screen.getByText('Saved task')).toBeInTheDocument()
    expect(screen.getByText('Completed task')).toBeInTheDocument()
  })

  it('saves todos to localStorage when todos change', async () => {
    const user = userEvent.setup()
    render(<App />)

    const input = screen.getByPlaceholderText('Add a new task...')
    await user.type(input, 'Persistent task{Enter}')

    expect(localStorage.setItem).toHaveBeenCalledWith(
      'todos',
      expect.stringContaining('Persistent task')
    )
  })
})
