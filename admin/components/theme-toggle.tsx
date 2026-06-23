'use client'

import { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'

const STORAGE_KEY = 'speedservice-theme'

function applyTheme(isDark: boolean) {
  document.documentElement.classList.toggle('dark', isDark)
  document.documentElement.style.colorScheme = isDark ? 'dark' : 'light'
}

function hasSavedTheme(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) !== null
  } catch {
    return false
  }
}

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

    const syncFromDocument = () => {
      setIsDark(document.documentElement.classList.contains('dark'))
    }

    const handleSystemTheme = (event: MediaQueryListEvent) => {
      if (hasSavedTheme()) return
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
      // Le thème reste actif pour la session si le stockage est indisponible.
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
      className="fixed bottom-4 right-4 z-[100] inline-flex min-h-11 items-center gap-2 rounded-2xl border border-border bg-card px-4 py-2.5 text-sm font-semibold text-foreground shadow-lg transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      {isDark ? <Sun size={17} aria-hidden="true" /> : <Moon size={17} aria-hidden="true" />}
      <span>Thème</span>
    </button>
  )
}
