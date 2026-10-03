import type { ReactNode } from 'react'
import { cn } from 'ui-kit/utils'

type MapTabPanelProps = {
  active: boolean
  children: ReactNode
}

export function MapTabPanel({ active, children }: MapTabPanelProps) {
  return (
    <div
      className={cn(
        'absolute inset-0 isolate',
        !active && 'pointer-events-none invisible',
      )}
      aria-hidden={!active}
    >
      {children}
    </div>
  )
}
