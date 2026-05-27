import { create } from 'zustand'
import { db } from '@/db/dexie'
import { generateId, getFaviconUrl } from '@/lib/utils'
import type { ToolItem } from '@/types'

interface ToolState {
  items: ToolItem[]
  loaded: boolean
  hydrate: () => Promise<void>
  addTool: (data: Omit<ToolItem, 'id' | 'sortOrder' | 'icon'>) => Promise<void>
  updateTool: (id: string, patch: Partial<ToolItem>) => Promise<void>
  deleteTool: (id: string) => Promise<void>
  reorderTools: (activeId: string, overId: string) => Promise<void>
}

export const useToolStore = create<ToolState>((set, get) => ({
  items: [],
  loaded: false,

  hydrate: async () => {
    const items = await db.tools.orderBy('sortOrder').toArray()
    set({ items, loaded: true })
  },

  addTool: async (data) => {
    const item: ToolItem = {
      ...data,
      id: generateId(),
      icon: getFaviconUrl(data.url),
      sortOrder: get().items.length,
    }
    await db.tools.add(item)
    set({ items: [...get().items, item] })
  },

  updateTool: async (id, patch) => {
    await db.tools.update(id, patch)
    set({ items: get().items.map((t) => (t.id === id ? { ...t, ...patch } : t)) })
  },

  deleteTool: async (id) => {
    await db.tools.delete(id)
    set({ items: get().items.filter((t) => t.id !== id) })
  },

  reorderTools: async (activeId, overId) => {
    const items = [...get().items]
    const oldIndex = items.findIndex((t) => t.id === activeId)
    const newIndex = items.findIndex((t) => t.id === overId)
    if (oldIndex === -1 || newIndex === -1) return

    const [moved] = items.splice(oldIndex, 1)
    items.splice(newIndex, 0, moved)

    const reordered = items.map((item, index) => ({ ...item, sortOrder: index }))
    await db.tools.bulkPut(reordered)
    set({ items: reordered })
  },
}))

export const DEFAULT_TOOLS: Omit<ToolItem, 'id' | 'sortOrder'>[] = [
  { name: 'Photoshop', url: 'https://www.adobe.com/products/photoshop.html', icon: '/assets/icons/photoshop.svg', category: '绘画' },
  { name: 'CSP', url: 'https://www.clipstudio.net/', icon: '/assets/icons/csp.svg', category: '绘画' },
  { name: 'Midjourney', url: 'https://www.midjourney.com/', icon: '/assets/icons/midjourney.svg', category: 'AI' },
  { name: 'ChatGPT', url: 'https://chat.openai.com/', icon: '/assets/icons/chatgpt.svg', category: 'AI' },
  { name: 'Notion', url: 'https://www.notion.so/', icon: '/assets/icons/notion.svg', category: '工作' },
  { name: 'Bilibili', url: 'https://www.bilibili.com/', icon: '/assets/icons/bilibili.svg', category: '视频' },
  { name: 'Youtube', url: 'https://www.youtube.com/', icon: '/assets/icons/youtube.svg', category: '视频' },
]
