import { NextResponse } from "next/server"
import { lookupZipCity } from "@/lib/zip-city"
import { zipQuerySchema, zodErrorToFields } from "@/lib/validators"

export const runtime = "nodejs"

export async function GET(request: Request) {
  const url = new URL(request.url)
  const parsed = zipQuerySchema.safeParse({ zip: url.searchParams.get("zip") ?? "" })

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid ZIP", fields: zodErrorToFields(parsed.error) },
      { status: 400 }
    )
  }

  const result = lookupZipCity(parsed.data.zip)
  if (!result) {
    return NextResponse.json({ error: "ZIP not found" }, { status: 404 })
  }

  return NextResponse.json(result)
}
