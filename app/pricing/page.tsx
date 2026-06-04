"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, X, Loader2, ShieldCheck } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function PricingPage() {
  const supabase = createClient()
  const router = useRouter()
  
  const [user, setUser] = useState<any>(null)
  const [loadingUser, setLoadingUser] = useState(true)
  const [isPro, setIsPro] = useState(false)
  const [showPaystackModal, setShowPaystackModal] = useState(false)
  const [paymentStage, setPaymentStage] = useState<"input" | "processing" | "success">("input")
  
  // Paystack mock form inputs
  const [cardNumber, setCardNumber] = useState("4081 2234 5678 9012")
  const [cardExpiry, setCardExpiry] = useState("12/28")
  const [cardCvv, setCardCvv] = useState("123")

  useEffect(() => {
    async function checkUser() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUser(user)
        setIsPro(user.user_metadata?.is_pro === true)
      }
      setLoadingUser(false)
    }
    checkUser()
  }, [])

  const handleUpgradeClick = () => {
    if (!user) {
      router.push("/auth/signup")
      return
    }
    setShowPaystackModal(true)
    setPaymentStage("input")
  }

  const handleSimulatePayment = async (e: React.FormEvent) => {
    e.preventDefault()
    setPaymentStage("processing")

    // Mock processing delays (Paystack mock flow)
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Simulate updating Supabase user metadata
    try {
      const { error } = await supabase.auth.updateUser({
        data: { is_pro: true }
      })

      if (error) throw error

      setPaymentStage("success")
      setIsPro(true)

      // Auto close success screen and reload page to refresh navbar/dashboard state
      setTimeout(() => {
        setShowPaystackModal(false)
        window.location.reload()
      }, 1500)

    } catch (err) {
      console.error(err)
      alert("Upgrade failed. Please try again.")
      setPaymentStage("input")
    }
  }

  // Downgrade to free plan
  const handleDowngrade = async () => {
    if (!user) {
      router.push("/auth/signup")
      return
    }
    const { error } = await supabase.auth.updateUser({
      data: { is_pro: false }
    })
    if (error) {
      console.error(error)
      alert("Downgrade failed. Please try again.")
      return
    }
    setIsPro(false)
    // Refresh to reflect changes UI
    router.refresh()
  }

  return (
    <div className="container py-20 max-w-5xl mx-auto space-y-12">
      <div className="text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Simple, transparent pricing</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Start for free to test the active recall method. Upgrade when you're ready to master all your courses.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto pt-8">
        {/* Free Plan */}
        <Card className="flex flex-col relative border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle className="text-2xl">Basic</CardTitle>
            <CardDescription>Perfect for testing out the AI</CardDescription>
            <div className="mt-4 flex items-baseline text-5xl font-extrabold">
              ₦0
              <span className="ml-1 text-xl font-medium text-muted-foreground">/mo</span>
            </div>
          </CardHeader>
          <CardContent className="flex-1">
            <ul className="space-y-4 text-sm">
              <li className="flex items-center">
                <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                <span>Up to 2 active courses</span>
              </li>
              <li className="flex items-center">
                <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                <span>5 AI quizzes per week</span>
              </li>
              <li className="flex items-center">
                <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                <span>Standard mastery tracking</span>
              </li>
              <li className="flex items-center text-muted-foreground opacity-50">
                <X className="h-5 w-5 mr-3 flex-shrink-0" />
                <span>Line-by-line detailed feedback</span>
              </li>
              <li className="flex items-center text-muted-foreground opacity-50">
                <X className="h-5 w-5 mr-3 flex-shrink-0" />
                <span>Priority email support</span>
              </li>
            </ul>
          </CardContent>
        <CardFooter>
          {isPro ? (
            <Button variant="destructive" className="w-full h-12 text-base" onClick={handleDowngrade}>
              Downgrade to Free
            </Button>
          ) : user ? (
            <Button variant="outline" className="w-full h-12 text-base" disabled>
              Active Plan
            </Button>
          ) : (
            <Link href="/auth/signup" className="w-full">
              <Button variant="outline" className="w-full h-12 text-base">Get Started</Button>
            </Link>
          )}
        </CardFooter>
        </Card>

        {/* Pro Plan */}
        <Card className={`flex flex-col relative shadow-xl scale-105 z-10 ${isPro ? "border-amber-500" : "border-primary"}`}>
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4">
            <span className={`text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm ${isPro ? "bg-amber-500" : "bg-primary"}`}>
              {isPro ? "Your Current Plan" : "Most Popular"}
            </span>
          </div>
          <CardHeader>
            <CardTitle className={`text-2xl ${isPro ? "text-amber-500" : "text-primary"}`}>Pro</CardTitle>
            <CardDescription>For serious students aiming for A's</CardDescription>
            <div className="mt-4 flex items-baseline text-5xl font-extrabold">
              ₦900
              <span className="ml-1 text-xl font-medium text-muted-foreground">/mo</span>
            </div>
          </CardHeader>
          <CardContent className="flex-1">
            <ul className="space-y-4 text-sm">
              <li className="flex items-center">
                <Check className={`h-5 w-5 mr-3 flex-shrink-0 ${isPro ? "text-amber-500" : "text-primary"}`} />
                <span className="font-medium">Unlimited active courses</span>
              </li>
              <li className="flex items-center">
                <Check className={`h-5 w-5 mr-3 flex-shrink-0 ${isPro ? "text-amber-500" : "text-primary"}`} />
                <span className="font-medium">Unlimited AI quizzes</span>
              </li>
              <li className="flex items-center">
                <Check className={`h-5 w-5 mr-3 flex-shrink-0 ${isPro ? "text-amber-500" : "text-primary"}`} />
                <span className="font-medium">Advanced mastery analytics</span>
              </li>
              <li className="flex items-center">
                <Check className={`h-5 w-5 mr-3 flex-shrink-0 ${isPro ? "text-amber-500" : "text-primary"}`} />
                <span className="font-medium">Detailed AI feedback & corrections</span>
              </li>
              <li className="flex items-center">
                <Check className={`h-5 w-5 mr-3 flex-shrink-0 ${isPro ? "text-amber-500" : "text-primary"}`} />
                <span className="font-medium">Priority email support</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            {loadingUser ? (
              <Button className="w-full h-12 text-base" disabled>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Loading
              </Button>
            ) : isPro ? (
              <Button className="w-full h-12 text-base bg-amber-500 hover:bg-amber-600 text-white shadow-md cursor-default" disabled>
                Current Active Plan
              </Button>
            ) : (
              <Button 
                onClick={handleUpgradeClick}
                className="w-full h-12 text-base shadow-md hover:scale-[1.02] transition-transform bg-primary hover:bg-primary/90 text-primary-foreground font-bold"
              >
                Upgrade to Pro
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
      
      <div className="text-center pt-8 text-sm text-muted-foreground">
        <p>Questions about our pricing? <a href="mailto:support@recalliq.com" className="text-primary hover:underline">Contact us</a>.</p>
      </div>

      {/* Paystack Payment Simulator Modal */}
      {showPaystackModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-[#18181b] border border-border/30 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative text-foreground mx-4">
            
            {/* Header: Paystack mock branding */}
            <div className="bg-[#09090b] px-6 py-4 flex items-center justify-between border-b border-border/20">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#3bb75e] animate-pulse" />
                <span className="text-[#3bb75e] font-extrabold tracking-wider text-xs uppercase">Paystack Simulator</span>
              </div>
              <button 
                onClick={() => setShowPaystackModal(false)}
                className="text-muted-foreground hover:text-foreground text-sm"
                disabled={paymentStage === "processing"}
              >
                Cancel
              </button>
            </div>

            {paymentStage === "input" && (
              <form onSubmit={handleSimulatePayment} className="p-6 space-y-6">
                <div className="text-center space-y-2">
                  <div className="text-sm text-muted-foreground">Paying to <strong className="text-foreground">RecallIQ</strong></div>
                  <div className="text-3xl font-extrabold text-foreground">₦900.00</div>
                  <div className="text-xs text-[#3bb75e] bg-[#3bb75e]/10 py-1 px-3 rounded-full inline-block font-medium">
                    Test Mode (Simulated Payment)
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground uppercase">Card Number</label>
                    <input 
                      type="text" 
                      value={cardNumber} 
                      onChange={e => setCardNumber(e.target.value)}
                      className="w-full bg-[#09090b] border border-border/40 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#3bb75e] transition-colors"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-muted-foreground uppercase">Expiry Date</label>
                      <input 
                        type="text" 
                        value={cardExpiry} 
                        onChange={e => setCardExpiry(e.target.value)}
                        className="w-full bg-[#09090b] border border-border/40 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#3bb75e] transition-colors"
                        placeholder="MM/YY"
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-muted-foreground uppercase">CVV</label>
                      <input 
                        type="password" 
                        value={cardCvv} 
                        onChange={e => setCardCvv(e.target.value)}
                        className="w-full bg-[#09090b] border border-border/40 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#3bb75e] transition-colors"
                        maxLength={3}
                        required
                      />
                    </div>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-[#3bb75e] hover:bg-[#2fa04f] text-white h-12 text-base font-bold shadow-md rounded-xl transition-all"
                >
                  Pay ₦900
                </Button>

                <div className="text-center flex justify-center items-center gap-1.5 text-xs text-muted-foreground">
                  <ShieldCheck className="h-4 w-4 text-[#3bb75e]" />
                  Secured by Paystack (Mocked)
                </div>
              </form>
            )}

            {paymentStage === "processing" && (
              <div className="p-12 flex flex-col items-center justify-center text-center space-y-6">
                <Loader2 className="h-12 w-12 text-[#3bb75e] animate-spin" />
                <div className="space-y-1">
                  <h3 className="font-semibold text-lg text-foreground">Processing Payment</h3>
                  <p className="text-sm text-muted-foreground">Simulating Paystack secure authorization...</p>
                </div>
              </div>
            )}

            {paymentStage === "success" && (
              <div className="p-12 flex flex-col items-center justify-center text-center space-y-6">
                <div className="w-16 h-16 rounded-full bg-[#3bb75e]/25 flex items-center justify-center border-2 border-[#3bb75e]">
                  <Check className="h-8 w-8 text-[#3bb75e]" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-xl text-foreground">Upgrade Successful!</h3>
                  <p className="text-sm text-muted-foreground">You are now subscribed to RecallIQ Pro.</p>
                </div>
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  )
}
