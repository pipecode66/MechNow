import { NextResponse } from "next/server"
import { validateAddress } from "@/lib/address-validation"
import { addressValidationSchema, zodErrorToFields } from "@/lib/validators"

export const runtime = "nodejs"

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  const parsed = addressValidationSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { status: "invalid", error: "Invalid address", fields: zodErrorToFields(parsed.error) },
      { status: 400 }
    )
  }

  const result = await validateAddress({
    street: parsed.data.street,
    zipCode: parsed.data.zipCode,
    city: parsed.data.city,
    state: parsed.data.state,
  })

  return NextResponse.json(result)
}
