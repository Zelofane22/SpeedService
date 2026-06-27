'use client'

import { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'
import { cn } from './utils'

const STORAGE_KEY = 'speedservice-theme'
type ThemeMode = 'light' | 'dark'

function isThemeMode(value: string | null): value is ThemeMode {
  return value === 'light' || value === 'dark'
}

function applyTheme(mode: ThemeMode) {
  const isDark = mode === 'dark'
  document.documentElement.classList.toggle('dark', isDark)
  document.documentElement.style.colorScheme = isDark ? 'dark' : 'light'
}

export function ThemeToggle({ className }: { className?: string }) {
  const [theme, setTheme] = useState<ThemeMode>('light')

  useEffect(() => {
    const syncFromDocument = () => {
      setTheme(document.documentElement.classList.contains('dark') ? 'dark' : 'light')
    }

    const handleStorage = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY) return
      const nextTheme = isThemeMode(event.newValue) ? event.newValue : 'light'
      applyTheme(nextTheme)
      setTheme(nextTheme)
    }

    syncFromDocument()
    window.addEventListener('storage', handleStorage)

    return () => {
      window.removeEventListener('storage', handleStorage)
    }
  }, [])

  function selectTheme(nextTheme: ThemeMode) {
    applyTheme(nextTheme)
    try {
      localStorage.setItem(STORAGE_KEY, nextTheme)
    } catch {
      // Le thème reste actif pour la session si le stockage est indisponible.
    }
    setTheme(nextTheme)
  }

  const options: Array<{ value: ThemeMode; label: string; icon: typeof Sun }> = [
    { value: 'light', label: 'Clair', icon: Sun },
    { value: 'dark', label: 'Sombre', icon: Moon },
  ]

  return (
    <div className={cn('grid grid-cols-2 gap-2', className)} role="group" aria-label="Choix de l'apparence">
      {options.map(({ value, label, icon: Icon }) => {
        const isSelected = theme === value

        return (
          <button
            key={value}
            type="button"
            onClick={() => selectTheme(value)}
            aria-pressed={isSelected}
            className={cn(
              'inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#861D6D]/40',
              isSelected
                ? 'border-[#861D6D] bg-[#861D6D] text-white shadow-lg shadow-[#861D6D]/20'
                : 'border-gray-200 bg-white text-gray-700 hover:border-[#861D6D]/40 hover:bg-gray-50 dark:border-[#4e3b4a] dark:bg-[#221922] dark:text-[#faf6f9] dark:hover:bg-[#342734]'
            )}
          >
            <Icon size={17} aria-hidden="true" />
            <span>{label}</span>
          </button>
        )
      })}
    </div>
  )
}
