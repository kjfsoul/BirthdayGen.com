import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Gift,
  Sparkles,
  ShoppingBag,
  Compass,
  Gem,
  HandHeart,
  Rocket
} from "lucide-react"
import { ComingSoonWaitlist } from "../components/ComingSoonWaitlist"

const advantages = [
  {
    icon: Sparkles,
    title: "AI-Personalized Gift Ideas",
    description:
      "Tell us about the person and we’ll deliver curated recommendations matched to their aura, interests, and budget."
  },
  {
    icon: Compass,
    title: "Guided Gift Journeys",
    description:
      "Browse by vibe, milestone, or relationship and discover ideas you would never find scrolling generic lists."
  },
  {
    icon: ShoppingBag,
    title: "Affiliate-Friendly Shortlists",
    description:
      "One-click save to wishlist, price tracking, and compliant affiliate links for teams and corporate gifting."
  }
]

const categories = [
  { name: "Radiant & Glam", icon: Gem },
  { name: "Adventurous Spirits", icon: Rocket },
  { name: "Heartfelt Keepsakes", icon: HandHeart },
  { name: "Wellness & Self-Care", icon: Gift },
  { name: "Creative Makers", icon: Sparkles },
  { name: "Tech & Gadgets", icon: ShoppingBag }
]

export default function GiftGuideComingSoonPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-teal-50 to-emerald-50 py-16 px-4">
      <div className="mx-auto flex max-w-5xl flex-col gap-16">
        <section className="relative overflow-hidden rounded-3xl bg-white/90 p-10 shadow-xl backdrop-blur">
          <div className="absolute inset-0 bg-[url('/hero-pattern.svg')] opacity-5" />
          <div className="relative space-y-8 text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-green-500 to-teal-600 px-5 py-2 text-sm font-semibold text-white shadow-lg">
              <Gift className="h-4 w-4" />
              Gift Guide Waitlist Now Open
            </div>

            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
              Gift Guide Launching Soon
            </h1>

            <p className="mx-auto max-w-2xl text-lg text-gray-600">
              Discover perfect presents with real-time AI guidance, curated catalogs, and shareable wishlists. Be the
              first to access the tools the BirthdayGen.com team uses for unforgettable gifts.
            </p>

            <ComingSoonWaitlist
              productName="Gift Guide"
              buttonLabel="Join the Waitlist"
              placeholder="Enter your email to get early access"
              className="mx-auto max-w-2xl"
            />

            <p className="text-sm text-gray-500">
              Early invitees will receive exclusive launch perks and curated holiday gift playbooks.
            </p>

            <div className="flex justify-center">
              <Link href="/generator">
                <Button variant="outline" className="text-emerald-600">
                  Back to Card Maker
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <section className="space-y-8">
          <div className="flex items-center gap-3">
            <Sparkles className="h-6 w-6 text-emerald-600" />
            <h2 className="text-2xl font-semibold text-gray-900">
              Personalized gifting intelligence for every relationship
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {advantages.map((item) => (
              <Card key={item.title} className="border-none bg-white/85 shadow-lg backdrop-blur">
                <CardHeader className="space-y-3">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-green-500 to-teal-600 text-white shadow">
                    <item.icon className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-xl text-gray-900">{item.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-gray-600">{item.description}</CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-emerald-100 bg-white/90 p-10 shadow-lg backdrop-blur">
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div className="space-y-3 md:max-w-sm">
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-600">
                <Gem className="h-4 w-4" />
                Curated Collections
              </div>
              <h3 className="text-2xl font-semibold text-gray-900">
                Preview the categories we&rsquo;re crafting right now
              </h3>
              <p className="text-gray-600">
                From milestone birthdays to meaningful thank-yous, every collection is researched, tested, and
                continuously updated.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {categories.map((category) => (
                <Card
                  key={category.name}
                  className="border border-emerald-100 bg-white/95 shadow-md transition hover:-translate-y-1 hover:shadow-lg"
                >
                  <CardContent className="flex items-center gap-3 py-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                      <category.icon className="h-5 w-5" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">{category.name}</span>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
