import { create } from 'zustand'
import { loadSettings, saveSettings } from '@/db/dexie'
import type { ThemeMode } from '@/types'

interface SettingsState {
  theme: ThemeMode
  initialized: boolean
  loaded: boolean
  setTheme: (theme: ThemeMode) => void
  toggleTheme: () => void
  hydrate: () => Promise<void>
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  theme: 'dark',
  initialized: false,
  loaded: false,

  setTheme: (theme) => {
    set({ theme })
    void saveSettings({ theme, initialized: get().initialized })
  },

  toggleTheme: () => {
    const next = get().theme === 'dark' ? 'light' : 'dark'
    get().setTheme(next)
  },

  hydrate: async () => {
    const settings = await loadSettings()
    set({ theme: settings.theme, initialized: settings.initialized, loaded: true })
  },
}))

export async function markInitialized(): Promise<void> {
  const settings = await loadSettings()
  await saveSettings({ ...settings, initialized: true })
  useSettingsStore.setState({ initialized: true })
}
