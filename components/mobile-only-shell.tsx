import { Smartphone } from "lucide-react"

export function MobileOnlyShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="mobile-app-shell">{children}</div>
      <aside className="desktop-blocker" aria-label="MechNow mobile only">
        <div className="desktop-blocker__panel">
          <div className="desktop-blocker__icon" aria-hidden="true">
            <Smartphone className="size-8" />
          </div>
          <p className="desktop-blocker__kicker">MechNow</p>
          <h1>Disponible solo en movil</h1>
          <p>
            Abre esta aplicacion desde un telefono para reservar y administrar
            servicios de mecanica movil.
          </p>
        </div>
      </aside>
    </>
  )
}
