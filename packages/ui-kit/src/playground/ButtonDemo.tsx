import { Button } from "@/components/ui/button"

export function ButtonDemo() {
  return (
    <>
      <div>
        <h2 className="font-medium">Button</h2>
        <p className="text-sm text-muted-foreground">
          All variants on neo-brutal tokens.
        </p>
      </div>
      <div className="flex flex-wrap gap-3">
        <Button>Default</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="destructive">Destructive</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="link">Link</Button>
      </div>
    </>
  )
}
