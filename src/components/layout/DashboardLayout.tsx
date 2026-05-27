import { useState } from 'react'
import { motion } from 'framer-motion'
import { Header } from '@/components/layout/Header'
import { WishlistPanel } from '@/components/wishlist/WishlistPanel'
import { TodoPanel } from '@/components/todo/TodoPanel'
import { CalendarPanel } from '@/components/calendar/CalendarPanel'
import { ToolsPanel } from '@/components/tools/ToolsPanel'

export function DashboardLayout() {
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <div className="dashboard-bg relative min-h-screen">
      <div className="relative z-10 mx-auto flex min-h-screen max-w-[1920px] flex-col gap-6 p-4 md:p-6">
        <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />

        <motion.main
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.05 }}
          className="grid flex-1 grid-cols-1 gap-6 xl:grid-cols-[2fr_3fr]"
        >
          <div className="flex flex-col gap-6">
            <WishlistPanel searchQuery={searchQuery} />
            <TodoPanel searchQuery={searchQuery} />
          </div>
          <CalendarPanel searchQuery={searchQuery} />
        </motion.main>

        <ToolsPanel searchQuery={searchQuery} />
      </div>
    </div>
  )
}
