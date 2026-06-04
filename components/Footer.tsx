import Link from "next/link"
import { Brain, Github, Twitter } from "lucide-react"

export function Footer() {
  return (
    <footer className="w-full border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-8 md:py-12 mt-auto">
      <div className="container flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col items-center md:items-start gap-4">
          <Link href="/" className="flex items-center gap-2">
            <Brain className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl">
              Recall<span className="text-primary italic font-extrabold">IQ</span>
            </span>
          </Link>
          <p className="text-sm text-muted-foreground text-center md:text-left max-w-xs">
            The intelligent study companion that ensures you never experience the illusion of competence again.
          </p>
        </div>
        
        <div className="flex flex-col md:flex-row gap-8 md:gap-16 text-center md:text-left">
          <div className="space-y-3">
            <h4 className="font-semibold">Product</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/#features" className="hover:text-primary transition-colors">Features</Link></li>
              <li><Link href="/#how-it-works" className="hover:text-primary transition-colors">How it Works</Link></li>
              <li><Link href="/pricing" className="hover:text-primary transition-colors">Pricing</Link></li>
            </ul>
          </div>
          
          <div className="space-y-3">
            <h4 className="font-semibold">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold">Connect</h4>
            <div className="flex gap-4 justify-center md:justify-start">
              <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Twitter className="h-5 w-5" />
                <span className="sr-only">Twitter</span>
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Github className="h-5 w-5" />
                <span className="sr-only">GitHub</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      <div className="container mt-8 pt-8 border-t flex flex-col items-center">
        <p className="text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} RecallIQ. Built for students, by students.
        </p>
      </div>
    </footer>
  )
}
