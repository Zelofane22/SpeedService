'use client'

import { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'

const STORAGE_KEY = 'speedservice-theme'

function applyTheme(isDark: boolean) {
  document.documentElement.classList.toggle('dark', isDark)
  document.documentElement.style.colorScheme = isDark ? 'dark' : 'light'
}

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

    const syncFromDocument = () => {
      setIsDark(document.documentElement.classList.contains('dark'))
    }

    const handleSystemTheme = (event: MediaQueryListEvent) => {
      if (localStorage.getItem(STORAGE_KEY)) return
      applyTheme(event.matches)
      setIsDark(event.matches)
    }

    const handleStorage = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY) return
      const nextIsDark = event.newValue ? event.newValue === 'dark' : mediaQuery.matches
      applyTheme(nextIsDark)
      setIsDark(nextIsDark)
    }

    syncFromDocument()
    mediaQuery.addEventListener('change', handleSystemTheme)
    window.addEventListener('storage', handleStorage)

    return () => {
      mediaQuery.removeEventListener('change', handleSystemTheme)
      window.removeEventListener('storage', handleStorage)
    }
  }, [])

  function toggleTheme() {
    const nextIsDark = !document.documentElement.classList.contains('dark')
    applyTheme(nextIsDark)
    try {
      localStorage.setItem(STORAGE_KEY, nextIsDark ? 'dark' : 'light')
    } catch {
      // The theme still applies for the current page when storage is unavailable.
    }
    setIsDark(nextIsDark)
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Activer le thème clair' : 'Activer le thème sombre'}
      aria-pressed={isDark}
      title={isDark ? 'Passer au thème clair' : 'Passer au thème sombre'}
      className="fixed bottom-4 right-4 z-[100] inline-flex min-h-11 items-center gap-2 rounded-2xl border border-brand-border bg-white px-4 py-2.5 text-sm font-semibold text-brand-foreground shadow-lg transition-colors hover:bg-brand-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-brand-background"
    >
      {isDark ? <Sun size={17} aria-hidden="true" /> : <Moon size={17} aria-hidden="true" />}
      <span>Thème</span>
    </button>
  )
}
