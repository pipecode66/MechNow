import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Merges class names using clsx + tailwind-merge.
 * Resolves Tailwind conflicts (e.g. p-2 + p-4 → p-4).
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Strips all non-numeric characters from a phone string and returns
 * the resulting 10-digit string (or whatever digits remain).
 * Requirements: 7.4, 14.7
 */
export function normalizePhone(raw: string): string {
  return raw.replace(/\D/g, "")
}

/**
 * Formats a raw phone string as (555) 123-4567.
 * Accepts any string; strips non-digits first.
 * Returns the original value unchanged if it doesn't contain exactly 10 digits.
 * Requirements: 7.4, 14.7
 */
export function formatPhone(raw: string): string {
  const digits = normalizePhone(raw)
  if (digits.length !== 10) return raw
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
}

/**
 * Returns true if the value is exactly 5 numeric digits (00000–99999).
 * Requirements: 2.6, 5.1
 */
export function isValidZip(zip: string): boolean {
  return /^\d{5}$/.test(zip)
}

/**
 * Returns true if the value matches a basic valid email format
 * (local-part@domain.tld).
 * Requirements: 7.3
 */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

/**
 * Converts a string to Title Case (first letter of each word capitalised,
 * rest lower-cased).
 * Requirements: 14.7
 */
export function toTitleCase(value: string): string {
  return value
    .toLowerCase()
    .replace(/(?:^|\s)\S/g, (char) => char.toUpperCase())
}
