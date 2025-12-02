import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  CalendarCheck2,
  Users,
  ClipboardList,
  Wallet,
  Sparkles,
  PartyPopper
} from "lucide-react"
import { ComingSoonWaitlist } from "../components/ComingSoonWaitlist"

const highlights = [
  {
    icon: CalendarCheck2,
    title: "Timeline Intelligence",
    description: "Generate perfect party timelines with reminders that keep every milestone on track."
  },
  {
    icon: Users,
    title: "Guest List Harmony",
    description: "Smart RSVPs, dietary preferences, and plus-one management all in one view."
  },
  {
    icon: ClipboardList,
    title: "Task Checklist Automation",
    description: "Pre-built checklists with AI suggestions tailored to your celebration style."
  }
]

const previews = [
  "Budget dashboards that track actual vs. planned spend",
  "AI party themes with décor, menu, and playlist recommendations",
  "Collaborative planning with family and co-hosts",
  "Vendor tracking and reminder emails",
  "Personalized milestones for kids, milestone birthdays, and corporate events"
]

export default function PartyPlannerComingSoonPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 py-16 px-4">
      <div className="mx-auto flex max-w-5xl flex-col gap-16">
        <section className="relative overflow-hidden rounded-3xl bg-white/90 p-10 shadow-xl backdrop-blur">

          <div className="relative space-y-8 text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 px-5 py-2 text-sm font-semibold text-white shadow-lg">
              <Sparkles className="h-4 w-4" />
              Party Planner Beta Invitations Open Soon
            </div>

            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
              Party Planner Coming Soon!
            </h1>

            <p className="mx-auto max-w-2xl text-lg text-gray-600">
              We&rsquo;re building the smartest way to plan unforgettable birthday celebrations&mdash;from guest
              lists to budgets to AI-powered theme ideas. Join the waitlist to be first in line.
            </p>

            <ComingSoonWaitlist
              productName="Party Planner"
              buttonLabel="Notify Me When Live"
              placeholder="Enter your email to join the waitlist"
              className="mx-auto max-w-2xl"
            />

            <p className="text-sm text-gray-500">
              We&rsquo;ll only email you about early access and launch updates. No spam, ever.
            </p>

            <div className="flex justify-center">
              <Link href="/generator">
                <Button variant="outline" className="text-purple-600">
                  Back to Card Maker
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <section className="space-y-8">
          <div className="flex items-center gap-3">
            <PartyPopper className="h-6 w-6 text-purple-600" />
            <h2 className="text-2xl font-semibold text-gray-900">
              Built to handle every detail of your celebration
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {highlights.map((item) => (
              <Card key={item.title} className="border-none bg-white/80 shadow-lg backdrop-blur">
                <CardHeader className="space-y-3">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow">
                    <item.icon className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-xl text-gray-900">{item.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-gray-600">{item.description}</CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-purple-100 bg-white/90 p-10 shadow-lg backdrop-blur">
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div className="space-y-3 md:max-w-sm">
              <div className="inline-flex items-center gap-2 rounded-full bg-purple-100 px-3 py-1 text-sm font-medium text-purple-600">
                <Wallet className="h-4 w-4" />
                Sneak Peek
              </div>
              <h3 className="text-2xl font-semibold text-gray-900">
                Everything you need to host with confidence
              </h3>
              <p className="text-gray-600">
                Join the beta to shape the tools that will power BirthdayGen.com parties around the world.
              </p>
            </div>
            <ul className="space-y-3 text-sm text-gray-600 md:max-w-xl">
              {previews.map((preview) => (
                <li key={preview} className="flex items-start gap-2">
                  <span className="mt-1 h-2 w-2 rounded-full bg-gradient-to-r from-pink-500 to-purple-600" />
                  <span>{preview}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>
    </div>
  )
}
