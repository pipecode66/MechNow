import { Header } from "@/components/header"
import { BookingFlow } from "@/components/booking/booking-flow"

export default function BookingPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
        <BookingFlow />
      </main>
    </div>
  )
}
