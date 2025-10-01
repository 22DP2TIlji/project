// Temporary shims to satisfy TypeScript module resolution during development
// If your node_modules are installed, these should be unnecessary.

declare module 'next/link' {
  import * as React from 'react'
  const Link: React.ComponentType<any>
  export default Link
}

declare module 'next/navigation' {
  export function usePathname(): string
  export function useParams<T extends Record<string, string | string[]>>() : T
}

declare module 'react' {
  export const useEffect: any
  export const useState: any
  export const useRef: any
  const React: any
  export default React
}


