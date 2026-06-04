"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, ArrowLeft, Trophy, TrendingUp, CheckCircle2, XCircle, MinusCircle } from "lucide-react"
import Link from "next/link"

interface Result {
  id: string
  question: string
  user_answer: string
  score: number
  feedback: string
  topic: string
}

export default function ResultsPage() {
  const params = useParams()
  const router = useRouter()
  const sessionId = params.sessionId as string
  const supabase = createClient()

  const [results, setResults] = useState<Result[]>([])
  const [topic, setTopic] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchResults() {
      // Fetch results for this session
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
    if (score >= 75) return "text-green-500"
    if (score >= 50) return "text-yellow-500"
    return "text-red-500"
  }

  const getScoreBg = (score: number) => {
    if (score >= 75) return "bg-green-500/10 border-green-500/20"
    if (score >= 50) return "bg-yellow-500/10 border-yellow-500/20"
    return "bg-red-500/10 border-red-500/20"
  }

  const getScoreIcon = (score: number) => {
    if (score >= 75) return <CheckCircle2 className="h-5 w-5 text-green-500" />
    if (score >= 50) return <MinusCircle className="h-5 w-5 text-yellow-500" />
    return <XCircle className="h-5 w-5 text-red-500" />
  }

  const getOverallEmoji = (score: number) => {
    if (score >= 90) return "🏆"
    if (score >= 75) return "🎉"
    if (score >= 60) return "💪"
    if (score >= 40) return "📚"
    return "🔁"
  }

  const getOverallMessage = (score: number) => {
    if (score >= 90) return "Outstanding! You've mastered this topic."
    if (score >= 75) return "Great job! You have a solid understanding."
    if (score >= 60) return "Good effort! Review the weak spots."
    if (score >= 40) return "Keep studying. You're getting there."
    return "This needs more work. Try studying again."
  }

  return (
    <div className="container py-8 max-w-3xl mx-auto space-y-8">
      {/* Overall Score Header */}
      <div className="text-center space-y-4">
        <div className="text-5xl">{getOverallEmoji(averageScore)}</div>
        <h1 className="text-3xl font-bold tracking-tight">Session Results</h1>
        <p className="text-muted-foreground">{topic}</p>

        <div className={`inline-flex items-center gap-3 px-6 py-4 rounded-2xl border ${getScoreBg(averageScore)}`}>
          <Trophy className={`h-8 w-8 ${getScoreColor(averageScore)}`} />
          <div className="text-left">
            <div className={`text-4xl font-bold ${getScoreColor(averageScore)}`}>
              {averageScore}%
            </div>
            <div className="text-sm text-muted-foreground">Session Average</div>
          </div>
        </div>

        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          {getOverallMessage(averageScore)}
        </p>
      </div>

      {/* Individual Results */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Question Breakdown
        </h2>

        {results.map((result, index) => (
          <Card key={result.id} className={`border ${getScoreBg(result.score)}`}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-4">
                <CardTitle className="text-base font-medium leading-relaxed flex items-start gap-3">
                  <span className="flex items-center justify-center h-6 w-6 rounded-full bg-muted text-xs font-bold shrink-0 mt-0.5">
                    {index + 1}
                  </span>
                  {result.question}
                </CardTitle>
                <div className="flex items-center gap-2 shrink-0">
                  {getScoreIcon(result.score)}
                  <span className={`text-lg font-bold ${getScoreColor(result.score)}`}>
                    {result.score}%
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="rounded-lg bg-muted/50 p-3">
                <div className="text-xs font-medium text-muted-foreground mb-1">Your Answer</div>
                <p className="text-sm">{result.user_answer}</p>
              </div>
              <div className="rounded-lg bg-primary/5 border border-primary/10 p-3">
                <div className="text-xs font-medium text-primary mb-1">AI Feedback</div>
                <p className="text-sm">{result.feedback}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
        <Link href="/dashboard">
          <Button variant="outline" className="w-full sm:w-auto">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>
        <Link href="/progress">
          <Button className="w-full sm:w-auto">
            <TrendingUp className="mr-2 h-4 w-4" />
            View Progress
          </Button>
        </Link>
      </div>
    </div>
  )
}
