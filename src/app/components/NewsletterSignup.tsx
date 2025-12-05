'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Heart, CheckCircle, Loader2 } from "lucide-react"

export function NewsletterSignup() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')

    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })

      const data = await response.json()

      if (response.ok) {
        setStatus('success')
        setMessage('Thanks for subscribing! Check your email for confirmation.')
        setEmail('')
      } else {
        setStatus('error')
        setMessage(data.error || 'Something went wrong. Please try again.')
      }
    } catch {
      setStatus('error')
      setMessage('Network error. Please try again.')
    }
  }

  return (
    <section className="py-20 px-4 bg-gradient-to-r from-pink-500 to-purple-600">
      <div className="max-w-4xl mx-auto text-center">
        <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
          <CardContent className="p-12">
            <div className="flex justify-center mb-6">
              <Heart className="h-12 w-12 text-pink-500" />
            </div>

            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Never Miss a Birthday Again!
            </h2>

            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Join 100,000+ birthday enthusiasts who get weekly tips, party ideas, and gift inspiration.
              Unsubscribe anytime.
            </p>

            <form onSubmit={handleSubmit} className="max-w-md mx-auto">
              <div className="flex gap-3 mb-4">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="flex-1"
                  disabled={status === 'loading'}
                />
                <Button
                  type="submit"
                  disabled={status === 'loading'}
                  className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
                >
                  {status === 'loading' ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'Subscribe'
                  )}
                </Button>
              </div>

              {status === 'success' && (
                <div className="flex items-center justify-center gap-2 text-green-600 mb-4">
                  <CheckCircle className="h-5 w-5" />
                  <span className="text-sm font-medium">{message}</span>
                </div>
              )}

              {status === 'error' && (
                <div className="text-red-600 text-sm mb-4">
                  {message}
                </div>
              )}

              <p className="text-xs text-gray-500">
                By subscribing, you agree to receive birthday tips and special offers.
                We respect your privacy and never share your information.
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
