"use client"

import * as React from "react"
import { ZipCodeStep } from "@/components/booking/zip-code-step"
import { VehicleInfoStep } from "@/components/booking/vehicle-info-step"
import { ServiceSelectionStep } from "@/components/booking/service-selection-step"
import { AddressStep } from "@/components/booking/address-step"
import { MapConfirmationStep } from "@/components/booking/map-confirmation-step"
import { PersonalDetailsStep } from "@/components/booking/personal-details-step"
import { DateSelectionStep } from "@/components/booking/date-selection-step"
import { SuccessStep, type BookingSuccess } from "@/components/booking/success-step"
import { useI18n } from "@/lib/i18n"
import type { BookingState, BookingStep } from "@/types"

const TOTAL_STEPS = 8

const initialState: BookingState = {
  step: 0,
  zipCode: "",
  vehicle: {
    year: "",
    make: "",
    model: "",
    engineType: "",
    vinUsed: false,
  },
  services: [],
  address: {
    street: "",
    zipCode: "",
    city: "",
    state: "CA",
  },
  coordinates: null,
  additionalInfo: "",
  personal: {
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    referralSource: "",
  },
  appointmentDate: "",
  appointmentTime: "",
}

function nextStep(step: BookingStep): BookingStep {
  return Math.min(step + 1, TOTAL_STEPS - 1) as BookingStep
}

function previousStep(step: BookingStep): BookingStep {
  return Math.max(step - 1, 0) as BookingStep
}

export function BookingFlow() {
  const { t } = useI18n()
  const [state, setState] = React.useState<BookingState>(initialState)
  const [success, setSuccess] = React.useState<BookingSuccess | null>(null)

  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }, [state.step])

  function updateState(patch: Partial<BookingState>) {
    setState((current) => ({ ...current, ...patch }))
  }

  function goNext() {
    setState((current) => ({ ...current, step: nextStep(current.step) }))
  }

  function goBack() {
    setState((current) => ({ ...current, step: previousStep(current.step) }))
  }

  function completeBooking(result: BookingSuccess) {
    setSuccess(result)
    setState((current) => ({ ...current, step: 7 }))
  }

  return (
    <section className="grid gap-5">
      <div className="grid gap-2">
        <p className="text-sm font-medium text-primary">
          {t("booking.step", { step: state.step + 1, total: TOTAL_STEPS })}
        </p>
        <div className="h-2 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${((state.step + 1) / TOTAL_STEPS) * 100}%` }}
          />
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-4 shadow-sm sm:p-6">
        {state.step === 0 && (
          <ZipCodeStep
            zipCode={state.zipCode}
            onZipCodeChange={(zipCode) =>
              updateState({
                zipCode,
                address: { ...state.address, zipCode },
              })
            }
            onNext={goNext}
          />
        )}
        {state.step === 1 && (
          <VehicleInfoStep
            vehicle={state.vehicle}
            onChange={(vehicle) => updateState({ vehicle })}
            onBack={goBack}
            onNext={goNext}
          />
        )}
        {state.step === 2 && (
          <ServiceSelectionStep
            services={state.services}
            onChange={(services) => updateState({ services })}
            onBack={goBack}
            onNext={goNext}
          />
        )}
        {state.step === 3 && (
          <AddressStep
            address={state.address}
            onAddressChange={(address) => updateState({ address })}
            onCoordinatesChange={(coordinates) => updateState({ coordinates })}
            onBack={goBack}
            onNext={goNext}
          />
        )}
        {state.step === 4 && (
          <MapConfirmationStep
            address={state.address}
            coordinates={state.coordinates}
            additionalInfo={state.additionalInfo}
            onAdditionalInfoChange={(additionalInfo) => updateState({ additionalInfo })}
            onBack={goBack}
            onNext={goNext}
          />
        )}
        {state.step === 5 && (
          <PersonalDetailsStep
            personal={state.personal}
            onChange={(personal) => updateState({ personal })}
            onBack={goBack}
            onNext={goNext}
          />
        )}
        {state.step === 6 && (
          <DateSelectionStep
            state={state}
            onChange={(patch) => updateState(patch)}
            onBack={goBack}
            onSuccess={completeBooking}
          />
        )}
        {state.step === 7 && (
          <SuccessStep state={state} result={success} />
        )}
      </div>
    </section>
  )
}
