import { useMemo, useState } from 'react'
import { Target, Plus, GripVertical, Trash2 } from 'lucide-react'
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
import { useWishlistStore } from '@/store/wishlistStore'
import { Progress } from '@/components/ui/Progress'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { cn } from '@/lib/utils'
import { PRIORITY_LABELS, WISH_STATUS_LABELS, WISH_CATEGORIES } from '@/types'
import type { Priority, WishItem, WishStatus } from '@/types'

interface WishlistPanelProps {
  searchQuery: string
}

function SortableWishCard({
  wish,
  onDeleteRequest,
}: {
  wish: WishItem
  onDeleteRequest: (wish: WishItem) => void
}) {
  const { updateWish } = useWishlistStore()
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: wish.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const statusColor: Record<WishStatus, string> = {
    not_started: 'text-slate-400',
    in_progress: 'text-violet-400',
    completed: 'text-emerald-400',
    abandoned: 'text-slate-600',
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'group relative rounded-xl border border-white/8 bg-white/[0.03] p-4 pb-10 transition-all hover:-translate-y-0.5 hover:border-violet-500/30 hover:shadow-lg hover:shadow-violet-500/5',
        wish.status === 'completed' && 'opacity-60',
      )}
    >
      <div className="flex items-start gap-2">
        <button
          type="button"
          className="mt-0.5 cursor-grab text-slate-600 opacity-0 transition group-hover:opacity-100"
          {...attributes}
          {...listeners}
        >
          <GripVertical size={14} />
        </button>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <h4
              className={cn(
                'truncate font-medium text-slate-100',
                wish.status === 'completed' && 'line-through',
              )}
            >
              {wish.title}
            </h4>
            <span className={cn('shrink-0 text-xs', statusColor[wish.status])}>
              {WISH_STATUS_LABELS[wish.status]}
            </span>
          </div>
          {wish.description && (
            <p className="mt-1 line-clamp-2 text-xs text-slate-400">{wish.description}</p>
          )}
          <div className="mt-3">
            <div className="mb-1 flex justify-between text-xs text-slate-400">
              <span>进度</span>
              <span>{wish.progress}%</span>
            </div>
            <Progress value={wish.progress} />
            <input
              type="range"
              min={0}
              max={100}
              value={wish.progress}
              onChange={(e) => void updateWish(wish.id, { progress: Number(e.target.value) })}
              className="mt-2 w-full accent-violet-500"
            />
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="rounded-md bg-violet-500/15 px-2 py-0.5 text-xs text-violet-300">
              {wish.category}
            </span>
            <span className="rounded-md bg-white/5 px-2 py-0.5 text-xs text-slate-400">
              {PRIORITY_LABELS[wish.priority]}优先级
            </span>
          </div>
        </div>
      </div>
      <button
        type="button"
        onClick={() => onDeleteRequest(wish)}
        className="absolute bottom-3 right-3 rounded-lg p-1.5 text-slate-500 transition hover:bg-red-500/10 hover:text-red-400"
        title="删除愿望"
        aria-label="删除愿望"
      >
        <Trash2 size={14} />
      </button>
    </div>
  )
}

export function WishlistPanel({ searchQuery }: WishlistPanelProps) {
  const { items, addWish, reorderWishes, deleteWish } = useWishlistStore()
  const [modalOpen, setModalOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<WishItem | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState<string>(WISH_CATEGORIES[0])
  const [priority, setPriority] = useState<Priority>('medium')
  const [progress, setProgress] = useState(0)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return items
    return items.filter(
      (w) =>
        w.title.toLowerCase().includes(q) ||
        w.description?.toLowerCase().includes(q) ||
        w.category.toLowerCase().includes(q),
    )
  }, [items, searchQuery])

  const handleAdd = async () => {
    if (!title.trim()) return
    await addWish({
      title: title.trim(),
      description: description.trim() || undefined,
      category,
      priority,
      status: 'not_started',
      progress,
    })
    setTitle('')
    setDescription('')
    setProgress(0)
    setModalOpen(false)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      void reorderWishes(String(active.id), String(over.id))
    }
  }

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return
    await deleteWish(deleteTarget.id)
    setDeleteTarget(null)
  }

  const completedCount = items.filter((w) => w.status === 'completed').length

  return (
    <section className="glass-card flex flex-col p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target className="text-violet-400" size={20} />
          <h2 className="text-base font-semibold text-slate-100">愿望清单</h2>
          <span className="rounded-full bg-white/5 px-2 py-0.5 text-xs text-slate-400">
            已完成 {completedCount}
          </span>
        </div>
        <Button size="sm" onClick={() => setModalOpen(true)}>
          <Plus size={14} className="mr-1" />
          新增
        </Button>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={filtered.map((w) => w.id)} strategy={verticalListSortingStrategy}>
          <div className="scrollbar-thin flex max-h-[280px] flex-col gap-3 overflow-y-auto pr-1">
            {filtered.map((wish) => (
              <SortableWishCard key={wish.id} wish={wish} onDeleteRequest={setDeleteTarget} />
            ))}
            {filtered.length === 0 && (
              <p className="py-8 text-center text-sm text-slate-500">暂无愿望，点击新增开始规划</p>
            )}
          </div>
        </SortableContext>
      </DndContext>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="新增愿望">
        <div className="space-y-3">
          <Input placeholder="愿望标题" value={title} onChange={(e) => setTitle(e.target.value)} />
          <textarea
            placeholder="描述（可选）"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="min-h-[80px] w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-100 outline-none focus:border-violet-500/50"
          />
          <div className="grid grid-cols-2 gap-3">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-100"
            >
              {WISH_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as Priority)}
              className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-100"
            >
              <option value="high">高优先级</option>
              <option value="medium">中优先级</option>
              <option value="low">低优先级</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs text-slate-400">初始进度: {progress}%</label>
            <input
              type="range"
              min={0}
              max={100}
              value={progress}
              onChange={(e) => setProgress(Number(e.target.value))}
              className="w-full accent-violet-500"
            />
          </div>
          <Button className="w-full" onClick={() => void handleAdd()}>
            创建愿望
          </Button>
        </div>
      </Modal>

      <Modal
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        title="确认删除"
        className="max-w-sm"
      >
        <p className="mb-5 text-sm text-slate-300">
          确定要删除愿望「<span className="font-medium text-slate-100">{deleteTarget?.title}</span>
          」吗？此操作无法撤销。
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={() => setDeleteTarget(null)}>
            否
          </Button>
          <Button variant="danger" onClick={() => void handleConfirmDelete()}>
            是
          </Button>
        </div>
      </Modal>
    </section>
  )
}
