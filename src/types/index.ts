export type Priority = 'high' | 'medium' | 'low'
export type WishStatus = 'not_started' | 'in_progress' | 'completed' | 'abandoned'
export type ThemeMode = 'dark' | 'light'

export interface Subtask {
  id: string
  title: string
  completed: boolean
}

export interface TodoItem {
  id: string
  title: string
  description?: string
  priority: Priority
  completed: boolean
  deadline?: string
  subtasks: Subtask[]
  starred: boolean
  pinned: boolean
  sortOrder: number
  createdAt: string
  updatedAt: string
}

export interface WishItem {
  id: string
  title: string
  description?: string
  category: string
  priority: Priority
  status: WishStatus
  progress: number
  deadline?: string
  sortOrder: number
  createdAt: string
}

export interface CalendarEvent {
  id: string
  title: string
  description?: string
  start: string
  end: string
  color: string
  category: string
  createdAt: string
}

export interface ToolItem {
  id: string
  name: string
  url: string
  icon?: string
  category: string
  sortOrder: number
}

export interface AppSettings {
  theme: ThemeMode
  initialized: boolean
}

export const WISH_CATEGORIES = ['事业', '创作', '财富', '健康', '学习', '旅行', '购物'] as const
export const TOOL_CATEGORIES = ['绘画', 'AI', '视频', '音乐', '社交', '工作'] as const
export const EVENT_COLORS = {
  work: '#3B82F6',
  create: '#7C3AED',
  learn: '#22C55E',
  fun: '#EC4899',
} as const

export const PRIORITY_LABELS: Record<Priority, string> = {
  high: '高',
  medium: '中',
  low: '低',
}

export const WISH_STATUS_LABELS: Record<WishStatus, string> = {
  not_started: '未开始',
  in_progress: '进行中',
  completed: '已完成',
  abandoned: '已放弃',
}
