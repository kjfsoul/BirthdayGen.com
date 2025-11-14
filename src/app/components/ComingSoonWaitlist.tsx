'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CheckCircle2, Loader2, AlertCircle } from "lucide-react"

type Status = "idle" | "loading" | "success" | "error"

interface ComingSoonWaitlistProps {
  productName: string
  buttonLabel?: string
  placeholder?: string
  className?: string
}

export function ComingSoonWaitlist({
  productName,
  buttonLabel = "Notify Me",
  placeholder = "Enter your email",
  className = ""
}: ComingSoonWaitlistProps) {
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState<Status>("idle")
  const [message, setMessage] = useState("")

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!email) return

    setStatus("loading")
    setMessage("")

    try {
      const response = await fetch("/api/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email })
      })

      const data = await response.json()

      if (response.ok) {
        setStatus("success")
        setMessage(`Thanks! We'll email you as soon as the ${productName} launches.`)
        setEmail("")
      } else {
        setStatus("error")
        setMessage(data.error || "Something went wrong. Please try again.")
      }
    } catch {
      setStatus("error")
      setMessage("Network error. Please check your connection and try again.")
    }
  }

  return (
    <form onSubmit={handleSubmit} className={`w-full ${className}`}>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder={placeholder}
          disabled={status === "loading"}
          required
          className="flex-1 bg-white/90"
        />
        <Button
          type="submit"
          disabled={status === "loading"}
          className="bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:from-pink-600 hover:to-purple-700"
        >
          {status === "loading" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            buttonLabel
          )}
        </Button>
      </div>

      {status === "success" && (
        <p className="mt-3 flex items-center gap-2 text-sm font-medium text-green-600">
          <CheckCircle2 className="h-4 w-4" />
          {message}
        </p>
      )}

      {status === "error" && (
        <p className="mt-3 flex items-center gap-2 text-sm font-medium text-red-600">
          <AlertCircle className="h-4 w-4" />
          {message}
        </p>
      )}
    </form>
  )
}
