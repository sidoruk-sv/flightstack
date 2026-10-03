import type { ReactNode } from "react"

type TabPanelProps = {
  active: boolean
  children: ReactNode
}

export function TabPanel({ active, children }: TabPanelProps) {
  return (
    <div
      className={active ? "flex flex-col gap-4" : "hidden"}
      aria-hidden={!active}
    >
      {children}
    </div>
  )
}
