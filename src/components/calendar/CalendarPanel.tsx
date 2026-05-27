import { useMemo, useRef, useState } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import type { DateSelectArg, EventClickArg, EventDropArg } from '@fullcalendar/core'
import { CalendarDays } from 'lucide-react'
import dayjs from 'dayjs'
import zhCnLocale from '@fullcalendar/core/locales/zh-cn'
import { useCalendarStore } from '@/store/calendarStore'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { EVENT_COLORS } from '@/types'

interface CalendarPanelProps {
  searchQuery: string
}

export function CalendarPanel({ searchQuery }: CalendarPanelProps) {
  const { events, addEvent, updateEvent, deleteEvent } = useCalendarStore()
  const calendarRef = useRef<FullCalendar>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [start, setStart] = useState('')
  const [end, setEnd] = useState('')
  const [color, setColor] = useState<string>(EVENT_COLORS.create)
  const [category, setCategory] = useState('create')

  const filteredEvents = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return events
    return events.filter(
      (e) =>
        e.title.toLowerCase().includes(q) || e.description?.toLowerCase().includes(q),
    )
  }, [events, searchQuery])

  const fcEvents = filteredEvents.map((e) => ({
    id: e.id,
    title: e.title,
    start: e.start,
    end: e.end,
    backgroundColor: e.color,
    borderColor: e.color,
    extendedProps: { description: e.description, category: e.category },
  }))

  const openCreate = (startDate: Date, endDate: Date) => {
    setSelectedEventId(null)
    setTitle('')
    setDescription('')
    setStart(dayjs(startDate).format('YYYY-MM-DDTHH:mm'))
    setEnd(dayjs(endDate).format('YYYY-MM-DDTHH:mm'))
    setColor(EVENT_COLORS.create)
    setCategory('create')
    setModalOpen(true)
  }

  const handleSelect = (info: DateSelectArg) => {
    openCreate(info.start, info.end)
  }

  const handleEventClick = (info: EventClickArg) => {
    const event = events.find((e) => e.id === info.event.id)
    if (!event) return
    setSelectedEventId(event.id)
    setTitle(event.title)
    setDescription(event.description ?? '')
    setStart(dayjs(event.start).format('YYYY-MM-DDTHH:mm'))
    setEnd(dayjs(event.end).format('YYYY-MM-DDTHH:mm'))
    setColor(event.color)
    setCategory(event.category)
    setModalOpen(true)
  }

  const handleEventDrop = (info: EventDropArg) => {
    void updateEvent(info.event.id, {
      start: info.event.start?.toISOString() ?? '',
      end: info.event.end?.toISOString() ?? info.event.start?.toISOString() ?? '',
    })
  }

  const handleSave = async () => {
    if (!title.trim() || !start || !end) return
    const payload = {
      title: title.trim(),
      description: description.trim() || undefined,
      start: new Date(start).toISOString(),
      end: new Date(end).toISOString(),
      color,
      category,
    }
    if (selectedEventId) {
      await updateEvent(selectedEventId, payload)
    } else {
      await addEvent(payload)
    }
    setModalOpen(false)
  }

  const handleDelete = async () => {
    if (selectedEventId) {
      await deleteEvent(selectedEventId)
      setModalOpen(false)
    }
  }

  return (
    <section className="glass-card flex flex-col p-5">
      <div className="mb-4 flex items-center gap-2">
        <CalendarDays className="text-violet-400" size={20} />
        <h2 className="text-base font-semibold text-slate-100">日历</h2>
      </div>

      <div className="min-h-[520px] flex-1">
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek',
          }}
          locale={zhCnLocale}
          height="auto"
          selectable
          editable
          events={fcEvents}
          select={handleSelect}
          eventClick={handleEventClick}
          eventDrop={handleEventDrop}
          dayMaxEvents={3}
        />
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={selectedEventId ? '编辑日程' : '创建日程'}
      >
        <div className="space-y-3">
          <Input placeholder="标题" value={title} onChange={(e) => setTitle(e.target.value)} />
          <textarea
            placeholder="描述"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="min-h-[60px] w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-100 outline-none"
          />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs text-slate-400">开始</label>
              <Input type="datetime-local" value={start} onChange={(e) => setStart(e.target.value)} />
            </div>
            <div>
              <label className="mb-1 block text-xs text-slate-400">结束</label>
              <Input type="datetime-local" value={end} onChange={(e) => setEnd(e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <select
              value={category}
              onChange={(e) => {
                const cat = e.target.value
                setCategory(cat)
                const colorMap: Record<string, string> = {
                  work: EVENT_COLORS.work,
                  create: EVENT_COLORS.create,
                  learn: EVENT_COLORS.learn,
                  fun: EVENT_COLORS.fun,
                }
                setColor(colorMap[cat] ?? EVENT_COLORS.create)
              }}
              className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-100"
            >
              <option value="work">工作</option>
              <option value="create">创作</option>
              <option value="learn">学习</option>
              <option value="fun">娱乐</option>
            </select>
            <Input type="color" value={color} onChange={(e) => setColor(e.target.value)} />
          </div>
          <div className="flex gap-2">
            <Button className="flex-1" onClick={() => void handleSave()}>
              保存
            </Button>
            {selectedEventId && (
              <Button variant="danger" onClick={() => void handleDelete()}>
                删除
              </Button>
            )}
          </div>
        </div>
      </Modal>
    </section>
  )
}
