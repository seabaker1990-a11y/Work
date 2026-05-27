import { useEffect, useState } from 'react'
import dayjs from 'dayjs'

export function useClock() {
  const [time, setTime] = useState(dayjs())

  useEffect(() => {
    const timer = setInterval(() => setTime(dayjs()), 1000)
    return () => clearInterval(timer)
  }, [])

  return {
    time,
    formatted: time.format('HH:mm'),
    date: time.format('YYYY年M月D日 dddd'),
  }
}

export function formatCountdown(deadline?: string): { text: string; overdue: boolean } | null {
  if (!deadline) return null

  const end = dayjs(deadline)
  const now = dayjs()
  const diff = end.diff(now)

  if (diff <= 0) {
    return { text: '已超时', overdue: true }
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))

  if (days > 0) return { text: `剩余 ${days} 天 ${hours} 小时`, overdue: false }
  if (hours > 0) return { text: `剩余 ${hours} 小时`, overdue: false }
  return { text: '即将截止', overdue: false }
}
