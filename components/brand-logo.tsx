import { Wrench } from "lucide-react"

export function BrandLogo() {
  return (
    <div className="flex items-center gap-2" aria-label="Rapi Mobile Mechanic">
      <span className="grid size-10 place-items-center rounded-lg bg-primary text-primary-foreground">
        <Wrench className="size-5" aria-hidden="true" />
      </span>
      <div className="leading-tight">
        <div className="text-sm font-semibold tracking-wide">Rapi</div>
        <div className="text-xs text-muted-foreground">Mobile Mechanic</div>
      </div>
    </div>
  )
}
