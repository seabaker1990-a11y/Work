import { create } from 'zustand'
import { db } from '@/db/dexie'
import { generateId } from '@/lib/utils'
import type { Priority, Subtask, TodoItem } from '@/types'

interface TodoState {
  items: TodoItem[]
  loaded: boolean
  hydrate: () => Promise<void>
  addTodo: (title: string, priority?: Priority) => Promise<void>
  updateTodo: (id: string, patch: Partial<TodoItem>) => Promise<void>
  deleteTodo: (id: string) => Promise<void>
  toggleTodo: (id: string) => Promise<void>
  addSubtask: (todoId: string, title: string) => Promise<void>
  toggleSubtask: (todoId: string, subtaskId: string) => Promise<void>
  reorderTodos: (activeId: string, overId: string) => Promise<void>
}

const now = () => new Date().toISOString()

export const useTodoStore = create<TodoState>((set, get) => ({
  items: [],
  loaded: false,

  hydrate: async () => {
    const items = await db.todos.orderBy('sortOrder').toArray()
    set({ items, loaded: true })
  },

  addTodo: async (title, priority = 'medium') => {
    const item: TodoItem = {
      id: generateId(),
      title: title.trim(),
      priority,
      completed: false,
      subtasks: [],
      starred: false,
      pinned: false,
      sortOrder: get().items.length,
      createdAt: now(),
      updatedAt: now(),
    }
    await db.todos.add(item)
    set({ items: [...get().items, item] })
  },

  updateTodo: async (id, patch) => {
    const updatedAt = now()
    await db.todos.update(id, { ...patch, updatedAt })
    set({
      items: get().items.map((t) => (t.id === id ? { ...t, ...patch, updatedAt } : t)),
    })
  },

  deleteTodo: async (id) => {
    await db.todos.delete(id)
    set({ items: get().items.filter((t) => t.id !== id) })
  },

  toggleTodo: async (id) => {
    const todo = get().items.find((t) => t.id === id)
    if (!todo) return
    await get().updateTodo(id, { completed: !todo.completed })
  },

  addSubtask: async (todoId, title) => {
    const todo = get().items.find((t) => t.id === todoId)
    if (!todo) return
    const subtask: Subtask = { id: generateId(), title: title.trim(), completed: false }
    await get().updateTodo(todoId, { subtasks: [...todo.subtasks, subtask] })
  },

  toggleSubtask: async (todoId, subtaskId) => {
    const todo = get().items.find((t) => t.id === todoId)
    if (!todo) return
    const subtasks = todo.subtasks.map((s) =>
      s.id === subtaskId ? { ...s, completed: !s.completed } : s,
    )
    await get().updateTodo(todoId, { subtasks })
  },

  reorderTodos: async (activeId, overId) => {
    const items = [...get().items]
    const oldIndex = items.findIndex((t) => t.id === activeId)
    const newIndex = items.findIndex((t) => t.id === overId)
    if (oldIndex === -1 || newIndex === -1) return

    const [moved] = items.splice(oldIndex, 1)
    items.splice(newIndex, 0, moved)

    const reordered = items.map((item, index) => ({ ...item, sortOrder: index }))
    await db.todos.bulkPut(reordered)
    set({ items: reordered })
  },
}))
