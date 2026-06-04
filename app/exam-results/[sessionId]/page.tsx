"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, ArrowLeft, Trophy, TrendingUp, CheckCircle2, XCircle, MinusCircle, Lightbulb, AlertTriangle } from "lucide-react"
import Link from "next/link"

interface Result {
  id: string
  question: string
  user_answer: string
  score: number
  feedback: string
  topic: string
}

export default function ExamResultsPage() {
  const params = useParams()
  const router = useRouter()
  const sessionId = params.sessionId as string
  const supabase = createClient()

  const [results, setResults] = useState<Result[]>([])
  const [topic, setTopic] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchResults() {
      const { data, error } = await supabase
        .from('recall_results')
        .select('id, question, user_answer, score, feedback, topic')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true })

      if (error || !data || data.length === 0) {
        router.push('/dashboard')
        return
      }

      setResults(data)
      setTopic(data[0].topic)
      setLoading(false)
    }

    fetchResults()
  }, [sessionId])

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const averageScore = Math.round(results.reduce((sum, r) => sum + r.score, 0) / results.length)

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500"
    if (score >= 60) return "text-yellow-500"
    return "text-red-500"
  }

  const getScoreBg = (score: number) => {
    if (score >= 80) return "bg-green-500/10 border-green-500/20"
    if (score >= 60) return "bg-yellow-500/10 border-yellow-500/20"
    return "bg-red-500/10 border-red-500/20"
  }

  const getScoreIcon = (score: number) => {
    if (score >= 80) return <CheckCircle2 className="h-6 w-6 text-green-500" />
    if (score >= 60) return <MinusCircle className="h-6 w-6 text-yellow-500" />
    return <XCircle className="h-6 w-6 text-red-500" />
  }

  // Parse the AI feedback string which is formatted as:
  // "Corrections: ... \n\nBetter way to RECALL: ..."
  const parseFeedback = (feedbackStr: string) => {
    const parts = feedbackStr.split(/Better way to RECALL:/i)
    const correctionsRaw = parts[0] ? parts[0].replace(/Corrections:/i, '').trim() : "No specific corrections."
    const recallRaw = parts[1] ? parts[1].trim() : "Review your notes again."
    
    return {
      corrections: correctionsRaw,
      recall: recallRaw
    }
  }

  return (
    <div className="container py-12 max-w-4xl mx-auto space-y-10">
      {/* Header */}
      <div className="text-center space-y-6">
        <div className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold tracking-wider uppercase">
          {topic}
        </div>
        
        <h1 className="text-4xl font-extrabold tracking-tight">Exam Results</h1>

        <div className={`mx-auto max-w-sm flex items-center justify-center gap-6 p-8 rounded-3xl border-2 shadow-xl ${getScoreBg(averageScore)}`}>
          <Trophy className={`h-16 w-16 ${getScoreColor(averageScore)}`} />
          <div className="text-left">
            <div className={`text-6xl font-black tracking-tighter ${getScoreColor(averageScore)}`}>
              {averageScore}%
            </div>
            <div className="font-semibold text-muted-foreground uppercase tracking-widest text-sm mt-1">
              Final Grade
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Analysis */}
      <div className="space-y-8">
        <h2 className="text-2xl font-bold flex items-center gap-2 border-b pb-4">
          <TrendingUp className="h-6 w-6 text-primary" />
          Detailed Analysis & Recommendations
        </h2>

        {results.map((result, index) => {
          const parsed = parseFeedback(result.feedback)
          
          return (
            <Card key={result.id} className={`overflow-hidden border-2 ${getScoreBg(result.score)}`}>
              <div className="bg-card px-6 py-4 flex items-start gap-4 border-b">
                <div className={`mt-1 shrink-0 flex items-center justify-center h-8 w-8 rounded-full ${getScoreBg(result.score)} font-bold ${getScoreColor(result.score)}`}>
                  {index + 1}
                </div>
                <div className="flex-1 space-y-1">
                  <h3 className="font-semibold text-lg leading-snug">{result.question}</h3>
                </div>
                <div className="flex items-center gap-2 shrink-0 bg-background px-3 py-1.5 rounded-full border shadow-sm">
                  {getScoreIcon(result.score)}
                  <span className={`text-xl font-black ${getScoreColor(result.score)}`}>
                    {result.score}%
                  </span>
                </div>
              </div>

              <CardContent className="p-0">
                <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x border-b">
                  {/* User Answer */}
                  <div className="p-6 bg-muted/30">
                    <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Your Answer</div>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{result.user_answer}</p>
                  </div>
                  
                  {/* AI Corrections */}
                  <div className="p-6 bg-background">
                    <div className="flex items-center gap-2 text-xs font-bold text-amber-600 uppercase tracking-wider mb-3">
                      <AlertTriangle className="h-4 w-4" />
                      Corrections
                    </div>
                    <p className="text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap">{parsed.corrections}</p>
                  </div>
                </div>

                {/* Better Way to Recall */}
                <div className="p-6 bg-primary/5">
                  <div className="flex items-center gap-2 text-sm font-bold text-primary uppercase tracking-wider mb-2">
                    <Lightbulb className="h-5 w-5" />
                    Better Way To Recall
                  </div>
                  <p className="text-base leading-relaxed text-primary/90 font-medium">
                    {parsed.recall}
                  </p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8 border-t">
        <Link href="/dashboard" className="w-full sm:w-auto">
          <Button variant="outline" size="lg" className="w-full">
            <ArrowLeft className="mr-2 h-5 w-5" />
            Back to Dashboard
          </Button>
        </Link>
        <Link href="/progress" className="w-full sm:w-auto">
          <Button size="lg" className="w-full">
            <TrendingUp className="mr-2 h-5 w-5" />
            View Overall Mastery
          </Button>
        </Link>
      </div>
    </div>
  )
}
