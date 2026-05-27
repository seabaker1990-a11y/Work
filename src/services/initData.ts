import { db, loadSettings } from '@/db/dexie'
import { generateId } from '@/lib/utils'
import { markInitialized, useSettingsStore } from '@/store/settingStore'
import { DEFAULT_EVENTS } from '@/store/calendarStore'
import { DEFAULT_WISHES } from '@/store/wishlistStore'
import { DEFAULT_TOOLS } from '@/store/toolStore'
import { useTodoStore } from '@/store/todoStore'
import { useWishlistStore } from '@/store/wishlistStore'
import { useCalendarStore } from '@/store/calendarStore'
import { useToolStore } from '@/store/toolStore'
import type { TodoItem } from '@/types'

const DEFAULT_TODOS: Omit<TodoItem, 'id' | 'sortOrder' | 'createdAt' | 'updatedAt'>[] = [
  { title: '完成角色草图', priority: 'high', completed: false, subtasks: [], starred: false, pinned: false },
  { title: '提交比赛稿件', priority: 'medium', completed: true, subtasks: [], starred: true, pinned: false },
  { title: '写 AI 短剧脚本', priority: 'medium', completed: false, subtasks: [], starred: false, pinned: false },
]

export async function initializeAppData(): Promise<void> {
  const settings = await loadSettings()
  if (settings.initialized) return

  const now = new Date().toISOString()

  await db.todos.bulkAdd(
    DEFAULT_TODOS.map((todo, index) => ({
      ...todo,
      id: generateId(),
      sortOrder: index,
      createdAt: now,
      updatedAt: now,
    })),
  )

  await db.wishes.bulkAdd(
    DEFAULT_WISHES.map((wish, index) => ({
      ...wish,
      id: generateId(),
      sortOrder: index,
      createdAt: now,
    })),
  )

  await db.events.bulkAdd(
    DEFAULT_EVENTS.map((event) => ({
      ...event,
      id: generateId(),
      createdAt: now,
    })),
  )

  await db.tools.bulkAdd(
    DEFAULT_TOOLS.map((tool, index) => ({
      ...tool,
      id: generateId(),
      sortOrder: index,
    })),
  )

  await markInitialized()
}

export async function hydrateAllStores(): Promise<void> {
  await initializeAppData()

  await Promise.all([
    useSettingsStore.getState().hydrate(),
    useTodoStore.getState().hydrate(),
    useWishlistStore.getState().hydrate(),
    useCalendarStore.getState().hydrate(),
    useToolStore.getState().hydrate(),
  ])
}
