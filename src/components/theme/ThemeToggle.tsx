'use client'

import { useTheme } from './ThemeProvider'

interface ThemeToggleProps {
  size?: 'sm' | 'lg'
}

export function ThemeToggle({ size = 'sm' }: ThemeToggleProps) {
  const { theme, setTheme, resolvedTheme } = useTheme()

  function cycle() {
    if (theme === 'system') setTheme('light')
    else if (theme === 'light') setTheme('dark')
    else setTheme('system')
  }

  const iconSize = size === 'lg' ? 'w-6 h-6' : 'w-5 h-5'
  const buttonSize = size === 'lg'
    ? 'p-3 rounded-xl'
    : 'p-2 rounded-lg'

  return (
    <button
      type="button"
      onClick={cycle}
      aria-label={`Theme: ${theme}. Click to change.`}
      className={`${buttonSize} text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800 transition-colors`}
      title={`Current: ${theme}`}
    >
      {resolvedTheme === 'dark' ? (
        <svg className={iconSize} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      ) : (
        <svg className={iconSize} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      )}
      {theme === 'system' && (
        <span className="sr-only">(follows system)</span>
      )}
    </button>
  )
}
