import { describe, expect, it } from "vitest"
import {
  formatAppointmentDate,
  getAvailableSlots,
  isPastDate,
  isTimeSlot,
  TIME_SLOTS,
} from "@/lib/date-utils"

describe("appointment slot helpers", () => {
  it("exposes the fixed service windows", () => {
    expect(TIME_SLOTS).toEqual(["08:00", "10:00", "12:00", "14:00", "16:00"])
    expect(isTimeSlot("10:00")).toBe(true)
    expect(isTimeSlot("09:00")).toBe(false)
  })

  it("filters booked windows", () => {
    expect(getAvailableSlots(["08:00", "14:00"])).toEqual(["10:00", "12:00", "16:00"])
  })
})

describe("date validation", () => {
  it("rejects past and malformed dates", () => {
    expect(isPastDate("2000-01-01")).toBe(true)
    expect(isPastDate("not-a-date")).toBe(true)
  })

  it("allows future dates and formats them for display", () => {
    expect(isPastDate("2099-05-21")).toBe(false)
    expect(formatAppointmentDate("2099-05-21")).toContain("2099")
  })
})
