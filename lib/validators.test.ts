import { describe, expect, it } from "vitest"
import {
  appointmentSchema,
  reviewSchema,
  technicianSchema,
  waitlistSchema,
} from "@/lib/validators"

const validAppointment = {
  firstName: "Alex",
  lastName: "Rivera",
  email: "alex@example.com",
  phone: "(916) 555-0123",
  zipCode: "95814",
  address: "100 Main St, Sacramento, CA, 95814",
  additionalInfo: "Parked in driveway",
  appointmentDate: "2099-06-01",
  appointmentTime: "10:00",
  vehicleYear: "2021",
  vehicleMake: "Toyota",
  vehicleModel: "Corolla",
  engineType: "2.0L",
  serviceType: "Oil Change",
  referralSource: "",
}

describe("appointment schema", () => {
  it("accepts a booking and normalizes the phone number", () => {
    const result = appointmentSchema.parse(validAppointment)
    expect(result.phone).toBe("9165550123")
  })

  it("rejects unavailable time windows and invalid ZIPs", () => {
    expect(
      appointmentSchema.safeParse({ ...validAppointment, appointmentTime: "09:00" }).success
    ).toBe(false)
    expect(
      appointmentSchema.safeParse({ ...validAppointment, zipCode: "958" }).success
    ).toBe(false)
  })
})

describe("public input schemas", () => {
  it("validates reviews and waitlist input", () => {
    expect(
      reviewSchema.safeParse({
        reviewerName: "Alex",
        reviewerEmail: "alex@example.com",
        rating: 5,
        comment: "Excellent service.",
      }).success
    ).toBe(true)
    expect(waitlistSchema.safeParse({ zipCode: "95814", email: "bad-email" }).success).toBe(
      false
    )
  })
})

describe("technician schema", () => {
  it("normalizes valid technician phone numbers", () => {
    const result = technicianSchema.parse({
      name: "Maria O'Neil",
      phone: "916-555-0100",
      specialties: ["Brakes"],
    })
    expect(result.phone).toBe("9165550100")
  })

  it("rejects invalid technician phone numbers", () => {
    expect(
      technicianSchema.safeParse({ name: "Maria", phone: "123", specialties: [] }).success
    ).toBe(false)
  })
})
