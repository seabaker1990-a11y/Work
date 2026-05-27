import { useMemo, useState } from 'react'
import {
  CheckSquare,
  ChevronDown,
  ChevronRight,
  GripVertical,
  Star,
  Trash2,
  Pin,
} from 'lucide-react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useTodoStore } from '@/store/todoStore'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import { formatCountdown } from '@/hooks/useClock'
import { PRIORITY_LABELS } from '@/types'
import type { Priority, TodoItem } from '@/types'

interface TodoPanelProps {
  searchQuery: string
}

const priorityBar: Record<Priority, string> = {
  high: 'border-l-red-500',
  medium: 'border-l-amber-400',
  low: 'border-l-slate-500',
}

function SortableTodoItem({ todo }: { todo: TodoItem }) {
  const { toggleTodo, deleteTodo, updateTodo, toggleSubtask, addSubtask } = useTodoStore()
  const [expanded, setExpanded] = useState(false)
  const [subtaskInput, setSubtaskInput] = useState('')

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: todo.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const countdown = formatCountdown(todo.deadline)
  const completedSubtasks = todo.subtasks.filter((s) => s.completed).length

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'group relative rounded-xl border border-white/8 border-l-4 bg-white/[0.03] p-3 transition-all hover:-translate-y-0.5 hover:border-violet-500/20',
        priorityBar[todo.priority],
        todo.completed && 'opacity-60',
      )}
    >
      <div className="flex items-start gap-2">
        <button
          type="button"
          className="mt-1 cursor-grab text-slate-600 opacity-0 group-hover:opacity-100"
          {...attributes}
          {...listeners}
        >
          <GripVertical size={14} />
        </button>

        <button
          type="button"
          onClick={() => void toggleTodo(todo.id)}
          className={cn(
            'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border transition',
            todo.completed
              ? 'border-emerald-500 bg-emerald-500/20 text-emerald-400'
              : 'border-slate-500 hover:border-violet-400',
          )}
        >
          {todo.completed && <CheckSquare size={12} />}
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p
                className={cn(
                  'text-sm text-slate-100',
                  todo.completed && 'line-through text-slate-500',
                )}
              >
                {todo.starred && <Star size={12} className="mr-1 inline text-amber-400" />}
                {todo.pinned && <Pin size={12} className="mr-1 inline text-violet-400" />}
                {todo.title}
              </p>
              {countdown && (
                <p
                  className={cn(
                    'mt-1 text-xs',
                    countdown.overdue ? 'text-red-400 overdue-pulse' : 'text-slate-400',
                  )}
                >
                  {countdown.text}
                </p>
              )}
              <span className="mt-1 inline-block rounded bg-white/5 px-1.5 py-0.5 text-[10px] text-slate-400">
                {PRIORITY_LABELS[todo.priority]}优先级
              </span>
            </div>

            <div className="flex items-center gap-1 opacity-0 transition group-hover:opacity-100">
              {todo.subtasks.length > 0 && (
                <button
                  type="button"
                  onClick={() => setExpanded(!expanded)}
                  className="rounded p-1 text-slate-400 hover:bg-white/10"
                >
                  {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </button>
              )}
              <button
                type="button"
                onClick={() => void updateTodo(todo.id, { starred: !todo.starred })}
                className="rounded p-1 text-slate-400 hover:bg-white/10"
              >
                <Star size={14} className={todo.starred ? 'fill-amber-400 text-amber-400' : ''} />
              </button>
              <button
                type="button"
                onClick={() => void deleteTodo(todo.id)}
                className="rounded p-1 text-slate-400 hover:bg-red-500/10 hover:text-red-400"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>

          {(expanded || todo.subtasks.length === 0) && (
            <div className="mt-2 space-y-1 pl-1">
              {todo.subtasks.map((sub) => (
                <label key={sub.id} className="flex items-center gap-2 text-xs text-slate-400">
                  <input
                    type="checkbox"
                    checked={sub.completed}
                    onChange={() => void toggleSubtask(todo.id, sub.id)}
                    className="accent-violet-500"
                  />
                  <span className={sub.completed ? 'line-through' : ''}>{sub.title}</span>
                </label>
              ))}
              <div className="flex gap-2 pt-1">
                <Input
                  placeholder="添加子任务"
                  value={subtaskInput}
                  onChange={(e) => setSubtaskInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && subtaskInput.trim()) {
                      void addSubtask(todo.id, subtaskInput)
                      setSubtaskInput('')
                      setExpanded(true)
                    }
                  }}
                  className="h-7 text-xs"
                />
              </div>
              {todo.subtasks.length > 0 && (
                <p className="text-[10px] text-slate-500">
                  子任务 {completedSubtasks}/{todo.subtasks.length}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export function TodoPanel({ searchQuery }: TodoPanelProps) {
  const { items, addTodo, reorderTodos } = useTodoStore()
  const [input, setInput] = useState('')
  const [priority, setPriority] = useState<Priority>('medium')

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const sorted = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    let list = [...items]
    if (q) {
      list = list.filter((t) => t.title.toLowerCase().includes(q))
    }
    return list.sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1
      if (a.completed !== b.completed) return a.completed ? 1 : -1
      return a.sortOrder - b.sortOrder
    })
  }, [items, searchQuery])

  const handleAdd = async () => {
    if (!input.trim()) return
    await addTodo(input, priority)
    setInput('')
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      void reorderTodos(String(active.id), String(over.id))
    }
  }

  const pendingCount = items.filter((t) => !t.completed).length

  return (
    <section className="glass-card flex flex-1 flex-col p-5">
      <div className="mb-4 flex items-center gap-2">
        <CheckSquare className="text-cyan-400" size={20} />
        <h2 className="text-base font-semibold text-slate-100">Todo</h2>
        <span className="rounded-full bg-white/5 px-2 py-0.5 text-xs text-slate-400">
          待完成 {pendingCount}
        </span>
      </div>

      <div className="mb-4 flex gap-2">
        <Input
          placeholder="输入待办，回车创建..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') void handleAdd()
          }}
          className="flex-1"
        />
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value as Priority)}
          className="rounded-lg border border-white/10 bg-white/5 px-2 text-sm text-slate-100"
        >
          <option value="high">高</option>
          <option value="medium">中</option>
          <option value="low">低</option>
        </select>
        <Button onClick={() => void handleAdd()}>添加</Button>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={sorted.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          <div className="scrollbar-thin flex flex-1 flex-col gap-2 overflow-y-auto pr-1">
            {sorted.map((todo) => (
              <SortableTodoItem key={todo.id} todo={todo} />
            ))}
            {sorted.length === 0 && (
              <p className="py-8 text-center text-sm text-slate-500">暂无待办，输入后回车快速创建</p>
            )}
          </div>
        </SortableContext>
      </DndContext>
    </section>
  )
}
