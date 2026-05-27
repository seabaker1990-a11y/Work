import { useEffect, useState } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { useSettingsStore } from '@/store/settingStore'
import { hydrateAllStores } from '@/services/initData'

function App() {
  const { theme, loaded } = useSettingsStore()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    void hydrateAllStores().then(() => setReady(true))
  }, [])

  if (!ready || !loaded) {
    return (
      <div className="dashboard-bg flex min-h-screen items-center justify-center">
        <div className="text-center">
          <img
            src="/assets/logo-dashboard.png"
            alt="Loading"
            className="mx-auto mb-4 h-16 w-16 animate-pulse rounded-xl"
            width={64}
            height={64}
          />
          <p className="text-sm text-slate-400">加载个人工作台...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={theme === 'light' ? 'light-theme' : ''}>
      <DashboardLayout />
    </div>
  )
}

export default App
