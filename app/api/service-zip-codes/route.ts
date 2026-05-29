import { NextResponse } from "next/server"
import { checkServiceZipCode, listServiceZipCodes } from "@/lib/service-zip-codes"
import { zipQuerySchema, zodErrorToFields } from "@/lib/validators"

export const runtime = "nodejs"

export async function GET(request: Request) {
  const url = new URL(request.url)
  const zip = url.searchParams.get("zip")

  if (!zip) {
    const zipCodes = await listServiceZipCodes()
    return NextResponse.json({ zipCodes })
  }

  const parsed = zipQuerySchema.safeParse({ zip })
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid ZIP", fields: zodErrorToFields(parsed.error) },
      { status: 400 }
    )
  }

  const result = await checkServiceZipCode(parsed.data.zip)
  if (!result.available) {
    return NextResponse.json({ error: "Service coverage is unavailable" }, { status: 503 })
  }

  return NextResponse.json({ zip: parsed.data.zip, covered: result.covered })
}
