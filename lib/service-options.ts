/**
 * Predefined service options available for booking.
 * Requirements: 4.1
 */

export interface ServiceOption {
  id: string;
  label: string;
  translationKey: string;
}

export const SERVICE_OPTIONS: ServiceOption[] = [
  { id: "oil-change", label: "Oil Change", translationKey: "services.oilChange" },
  { id: "battery", label: "Battery", translationKey: "services.battery" },
  { id: "brakes", label: "Brakes", translationKey: "services.brakes" },
  { id: "engine-diagnostic", label: "Engine Diagnostic", translationKey: "services.diagnostic" },
  { id: "maintenance", label: "Maintenance", translationKey: "services.maintenance" },
  { id: "ac", label: "A/C", translationKey: "services.ac" },
  { id: "electrical", label: "Electrical", translationKey: "services.electrical" },
  { id: "tire-service", label: "Tire Service", translationKey: "services.tires" },
  { id: "general-inspection", label: "General Inspection", translationKey: "services.inspection" },
];

/** Array of service label strings for use in comma-separated storage. */
export const SERVICE_LABELS: string[] = SERVICE_OPTIONS.map((s) => s.label);

export function findServiceOption(label: string): ServiceOption | undefined {
  return SERVICE_OPTIONS.find((service) => service.label === label.trim());
}
