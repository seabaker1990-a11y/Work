import { create } from 'zustand'
import { db } from '@/db/dexie'
import { generateId } from '@/lib/utils'
import type { Priority, WishItem, WishStatus } from '@/types'

interface WishlistState {
  items: WishItem[]
  loaded: boolean
  hydrate: () => Promise<void>
  addWish: (data: Omit<WishItem, 'id' | 'sortOrder' | 'createdAt'>) => Promise<void>
  updateWish: (id: string, patch: Partial<WishItem>) => Promise<void>
  deleteWish: (id: string) => Promise<void>
  reorderWishes: (activeId: string, overId: string) => Promise<void>
}

export const useWishlistStore = create<WishlistState>((set, get) => ({
  items: [],
  loaded: false,

  hydrate: async () => {
    const items = await db.wishes.orderBy('sortOrder').toArray()
    set({ items, loaded: true })
  },

  addWish: async (data) => {
    const item: WishItem = {
      ...data,
      id: generateId(),
      sortOrder: get().items.length,
      createdAt: new Date().toISOString(),
    }
    await db.wishes.add(item)
    set({ items: [...get().items, item] })
  },

  updateWish: async (id, patch) => {
    await db.wishes.update(id, patch)
    set({ items: get().items.map((w) => (w.id === id ? { ...w, ...patch } : w)) })
  },

  deleteWish: async (id) => {
    await db.wishes.delete(id)
    set({ items: get().items.filter((w) => w.id !== id) })
  },

  reorderWishes: async (activeId, overId) => {
    const items = [...get().items]
    const oldIndex = items.findIndex((w) => w.id === activeId)
    const newIndex = items.findIndex((w) => w.id === overId)
    if (oldIndex === -1 || newIndex === -1) return

    const [moved] = items.splice(oldIndex, 1)
    items.splice(newIndex, 0, moved)

    const reordered = items.map((item, index) => ({ ...item, sortOrder: index }))
    await db.wishes.bulkPut(reordered)
    set({ items: reordered })
  },
}))

export const DEFAULT_WISHES: Omit<WishItem, 'id' | 'sortOrder' | 'createdAt'>[] = [
  {
    title: '完成原创漫画',
    description: '创作并发布个人原创漫画作品',
    category: '创作',
    priority: 'high' as Priority,
    status: 'in_progress' as WishStatus,
    progress: 70,
  },
  {
    title: '学习 UE5',
    description: '掌握虚幻引擎5基础与场景搭建',
    category: '学习',
    priority: 'medium' as Priority,
    status: 'in_progress' as WishStatus,
    progress: 20,
  },
  {
    title: '买新数位屏',
    description: '升级创作设备，提升绘画效率',
    category: '购物',
    priority: 'low' as Priority,
    status: 'not_started' as WishStatus,
    progress: 50,
  },
]
