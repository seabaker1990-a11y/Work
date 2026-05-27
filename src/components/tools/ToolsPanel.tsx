import { useMemo, useState } from 'react'
import { ExternalLink, GripVertical, Plus, Wrench } from 'lucide-react'
import { motion } from 'framer-motion'
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
  rectSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useToolStore } from '@/store/toolStore'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { TOOL_CATEGORIES } from '@/types'
import type { ToolItem } from '@/types'

interface ToolsPanelProps {
  searchQuery: string
}

function SortableToolCard({ tool }: { tool: ToolItem }) {
  const { deleteTool } = useToolStore()
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: tool.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <motion.a
      ref={setNodeRef}
      style={style}
      href={tool.url}
      target="_blank"
      rel="noopener noreferrer"
      whileHover={{ y: -4, scale: 1.03 }}
      className="group relative flex w-[120px] flex-col items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] p-4 transition-shadow hover:border-violet-500/40 hover:shadow-lg hover:shadow-violet-500/10"
    >
      <button
        type="button"
        className="absolute left-2 top-2 cursor-grab text-slate-600 opacity-0 transition group-hover:opacity-100"
        onClick={(e) => e.preventDefault()}
        {...attributes}
        {...listeners}
      >
        <GripVertical size={12} />
      </button>
      <button
        type="button"
        className="absolute right-2 top-2 text-slate-600 opacity-0 transition hover:text-red-400 group-hover:opacity-100"
        onClick={(e) => {
          e.preventDefault()
          void deleteTool(tool.id)
        }}
      >
        ×
      </button>
      <img
        src={tool.icon ?? '/assets/icons/default-tool.svg'}
        alt={tool.name}
        className="h-10 w-10 rounded-lg object-contain transition group-hover:scale-110"
        width={40}
        height={40}
        onError={(e) => {
          e.currentTarget.src = '/assets/icons/default-tool.svg'
        }}
      />
      <span className="text-center text-xs font-medium text-slate-200">{tool.name}</span>
      <ExternalLink size={10} className="absolute bottom-2 right-2 text-slate-600 opacity-0 group-hover:opacity-100" />
    </motion.a>
  )
}

export function ToolsPanel({ searchQuery }: ToolsPanelProps) {
  const { items, addTool, reorderTools } = useToolStore()
  const [modalOpen, setModalOpen] = useState(false)
  const [name, setName] = useState('')
  const [url, setUrl] = useState('')
  const [category, setCategory] = useState<string>(TOOL_CATEGORIES[0])

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return items
    return items.filter(
      (t) => t.name.toLowerCase().includes(q) || t.category.toLowerCase().includes(q),
    )
  }, [items, searchQuery])

  const handleAdd = async () => {
    if (!name.trim() || !url.trim()) return
    await addTool({ name: name.trim(), url: url.trim(), category })
    setName('')
    setUrl('')
    setModalOpen(false)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      void reorderTools(String(active.id), String(over.id))
    }
  }

  return (
    <section className="glass-card p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Wrench className="text-cyan-400" size={20} />
          <h2 className="text-base font-semibold text-slate-100">常用工具</h2>
        </div>
        <Button size="sm" onClick={() => setModalOpen(true)}>
          <Plus size={14} className="mr-1" />
          添加入口
        </Button>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={filtered.map((t) => t.id)} strategy={rectSortingStrategy}>
          <div className="flex flex-wrap gap-4">
            {filtered.map((tool) => (
              <SortableToolCard key={tool.id} tool={tool} />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="添加工具入口">
        <div className="space-y-3">
          <Input placeholder="名称" value={name} onChange={(e) => setName(e.target.value)} />
          <Input placeholder="URL" value={url} onChange={(e) => setUrl(e.target.value)} />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-100"
          >
            {TOOL_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <Button className="w-full" onClick={() => void handleAdd()}>
            添加
          </Button>
        </div>
      </Modal>
    </section>
  )
}
