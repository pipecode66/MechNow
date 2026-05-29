import "server-only"

export interface DecodedVehicle {
  year: string
  make: string
  model: string
  engineType: string
}

export type VinDecodeResult =
  | { ok: true; vehicle: DecodedVehicle }
  | { ok: false; status: "invalid" | "notFound" | "unavailable"; error: string }

interface NhtsaVehicle {
  ModelYear?: string
  Make?: string
  Model?: string
  EngineConfiguration?: string
  EngineCylinders?: string
  DisplacementL?: string
  ErrorCode?: string
}

interface NhtsaResponse {
  Results?: NhtsaVehicle[]
}

const vinPattern = /^[A-HJ-NPR-Z0-9]{17}$/i

function buildEngineType(vehicle: NhtsaVehicle): string {
  const parts = [
    vehicle.EngineConfiguration,
    vehicle.EngineCylinders ? `${vehicle.EngineCylinders} cyl` : "",
    vehicle.DisplacementL ? `${vehicle.DisplacementL}L` : "",
  ].filter(Boolean)

  return parts.join(" ") || "Unknown"
}

export async function decodeVin(vin: string): Promise<VinDecodeResult> {
  if (!vinPattern.test(vin)) {
    return { ok: false, status: "invalid", error: "Invalid VIN" }
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 7000)

  try {
    const response = await fetch(
      `https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVinValuesExtended/${encodeURIComponent(
        vin
      )}?format=json`,
      { signal: controller.signal }
    )

    if (!response.ok) {
      return { ok: false, status: "unavailable", error: "VIN service unavailable" }
    }

    const body = (await response.json()) as NhtsaResponse
    const vehicle = body.Results?.[0]

    if (!vehicle?.ModelYear || !vehicle.Make || !vehicle.Model) {
      return { ok: false, status: "notFound", error: "VIN data not found" }
    }

    return {
      ok: true,
      vehicle: {
        year: vehicle.ModelYear,
        make: vehicle.Make,
        model: vehicle.Model,
        engineType: buildEngineType(vehicle),
      },
    }
  } catch {
    return { ok: false, status: "unavailable", error: "VIN service unavailable" }
  } finally {
    clearTimeout(timeout)
  }
}
