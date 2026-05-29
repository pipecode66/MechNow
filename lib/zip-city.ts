export interface ZipCity {
  zip: string
  city: string
  state: string
}

export const SACRAMENTO_ZIPS: ZipCity[] = [
  { zip: "95811", city: "Sacramento", state: "CA" },
  { zip: "95814", city: "Sacramento", state: "CA" },
  { zip: "95815", city: "Sacramento", state: "CA" },
  { zip: "95816", city: "Sacramento", state: "CA" },
  { zip: "95817", city: "Sacramento", state: "CA" },
  { zip: "95818", city: "Sacramento", state: "CA" },
  { zip: "95819", city: "Sacramento", state: "CA" },
  { zip: "95820", city: "Sacramento", state: "CA" },
  { zip: "95821", city: "Sacramento", state: "CA" },
  { zip: "95822", city: "Sacramento", state: "CA" },
  { zip: "95823", city: "Sacramento", state: "CA" },
  { zip: "95825", city: "Sacramento", state: "CA" },
  { zip: "95826", city: "Sacramento", state: "CA" },
  { zip: "95827", city: "Sacramento", state: "CA" },
  { zip: "95828", city: "Sacramento", state: "CA" },
  { zip: "95831", city: "Sacramento", state: "CA" },
  { zip: "95833", city: "Sacramento", state: "CA" },
  { zip: "95834", city: "Sacramento", state: "CA" },
  { zip: "95835", city: "Sacramento", state: "CA" },
  { zip: "95838", city: "Sacramento", state: "CA" },
]

export function lookupZipCity(zip: string): ZipCity | null {
  return SACRAMENTO_ZIPS.find((item) => item.zip === zip) ?? null
}
