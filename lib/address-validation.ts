import "server-only"

import type { AddressInfo, LatLng } from "@/types"
import { lookupZipCity } from "@/lib/zip-city"

export type AddressValidationResult =
  | { status: "valid"; address: AddressInfo; coordinates: LatLng }
  | { status: "invalid"; error: string }
  | { status: "geocoderUnavailable"; error: string }

interface NominatimAddress {
  city?: string
  town?: string
  village?: string
  state?: string
  postcode?: string
}

interface NominatimItem {
  lat?: string
  lon?: string
  address?: NominatimAddress
}

interface CensusMatch {
  coordinates?: {
    x?: number
    y?: number
  }
  matchedAddress?: string
}

interface CensusResponse {
  result?: {
    addressMatches?: CensusMatch[]
  }
}

function buildAddress(address: AddressInfo, city?: string, state?: string): AddressInfo {
  const zipLookup = lookupZipCity(address.zipCode)

  return {
    street: address.street,
    zipCode: address.zipCode,
    city: city || address.city || zipLookup?.city || "",
    state: state || address.state || zipLookup?.state || "CA",
  }
}

async function tryNominatim(address: AddressInfo): Promise<AddressValidationResult | null> {
  const params = new URLSearchParams({
    format: "json",
    limit: "1",
    street: address.street,
    postalcode: address.zipCode,
    country: "US",
    addressdetails: "1",
  })

  const response = await fetch(`https://nominatim.openstreetmap.org/search?${params}`, {
    headers: {
      "User-Agent": "MechNow/1.0",
      Accept: "application/json",
    },
  })

  if (!response.ok) return null

  const data = (await response.json()) as NominatimItem[]
  const match = data[0]
  const lat = Number(match?.lat)
  const lng = Number(match?.lon)

  if (!match || Number.isNaN(lat) || Number.isNaN(lng)) {
    return { status: "invalid", error: "Address not found" }
  }

  return {
    status: "valid",
    address: buildAddress(
      address,
      match.address?.city ?? match.address?.town ?? match.address?.village,
      match.address?.state
    ),
    coordinates: { lat, lng },
  }
}

async function tryCensus(address: AddressInfo): Promise<AddressValidationResult | null> {
  const params = new URLSearchParams({
    address: [address.street, address.city, address.state, address.zipCode]
      .filter(Boolean)
      .join(", "),
    benchmark: "Public_AR_Current",
    format: "json",
  })

  const response = await fetch(
    `https://geocoding.geo.census.gov/geocoder/locations/onelineaddress?${params}`
  )

  if (!response.ok) return null

  const data = (await response.json()) as CensusResponse
  const match = data.result?.addressMatches?.[0]
  const lat = match?.coordinates?.y
  const lng = match?.coordinates?.x

  if (lat === undefined || lng === undefined) {
    return { status: "invalid", error: "Address not found" }
  }

  return {
    status: "valid",
    address: buildAddress(address),
    coordinates: { lat, lng },
  }
}

export async function validateAddress(
  address: AddressInfo
): Promise<AddressValidationResult> {
  if (!address.street.trim() || !/^\d{5}$/.test(address.zipCode)) {
    return { status: "invalid", error: "Invalid address format" }
  }

  try {
    const nominatim = await tryNominatim(address)
    if (nominatim) return nominatim
  } catch {
    // Try Census before declaring geocoding unavailable.
  }

  try {
    const census = await tryCensus(address)
    if (census) return census
  } catch {
    return { status: "geocoderUnavailable", error: "Geocoder unavailable" }
  }

  return { status: "geocoderUnavailable", error: "Geocoder unavailable" }
}
