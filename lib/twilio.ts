import "server-only"

import twilio from "twilio"
import type { SmsResult } from "@/types"

function hasTwilioConfig() {
  return Boolean(
    process.env.TWILIO_ACCOUNT_SID &&
      process.env.TWILIO_AUTH_TOKEN &&
      process.env.TWILIO_PHONE_NUMBER
  )
}

export async function sendSms(to: string, body: string): Promise<SmsResult> {
  if (!hasTwilioConfig()) {
    return { sent: false, skipped: true }
  }

  try {
    const client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    )

    await client.messages.create({
      to,
      from: process.env.TWILIO_PHONE_NUMBER,
      body,
    })

    return { sent: true }
  } catch (error) {
    return {
      sent: false,
      error: error instanceof Error ? error.message : "SMS failed",
    }
  }
}

export async function sendAdminSms(body: string): Promise<SmsResult> {
  const adminPhone = process.env.ADMIN_PHONE_NUMBER
  if (!adminPhone) {
    return { sent: false, skipped: true }
  }

  return sendSms(adminPhone, body)
}
