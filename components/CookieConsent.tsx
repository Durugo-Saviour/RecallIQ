"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Cookie, X } from "lucide-react"

export function CookieConsent() {
  const [showConsent, setShowConsent] = useState(false)

  useEffect(() => {
    // Check local storage to see if consent has already been given
    const consent = localStorage.getItem("cookieConsent")
    if (!consent) {
      setShowConsent(true)
    }
  }, [])

  const acceptCookies = () => {
    localStorage.setItem("cookieConsent", "accepted")
    setShowConsent(false)
  }

  const rejectCookies = () => {
    localStorage.setItem("cookieConsent", "rejected")
    setShowConsent(false)
  }

  const dismissCookies = () => {
    setShowConsent(false)
  }

  if (!showConsent) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-in slide-in-from-bottom-10 fade-in duration-500">
      <div className="max-w-4xl mx-auto bg-card border shadow-2xl rounded-xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 relative">
        <button 
          onClick={dismissCookies}
          className="absolute top-2 right-2 p-1 rounded-md text-muted-foreground hover:bg-muted transition-colors"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>
        <div className="flex items-start gap-4 pr-6">
          <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
            <Cookie className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-1">We value your privacy</h3>
            <p className="text-sm text-muted-foreground">
              We use strictly necessary cookies to keep you logged in, and functional cookies to save your preferences. We do NOT use tracking or advertising cookies. Read our <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link> for more.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto flex-shrink-0">
          <Button variant="outline" className="w-full md:w-auto" onClick={rejectCookies}>
            Reject Non-Essential
          </Button>
          <Button className="w-full md:w-auto" onClick={acceptCookies}>
            Accept All
          </Button>
        </div>
      </div>
    </div>
  )
}
