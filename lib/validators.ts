import { z } from "zod"
import { isPastDate, TIME_SLOTS } from "@/lib/date-utils"
import { normalizePhone } from "@/lib/utils"

const zipSchema = z.string().regex(/^\d{5}$/, "ZIP must be 5 digits")
const emailSchema = z.string().trim().email()
const phoneSchema = z
  .string()
  .transform((value) => normalizePhone(value))
  .refine((value) => value.length === 10, "Phone must be 10 digits")
const idSchema = z.string().uuid()

export const waitlistSchema = z.object({
  zipCode: zipSchema,
  email: emailSchema,
})

export const vinQuerySchema = z.object({
  vin: z.string().trim().regex(/^[A-HJ-NPR-Z0-9]{17}$/i),
})

export const zipQuerySchema = z.object({
  zip: zipSchema,
})

export const addressValidationSchema = z.object({
  street: z.string().trim().min(1).max(200),
  zipCode: zipSchema,
  city: z.string().trim().max(100).optional().default(""),
  state: z.string().trim().max(2).optional().default("CA"),
})

export const availabilityQuerySchema = z.object({
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .refine((date) => !isPastDate(date), "Date cannot be in the past"),
})

export const appointmentSchema = z.object({
  firstName: z.string().trim().min(1).max(50),
  lastName: z.string().trim().min(1).max(50),
  email: emailSchema,
  phone: phoneSchema,
  zipCode: zipSchema,
  address: z.string().trim().min(1).max(300),
  additionalInfo: z.string().trim().max(500).optional().default(""),
  appointmentDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .refine((date) => !isPastDate(date), "Date cannot be in the past"),
  appointmentTime: z.enum(TIME_SLOTS),
  vehicleYear: z.string().trim().regex(/^\d{4}$/),
  vehicleMake: z.string().trim().min(1).max(80),
  vehicleModel: z.string().trim().min(1).max(80),
  engineType: z.string().trim().min(1).max(80),
  serviceType: z.string().trim().min(1).max(300),
  referralSource: z.string().trim().max(120).optional().default(""),
})

export const reviewSchema = z.object({
  reviewerName: z.string().trim().min(1).max(100),
  reviewerEmail: emailSchema,
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().trim().min(1).max(1000),
  serviceType: z.string().trim().max(120).optional().default(""),
})

export const technicianSchema = z.object({
  name: z.string().trim().min(1).max(50).regex(/^[A-Za-z\s'-]+$/),
  area: z.string().trim().max(100).optional().default(""),
  phone: phoneSchema,
  join_date: z.string().trim().max(20).optional().default(""),
  availability: z.string().trim().max(120).optional().default(""),
  specialties: z.array(z.string().trim().min(1).max(80)).optional().default([]),
})

export const statusUpdateSchema = z.object({
  id: idSchema,
  status: z.enum(["pending", "postponed", "completed", "cancelled"]),
})

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1).max(200),
})

export const entityIdSchema = idSchema

export const technicianAssignmentSchema = z.object({
  appointmentId: idSchema,
  technicianName: z.union([
    z.literal(""),
    z.string().trim().min(1).max(50).regex(/^[A-Za-z\s'-]+$/),
  ]),
})

export const zipMutationSchema = z.object({
  zipCode: zipSchema,
})

export const reviewModerationSchema = z.object({
  id: idSchema,
  status: z.enum(["approved", "rejected"]),
})

export function zodErrorToFields(error: z.ZodError): Record<string, string> {
  return error.issues.reduce<Record<string, string>>((fields, issue) => {
    const key = issue.path.join(".") || "form"
    fields[key] = issue.message
    return fields
  }, {})
}
