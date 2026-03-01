'use client'

import * as React from 'react'
import {
  ThemeProvider as NextThemesProvider,
  useTheme as useNextTheme,
  type ThemeProviderProps,
} from 'next-themes'

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}

export function useTheme() {
  const { theme, setTheme, resolvedTheme } = useNextTheme()
  return {
    theme: (resolvedTheme || theme || 'dark') as 'light' | 'dark',
    setTheme: setTheme as (theme: 'light' | 'dark') => void
  }
}
