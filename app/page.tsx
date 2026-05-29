import { HomePageContent } from "@/components/home-page-content"
import { getApprovedReviews } from "@/lib/reviews"

export default async function Home() {
  const reviews = await getApprovedReviews()

  return <HomePageContent reviews={reviews} />
}
