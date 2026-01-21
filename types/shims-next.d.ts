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
  export function useRouter(): {
    push: (href: string) => void
    replace: (href: string) => void
    refresh: () => void
    back: () => void
    forward: () => void
  }
}


