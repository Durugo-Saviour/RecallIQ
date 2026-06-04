import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Brain, Sparkles, TrendingUp, Calendar, ArrowRight, ShieldCheck, Zap } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col w-full">
      {/* Hero Section */}
      <section className="w-full py-20 md:py-32 lg:py-40 bg-gradient-to-b from-background to-muted/30">
        <div className="container px-4 md:px-6 flex flex-col items-center text-center space-y-8">
          <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 bg-primary/10 text-primary border-primary/20">
            <Sparkles className="h-3.5 w-3.5 mr-1" />
            AI-Powered Study Assistant
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight max-w-4xl">
            Don't just study. <br className="hidden md:block" />
            <span className="text-primary italic">Prove what you know.</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl leading-relaxed">
            RecallIQ combines smart scheduling with active recall so you discover your knowledge gaps before the exam — not during it.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 pt-4 w-full sm:w-auto">
            <Link href="/auth/signup" className="w-full sm:w-auto">
              <Button size="lg" className="w-full h-14 px-8 text-base shadow-lg hover:scale-105 transition-transform">
                Start Studying for Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="#features" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full h-14 px-8 text-base">
                See How It Works
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="w-full py-20 md:py-32">
        <div className="container px-4 md:px-6">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">Stop reading. Start retrieving.</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Rereading notes creates the illusion of competence. True mastery comes from retrieving information from memory.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <div className="flex flex-col space-y-4 p-8 bg-card rounded-2xl border shadow-sm hover:shadow-md transition-shadow">
              <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center">
                <Calendar className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-2xl font-bold">Smart Schedule</h3>
              <p className="text-muted-foreground leading-relaxed">
                Add your courses and exam dates. Our algorithm automatically reprioritises what you should study next based on your mastery and urgency.
              </p>
            </div>
            
            <div className="flex flex-col space-y-4 p-8 bg-card rounded-2xl border shadow-sm hover:shadow-md transition-shadow">
              <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center">
                <Brain className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-2xl font-bold">Active Recall AI</h3>
              <p className="text-muted-foreground leading-relaxed">
                Tell us what topic you just studied. Our AI instantly generates 5 specific short-answer questions, including real-world application scenarios, to force you to prove your knowledge.
              </p>
            </div>
            
            <div className="flex flex-col space-y-4 p-8 bg-card rounded-2xl border shadow-sm hover:shadow-md transition-shadow">
              <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center">
                <TrendingUp className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-2xl font-bold">Mastery Tracking</h3>
              <p className="text-muted-foreground leading-relaxed">
                Get line-by-line feedback on your answers from the AI. Watch your mastery score grow as you consistently perform well in recall sessions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works / Steps Section */}
      <section id="how-it-works" className="w-full py-20 bg-muted/50 border-y">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col lg:flex-row gap-16 items-center">
            <div className="lg:w-1/2 space-y-8">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">The RecallIQ Method</h2>
              
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 mt-1 h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">1</div>
                  <div>
                    <h4 className="text-xl font-bold">Study normally</h4>
                    <p className="text-muted-foreground mt-1">Read your textbook, watch a lecture, or review your notes as you usually would.</p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="flex-shrink-0 mt-1 h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">2</div>
                  <div>
                    <h4 className="text-xl font-bold">Generate a Quiz</h4>
                    <p className="text-muted-foreground mt-1">Input your topic into RecallIQ. The AI generates specific recall questions immediately.</p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="flex-shrink-0 mt-1 h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">3</div>
                  <div>
                    <h4 className="text-xl font-bold">Prove your Knowledge</h4>
                    <p className="text-muted-foreground mt-1">Answer from memory. The AI grades your responses and updates your course mastery.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="lg:w-1/2 w-full max-w-md mx-auto relative">
              <div className="aspect-square rounded-full bg-gradient-to-tr from-primary/20 to-primary/5 absolute -inset-4 blur-3xl -z-10"></div>
              <div className="bg-card rounded-xl border shadow-xl p-8 space-y-6">
                <div className="flex items-center gap-3 border-b pb-4">
                  <ShieldCheck className="h-6 w-6 text-green-500" />
                  <span className="font-semibold text-lg">AI Feedback Example</span>
                </div>
                <div className="space-y-2">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Your Answer</span>
                  <p className="text-sm bg-muted/50 p-3 rounded-lg">Mitochondria makes energy for the cell using food.</p>
                </div>
                <div className="space-y-2">
                  <span className="text-xs font-medium text-primary uppercase tracking-wider flex items-center gap-1"><Zap className="h-3 w-3"/> AI Feedback</span>
                  <p className="text-sm bg-primary/5 border border-primary/10 p-3 rounded-lg">Good! To be more precise, it generates ATP (adenosine triphosphate) through cellular respiration.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-24 md:py-32">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center text-center space-y-8 bg-primary text-primary-foreground rounded-3xl p-8 md:p-16 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3">
              <Brain className="h-64 w-64 text-primary-foreground opacity-10" />
            </div>
            
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight max-w-2xl relative z-10">
              Ready to ace your next exam?
            </h2>
            <p className="text-primary-foreground/80 text-lg md:text-xl max-w-xl relative z-10">
              Join thousands of students who have stopped rereading and started retrieving.
            </p>
            <div className="relative z-10 pt-4">
              <Link href="/auth/signup">
                <Button size="lg" variant="secondary" className="h-14 px-8 text-lg font-bold text-primary hover:scale-105 transition-transform shadow-xl">
                  Create Free Account
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
