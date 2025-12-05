"use client";
import React, { useState, Suspense } from 'react'
import { Link } from 'react-router-dom'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import {
  Sparkles,
  Heart,
  Gift,
  Wand2,
  Users,
  ArrowRight,
  Star,
  Calendar,
  Search,
  Link as LinkIcon
} from "lucide-react"
import { NewsletterSignup } from './components/NewsletterSignup'
import { trackEvent } from '@/lib/analytics'

// Lazy load components
const HolidayScene = React.lazy(() => import("../components/holiday/HolidayScene").then(mod => ({ default: mod.HolidayScene })));
const AddContactsCTA = React.lazy(() => import("../components/contacts/AddContactsCTA"));

export default function Home() {
  const [isCTADialogOpen, setIsCTADialogOpen] = useState(false)

  const tools = [
    {
      icon: Wand2,
      title: "Make a Card",
      description: "Create personalized animated cards in minutes with AI assistance.",
      href: "/generator",
      color: "from-pink-500 to-purple-600"
    },
    {
      icon: Calendar,
      title: "Plan a Party",
      description: "Organize unforgettable celebrations with smart planning tools.",
      href: "/party-planner",
      color: "from-purple-500 to-blue-600"
    },
    {
      icon: Gift,
      title: "Find a Gift",
      description: "Discover perfect gifts with AI-powered recommendations.",
      href: "/gifts",
      color: "from-green-500 to-teal-600"
    }
  ]

  const stats = [
    { label: "Cards Created Today", value: "1,000+", icon: Heart },
    { label: "Parties Planned", value: "50K+", icon: Calendar },
    { label: "Perfect Gifts Found", value: "25K+", icon: Gift },
    { label: "Happy Birthdays", value: "100K+", icon: Star }
  ]

  const handleCTAClick = () => {
    trackEvent({ event: 'contacts_cta_opened' })
    setIsCTADialogOpen(true)
  }

  const handleProviderImport = (provider: string) => {
    if (provider === 'google') {
      trackEvent({ event: 'google_import_started' })
      window.location.href = '/api/import/google/start'
    } else if (provider === 'outlook') {
      trackEvent({ event: 'outlook_import_started' })
      window.location.href = '/api/import/microsoft/start'
    }
  }

  return (
    <div className="min-h-screen relative">
      <Suspense fallback={null}>
        <HolidayScene className="pointer-events-none opacity-60" />
      </Suspense>
      {/* Hero Section */}
      <section className="relative bg-transparent pt-20 pb-16 px-4 overflow-hidden">

        <div className="max-w-7xl mx-auto text-center relative">
          <Badge className="bg-gradient-to-r from-pink-500 to-purple-600 text-white mb-6 text-lg px-4 py-2">
            <Sparkles className="h-5 w-5 mr-2" />
            Holiday Season Special
          </Badge>

          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6">
            Plan Unforgettable
            <span className="bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent block">
              Holiday Birthdays
            </span>
          </h1>

          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Cards, parties, and gift ideas tailored to the people you love—fast, easy, and magical.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button size="lg" className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white text-lg px-8 py-4" asChild>
              <Link to="/auth">
                <Wand2 className="h-5 w-5 mr-2" />
                Sign up free
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-4 border-purple-300 text-purple-600 hover:bg-purple-50" asChild>
              <Link to="/blog?tag=holiday">
                <Search className="h-5 w-5 mr-2" />
                Explore ideas
              </Link>
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="flex justify-center mb-2">
                  <stat.icon className="h-6 w-6 text-purple-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Suspense fallback={null}>
        <AddContactsCTA />
      </Suspense>

      {/* Add Contacts CTA */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Never Miss Another Birthday
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Import your contacts and let us handle the rest. We&apos;ll remind you of upcoming birthdays and help you send the perfect cards and gifts.
          </p>
          <Dialog open={isCTADialogOpen} onOpenChange={setIsCTADialogOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-lg px-8 py-4" onClick={handleCTAClick}>
                <Users className="h-5 w-5 mr-2" />
                Add Contacts
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-center">Import Your Contacts</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4 mt-6">
                {/* Apple */}
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="h-24 flex flex-col items-center justify-center space-y-2">
                      <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                        <span className="text-lg font-bold text-gray-600"></span>
                      </div>
                      <span className="text-sm">Apple</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Import from Apple</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Upload VCF File</label>
                        <Input type="file" accept=".vcf" />
                      </div>
                      <div className="text-center">
                        <Link to="/help/carddav" className="text-purple-600 hover:underline">
                          Use CardDAV (advanced)
                        </Link>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                {/* Google */}
                <Button
                  variant="outline"
                  className="h-24 flex flex-col items-center justify-center space-y-2"
                  onClick={() => handleProviderImport('google')}
                >
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-lg font-bold text-blue-600">G</span>
                  </div>
                  <span className="text-sm">Google</span>
                </Button>

                {/* Outlook */}
                <Button
                  variant="outline"
                  className="h-24 flex flex-col items-center justify-center space-y-2"
                  onClick={() => handleProviderImport('outlook')}
                >
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                    <span className="text-sm font-bold text-white">Outlook</span>
                  </div>
                  <span className="text-sm">Outlook</span>
                </Button>

                {/* Social */}
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="h-24 flex flex-col items-center justify-center space-y-2">
                      <LinkIcon className="h-6 w-6" />
                      <span className="text-sm">Social</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Import from Social Networks</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Upload LinkedIn CSV</label>
                        <Input type="file" accept=".csv" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Or paste profile URLs</label>
                        <Textarea placeholder="https://linkedin.com/in/username&#10;https://linkedin.com/in/anotheruser" />
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </section>

      {/* Tools Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything You Need for Perfect Celebrations
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              From stunning cards to party planning, we&apos;ve got every celebration covered.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {tools.map((tool) => (
              <Link key={tool.href} to={tool.href}>
                <Card className="h-full hover:shadow-xl transition-all duration-300 cursor-pointer group border-0 shadow-lg">
                  <CardHeader>
                    <div className={`w-16 h-16 rounded-xl bg-gradient-to-r ${tool.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <tool.icon className="h-8 w-8 text-white" />
                    </div>
                    <CardTitle className="text-xl mb-2 text-gray-900 group-hover:text-purple-600 transition-colors">{tool.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">{tool.description}</p>
                    <div className="flex items-center text-purple-600 font-medium">
                      <span>Get Started</span>
                      <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Blog Spotlight */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Latest from Our Blog
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Tips, ideas, and inspiration for making every celebration special.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Placeholder blog posts - in real app, fetch from API */}
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <Badge className="mb-3">Holiday Tips</Badge>
                <h3 className="text-xl font-semibold mb-2">10 Holiday Birthday Ideas</h3>
                <p className="text-gray-600 mb-4">Make this holiday season unforgettable with these creative birthday celebration ideas.</p>
                <Link to="/blog/holiday-birthday-ideas" className="text-purple-600 font-medium hover:underline">
                  Read more →
                </Link>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <Badge className="mb-3">Party Planning</Badge>
                <h3 className="text-xl font-semibold mb-2">Winter Wonderland Parties</h3>
                <p className="text-gray-600 mb-4">Transform your home into a magical winter wonderland for the perfect birthday party.</p>
                <Link to="/blog/winter-wonderland-parties" className="text-purple-600 font-medium hover:underline">
                  Read more →
                </Link>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <Badge className="mb-3">Gift Ideas</Badge>
                <h3 className="text-xl font-semibold mb-2">Thoughtful Holiday Gifts</h3>
                <p className="text-gray-600 mb-4">Discover meaningful gifts that show you care this holiday season.</p>
                <Link to="/blog/thoughtful-holiday-gifts" className="text-purple-600 font-medium hover:underline">
                  Read more →
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Newsletter Signup */}
      <NewsletterSignup />
    </div>
  )
}
