import { describe, expect, it } from "vitest"
import {
  formatPhone,
  isValidEmail,
  isValidZip,
  normalizePhone,
  toTitleCase,
} from "@/lib/utils"

describe("phone helpers", () => {
  it("normalizes US phone input", () => {
    expect(normalizePhone("(916) 555-0123")).toBe("9165550123")
    expect(formatPhone("9165550123")).toBe("(916) 555-0123")
  })

  it("does not format incomplete phone input", () => {
    expect(formatPhone("555")).toBe("555")
  })
})

describe("input helpers", () => {
  it("validates five digit ZIP codes", () => {
    expect(isValidZip("95814")).toBe(true)
    expect(isValidZip("9581")).toBe(false)
    expect(isValidZip("ABCDE")).toBe(false)
  })

  it("validates basic email format", () => {
    expect(isValidEmail("driver@example.com")).toBe(true)
    expect(isValidEmail("driver@example")).toBe(false)
  })

  it("normalizes display names", () => {
    expect(toTitleCase("mobile MECHANIC")).toBe("Mobile Mechanic")
  })
})
