import { Search, Moon, Sun, Settings } from 'lucide-react'
import { motion } from 'framer-motion'
import { useClock } from '@/hooks/useClock'
import { useSettingsStore } from '@/store/settingStore'
import { Input } from '@/components/ui/Input'

interface HeaderProps {
  searchQuery: string
  onSearchChange: (value: string) => void
}

export function Header({ searchQuery, onSearchChange }: HeaderProps) {
  const { formatted, date } = useClock()
  const { theme, toggleTheme } = useSettingsStore()

  return (
    <motion.header
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="glass-card relative z-10 flex flex-wrap items-center gap-4 px-5 py-3"
    >
      <div className="flex min-w-[180px] items-center gap-3">
        <img
          src="/assets/logo-dashboard.png"
          alt="Dashboard Logo"
          className="h-9 w-9 rounded-lg object-cover"
          width={36}
          height={36}
        />
        <div>
          <p className="text-sm font-semibold text-slate-100">Dashboard</p>
          <p className="text-xs text-slate-400">个人工作台</p>
        </div>
      </div>

      <div className="relative mx-auto flex-1 min-w-[200px] max-w-xl">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
        <Input
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="搜索待办、愿望、日程..."
          className="pl-9"
        />
      </div>

      <div className="ml-auto flex items-center gap-2">
        <button
          type="button"
          onClick={toggleTheme}
          className="rounded-lg border border-white/10 bg-white/5 p-2 text-slate-300 transition hover:border-violet-500/30 hover:bg-violet-500/10 hover:text-violet-300"
          title={theme === 'dark' ? '切换浅色模式' : '切换深色模式'}
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        <button
          type="button"
          className="rounded-lg border border-white/10 bg-white/5 p-2 text-slate-300 transition hover:border-violet-500/30 hover:bg-violet-500/10"
          title="设置"
        >
          <Settings size={18} />
        </button>
        <div className="hidden rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-right sm:block">
          <p className="text-lg font-semibold tabular-nums text-slate-100">{formatted}</p>
          <p className="text-xs text-slate-400">{date}</p>
        </div>
      </div>
    </motion.header>
  )
}
