import Dexie, { type EntityTable } from 'dexie'
import type { CalendarEvent, TodoItem, ToolItem, WishItem, AppSettings } from '@/types'

export interface DashboardDB extends Dexie {
  todos: EntityTable<TodoItem, 'id'>
  wishes: EntityTable<WishItem, 'id'>
  events: EntityTable<CalendarEvent, 'id'>
  tools: EntityTable<ToolItem, 'id'>
  settings: EntityTable<AppSettings & { id: string }, 'id'>
}

export const db = new Dexie('PersonalDashboard') as DashboardDB

db.version(1).stores({
  todos: 'id, completed, priority, sortOrder, createdAt',
  wishes: 'id, status, category, sortOrder, createdAt',
  events: 'id, start, end, category',
  tools: 'id, category, sortOrder',
  settings: 'id',
})

export const SETTINGS_ID = 'app-settings'

export async function loadSettings(): Promise<AppSettings> {
  const settings = await db.settings.get(SETTINGS_ID)
  return settings ?? { theme: 'dark', initialized: false }
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  await db.settings.put({ id: SETTINGS_ID, ...settings })
}
