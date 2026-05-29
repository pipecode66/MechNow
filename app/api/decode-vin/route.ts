import { NextResponse } from "next/server"
import { decodeVin } from "@/lib/vin-decoder"
import { vinQuerySchema, zodErrorToFields } from "@/lib/validators"

export const runtime = "nodejs"

export async function GET(request: Request) {
  const url = new URL(request.url)
  const parsed = vinQuerySchema.safeParse({ vin: url.searchParams.get("vin") ?? "" })

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid VIN", fields: zodErrorToFields(parsed.error) },
      { status: 400 }
    )
  }

  const result = await decodeVin(parsed.data.vin)

  if (result.ok) {
    return NextResponse.json({ vehicle: result.vehicle })
  }

  const status = result.status === "notFound" ? 404 : 503
  return NextResponse.json({ error: result.error }, { status })
}
