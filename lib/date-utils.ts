export const TIME_SLOTS = ["08:00", "10:00", "12:00", "14:00", "16:00"] as const

export type TimeSlot = (typeof TIME_SLOTS)[number]

export function parseLocalDate(date: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return null
  const [year, month, day] = date.split("-").map(Number)
  const parsed = new Date(year, month - 1, day)

  if (
    parsed.getFullYear() !== year ||
    parsed.getMonth() !== month - 1 ||
    parsed.getDate() !== day
  ) {
    return null
  }

  return parsed
}

export function getTodayIsoDate(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, "0")
  const day = String(now.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

export function isPastDate(date: string): boolean {
  const parsed = parseLocalDate(date)
  if (!parsed) return true

  const today = parseLocalDate(getTodayIsoDate())
  return Boolean(today && parsed < today)
}

export function getAvailableSlots(bookedSlots: string[]): TimeSlot[] {
  return TIME_SLOTS.filter((slot) => !bookedSlots.includes(slot))
}

export function isTimeSlot(value: string): value is TimeSlot {
  return TIME_SLOTS.includes(value as TimeSlot)
}

export function formatAppointmentDate(date: string): string {
  const parsed = parseLocalDate(date)
  if (!parsed) return date

  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(parsed)
}
