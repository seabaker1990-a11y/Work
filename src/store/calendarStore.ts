import { create } from 'zustand'
import { db } from '@/db/dexie'
import { generateId } from '@/lib/utils'
import type { CalendarEvent } from '@/types'

interface CalendarState {
  events: CalendarEvent[]
  loaded: boolean
  hydrate: () => Promise<void>
  addEvent: (data: Omit<CalendarEvent, 'id' | 'createdAt'>) => Promise<void>
  updateEvent: (id: string, patch: Partial<CalendarEvent>) => Promise<void>
  deleteEvent: (id: string) => Promise<void>
}

export const useCalendarStore = create<CalendarState>((set, get) => ({
  events: [],
  loaded: false,

  hydrate: async () => {
    const events = await db.events.toArray()
    set({ events, loaded: true })
  },

  addEvent: async (data) => {
    const event: CalendarEvent = {
      ...data,
      id: generateId(),
      createdAt: new Date().toISOString(),
    }
    await db.events.add(event)
    set({ events: [...get().events, event] })
  },

  updateEvent: async (id, patch) => {
    await db.events.update(id, patch)
    set({ events: get().events.map((e) => (e.id === id ? { ...e, ...patch } : e)) })
  },

  deleteEvent: async (id) => {
    await db.events.delete(id)
    set({ events: get().events.filter((e) => e.id !== id) })
  },
}))

function todayAt(hour: number, minute = 0): string {
  const d = new Date()
  d.setHours(hour, minute, 0, 0)
  return d.toISOString()
}

export const DEFAULT_EVENTS: Omit<CalendarEvent, 'id' | 'createdAt'>[] = [
  {
    title: '绘画训练',
    description: '角色草图与人体练习',
    start: todayAt(14, 0),
    end: todayAt(16, 0),
    color: '#7C3AED',
    category: 'create',
  },
  {
    title: 'AI短剧',
    description: '脚本撰写与分镜设计',
    start: todayAt(16, 0),
    end: todayAt(18, 0),
    color: '#3B82F6',
    category: 'work',
  },
]
