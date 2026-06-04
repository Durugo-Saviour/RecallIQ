"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { DarkModeToggle } from "./DarkModeToggle"
import { createClient } from "@/lib/supabase/client"
import { useEffect, useState } from "react"
import { User } from "@supabase/supabase-js"
import { Button } from "./ui/button"
import { Brain } from "lucide-react"

export function Navbar() {
  const pathname = usePathname()
  const supabase = createClient()
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
    })

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [supabase.auth])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        <div className="flex items-center gap-6 md:gap-10">
          <Link href="/" className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            <span className="font-bold sm:inline-block text-lg">
              Recall<span className="text-primary italic font-extrabold">IQ</span>
            </span>
          </Link>
          {user && (
            <nav className="flex gap-6">
              <Link
                href="/dashboard"
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  pathname === "/dashboard" ? "text-primary" : "text-muted-foreground"
                }`}
              >
                Dashboard
              </Link>
              <Link
                href="/progress"
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  pathname === "/progress" ? "text-primary" : "text-muted-foreground"
                }`}
              >
                Progress
              </Link>
              <Link
                href="/schedule"
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  pathname === "/schedule" ? "text-primary" : "text-muted-foreground"
                }`}
              >
                Schedule
              </Link>
              <Link
                href="/results"
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  pathname?.startsWith("/results") && pathname !== "/results/page" ? "text-primary" : "text-muted-foreground"
                }`}
              >
                Results
              </Link>
              <Link
                href="/pricing"
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  pathname === "/pricing" ? "text-primary" : "text-muted-foreground"
                }`}
              >
                Pricing
              </Link>
            </nav>
          )}
          {!user && pathname !== '/pricing' && (
             <nav className="flex gap-6">
               <Link href="/pricing" className="text-sm font-medium transition-colors hover:text-primary text-muted-foreground">
                 Pricing
               </Link>
             </nav>
          )}
        </div>
        <div className="flex items-center space-x-4">
          <DarkModeToggle />
          {user ? (
            <div className="flex items-center space-x-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">{user.email}</span>
                {user.user_metadata?.is_pro && (
                  <span className="bg-gradient-to-r from-yellow-500 via-amber-500 to-orange-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm select-none">
                    Pro
                  </span>
                )}
              </div>
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                Sign Out
              </Button>
            </div>
          ) : (
            pathname !== '/auth/login' && pathname !== '/auth/signup' && (
              <Link href="/auth/login">
                <Button size="sm">Log In</Button>
              </Link>
            )
          )}
        </div>
      </div>
    </header>
  )
}
