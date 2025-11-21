import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 text-center">
      <div className="space-y-6 max-w-md">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-purple-600">
            Birthday Blog
          </h1>
          <p className="text-xl text-muted-foreground">
            Stories, tips, and inspiration for the perfect celebration.
          </p>
        </div>

        <div className="p-6 border rounded-lg bg-card shadow-sm">
          <p className="text-card-foreground mb-4">
            Our writers are crafting amazing content for you. Check back soon!
          </p>
          <div className="flex justify-center">
            <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center animate-pulse">
              <span className="text-2xl">✍️</span>
            </div>
          </div>
        </div>

        <Button variant="ghost" className="mt-8" asChild>
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
        </Button>
      </div>
    </div>
  )
}
