/**
 * Shared TypeScript types and interfaces for the Mobile Mechanic Booking Platform.
 *
 * Naming conventions:
 *  - snake_case fields: DB-facing (match column names in Supabase)
 *  - camelCase fields: UI-facing / client-side state
 */

// ---------------------------------------------------------------------------
// Booking wizard — UI-facing types
// ---------------------------------------------------------------------------

/** Steps in the 8-step booking wizard (0-indexed). */
export type BookingStep = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;

/** Vehicle information collected in Step 1. */
export interface VehicleInfo {
  year: string;
  make: string;
  model: string;
  engineType: string;
  vinUsed: boolean;
}

/** Address information collected in Step 3. */
export interface AddressInfo {
  street: string;
  zipCode: string;
  city: string;
  state: string;
}

/** Personal contact information collected in Step 5. */
export interface PersonalInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  referralSource: string;
}

/** Geographic coordinates returned by the geocoding API. */
export interface LatLng {
  lat: number;
  lng: number;
}

/** Full wizard state held by BookingFlow. */
export interface BookingState {
  step: BookingStep;
  zipCode: string;
  vehicle: VehicleInfo;
  services: string[];
  address: AddressInfo;
  coordinates: LatLng | null;
  additionalInfo: string;
  personal: PersonalInfo;
  appointmentDate: string;   // ISO date YYYY-MM-DD
  appointmentTime: string;   // "08:00" | "10:00" | "12:00" | "14:00" | "16:00"
}

// ---------------------------------------------------------------------------
// Appointment — DB-facing type
// ---------------------------------------------------------------------------

/** Valid appointment statuses (mirrors DB CHECK constraint). */
export type AppointmentStatus = 'pending' | 'postponed' | 'completed' | 'cancelled';

/**
 * Appointment record as stored in the `appointments` table.
 * Fields use snake_case to match DB column names.
 */
export interface Appointment {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  zip_code: string;
  address: string;
  additional_info: string | null;
  appointment_date: string;       // ISO date YYYY-MM-DD
  appointment_time: string;       // "08:00" | "10:00" | "12:00" | "14:00" | "16:00"
  status: AppointmentStatus;
  vehicle_year: string;
  vehicle_make: string;
  vehicle_model: string;
  engine_type: string;
  service_type: string;           // comma-separated service names
  referral_source: string | null;
  assigned_mechanic: string | null;
  created_at: string;             // ISO timestamp
  updated_at: string;             // ISO timestamp
}

// ---------------------------------------------------------------------------
// Technician — DB-facing type
// ---------------------------------------------------------------------------

/**
 * Technician record as stored in the `technicians` table.
 * Fields use snake_case to match DB column names.
 */
export interface Technician {
  id: string;
  name: string;
  area: string | null;
  phone: string;
  join_date: string | null;       // ISO date YYYY-MM-DD
  availability: string | null;
  specialties: string[];
  created_at: string;             // ISO timestamp
}

/** Input shape for creating a new technician (omits auto-generated fields). */
export interface CreateTechnicianInput {
  name: string;
  area?: string;
  phone: string;
  join_date?: string;
  availability?: string;
  specialties?: string[];
}

// ---------------------------------------------------------------------------
// Review — DB-facing type
// ---------------------------------------------------------------------------

/** Valid review moderation statuses (mirrors DB CHECK constraint). */
export type ReviewStatus = 'pending' | 'approved' | 'rejected';

/**
 * Review record as stored in the `reviews` table.
 * Fields use snake_case to match DB column names.
 */
export interface Review {
  id: string;
  reviewer_name: string;
  reviewer_email: string;
  rating: number;                 // integer 1–5
  comment: string;
  service_type: string | null;
  status: ReviewStatus;
  approved_at: string | null;     // ISO timestamp
  created_at: string;             // ISO timestamp
}

// ---------------------------------------------------------------------------
// Admin Dashboard — UI-facing types
// ---------------------------------------------------------------------------

/** Computed metrics displayed in the dashboard metrics bar. */
export interface DashboardMetrics {
  total: number;
  pending: number;
  completed: number;
  upcoming: number;
}

/** Props passed from the RSC dashboard page to AdminDashboardContent. */
export interface DashboardProps {
  appointments: Appointment[];
  technicians: Technician[];
  zipCodes: string[];
  pendingReviews: Review[];
  metrics: DashboardMetrics;
}

// ---------------------------------------------------------------------------
// Server utilities — return types
// ---------------------------------------------------------------------------

/**
 * Result returned by lib/twilio.ts sendSms().
 * Discriminated union covering all three outcomes.
 */
export type SmsResult =
  | { sent: true }
  | { sent: false; skipped: true }
  | { sent: false; error: string };

/**
 * Generic result type returned by all admin Server Actions.
 * On success, may optionally carry an smsWarning flag.
 */
export type ActionResult =
  | { success: true; smsWarning?: true }
  | { success: false; error: string; details?: string };
