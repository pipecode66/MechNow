import "server-only"

import { SERVICE_OPTIONS } from "@/lib/service-options"
import type { Appointment, Review, Technician } from "@/types"

function dateFromToday(days: number): string {
  const date = new Date()
  date.setDate(date.getDate() + days)

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

const now = "2026-05-29T12:00:00.000Z"

export function getDemoAppointments(): Appointment[] {
  return [
    {
      id: "11111111-1111-4111-8111-111111111111",
      first_name: "Laura",
      last_name: "Martinez",
      email: "laura@example.com",
      phone: "9165550123",
      zip_code: "95814",
      address: "915 I St, Sacramento, CA 95814",
      additional_info: "Vehicle is parked near the front entrance.",
      appointment_date: dateFromToday(1),
      appointment_time: "10:00",
      status: "pending",
      vehicle_year: "2019",
      vehicle_make: "Toyota",
      vehicle_model: "Corolla",
      engine_type: "4 cyl 1.8L",
      service_type: "Oil Change, General Inspection",
      referral_source: "Instagram",
      assigned_mechanic: null,
      created_at: now,
      updated_at: now,
    },
    {
      id: "22222222-2222-4222-8222-222222222222",
      first_name: "Miguel",
      last_name: "Rojas",
      email: "miguel@example.com",
      phone: "9165550188",
      zip_code: "95818",
      address: "2115 10th St, Sacramento, CA 95818",
      additional_info: "Call before arrival.",
      appointment_date: dateFromToday(2),
      appointment_time: "14:00",
      status: "postponed",
      vehicle_year: "2017",
      vehicle_make: "Honda",
      vehicle_model: "Civic",
      engine_type: "4 cyl 2.0L",
      service_type: "Brakes",
      referral_source: "Friend",
      assigned_mechanic: "Carlos Medina",
      created_at: now,
      updated_at: now,
    },
    {
      id: "33333333-3333-4333-8333-333333333333",
      first_name: "Andrea",
      last_name: "Lopez",
      email: "andrea@example.com",
      phone: "9165550199",
      zip_code: "95825",
      address: "1900 Howe Ave, Sacramento, CA 95825",
      additional_info: null,
      appointment_date: dateFromToday(-1),
      appointment_time: "08:00",
      status: "completed",
      vehicle_year: "2021",
      vehicle_make: "Ford",
      vehicle_model: "Escape",
      engine_type: "EcoBoost 1.5L",
      service_type: "Battery, Engine Diagnostic",
      referral_source: "Google",
      assigned_mechanic: "Juan Jauregui",
      created_at: now,
      updated_at: now,
    },
  ]
}

export function getDemoTechnicians(): Technician[] {
  return [
    {
      id: "44444444-4444-4444-8444-444444444444",
      name: "Juan Jauregui",
      area: "Downtown Sacramento",
      phone: "9165550101",
      join_date: dateFromToday(-45),
      availability: "Mon-Fri, 8 AM - 5 PM",
      specialties: ["Diagnostics", "Battery", "Maintenance"],
      created_at: now,
    },
    {
      id: "55555555-5555-4555-8555-555555555555",
      name: "Carlos Medina",
      area: "East Sacramento",
      phone: "9165550102",
      join_date: dateFromToday(-32),
      availability: "Tue-Sat, 9 AM - 6 PM",
      specialties: ["Brakes", "Oil Change", "Inspection"],
      created_at: now,
    },
  ]
}

export function getDemoApprovedReviews(): Review[] {
  return [
    {
      id: "66666666-6666-4666-8666-666666666666",
      reviewer_name: "Paula Gomez",
      reviewer_email: "paula@example.com",
      rating: 5,
      comment: "The booking process was quick and the mechanic arrived on time.",
      service_type: SERVICE_OPTIONS[0]?.label ?? "Oil Change",
      status: "approved",
      approved_at: now,
      created_at: now,
    },
    {
      id: "77777777-7777-4777-8777-777777777777",
      reviewer_name: "David Smith",
      reviewer_email: "david@example.com",
      rating: 4,
      comment: "Helpful service and clear updates during the appointment.",
      service_type: SERVICE_OPTIONS[2]?.label ?? "Brakes",
      status: "approved",
      approved_at: now,
      created_at: now,
    },
  ]
}

export function getDemoPendingReviews(): Review[] {
  return [
    {
      id: "88888888-8888-4888-8888-888888888888",
      reviewer_name: "Sofia Ramirez",
      reviewer_email: "sofia@example.com",
      rating: 5,
      comment: "Great mobile mechanic experience. I would use it again.",
      service_type: SERVICE_OPTIONS[3]?.label ?? "Engine Diagnostic",
      status: "pending",
      approved_at: null,
      created_at: now,
    },
  ]
}
