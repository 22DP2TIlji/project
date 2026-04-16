'use client'

import * as React from 'react'
import {
  ThemeProvider as NextThemesProvider,
  type ThemeProviderProps,
} from 'next-themes'

/**
 * Motīvu nodrošinātājs (ThemeProvider), kas ļauj pārslēgties 
 * starp gaišo un tumšo režīmu Next.js lietotnē.
 */
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}