"use client"

import { useEffect, useState, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Send, Brain, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Question {
  question: string
  expectedKeywords: string[]
}

interface Session {
  id: string
  course_id: string
  topic: string
  questions: Question[]
}

export default function ExamQuizPage() {
  const params = useParams()
  const router = useRouter()
  const sessionId = params.sessionId as string
  const supabase = createClient()
  const { toast } = useToast()

  const [session, setSession] = useState<Session | null>(null)
  const [answers, setAnswers] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const questionRefs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    async function fetchSession() {
      const { data, error } = await supabase
        .from('study_sessions')
        .select('id, course_id, topic, questions')
        .eq('id', sessionId)
        .single()

      if (error || !data || !data.questions) {
        toast({
          title: "Session not found",
          description: "This exam session doesn't exist or has no questions.",
          variant: "destructive",
        })
        router.push('/dashboard')
        return
      }

      setSession(data as Session)
      setAnswers(new Array(data.questions.length).fill(""))
      setLoading(false)
    }

    fetchSession()
  }, [sessionId])

  const handleAnswerChange = (index: number, value: string) => {
    const newAnswers = [...answers]
    newAnswers[index] = value
    setAnswers(newAnswers)
  }

  const handleSubmit = async () => {
    if (!session) return

    // Check for empty answers
    const firstEmptyIndex = answers.findIndex(a => !a.trim())
    if (firstEmptyIndex !== -1) {
      toast({
        title: "Incomplete exam",
        description: "Please answer all questions before submitting.",
        variant: "destructive",
      })
      // Scroll to the first unanswered question
      questionRefs.current[firstEmptyIndex]?.scrollIntoView({ behavior: "smooth", block: "center" })
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      const payload = {
        sessionId: session.id,
        courseId: session.course_id,
        answers: session.questions.map((q, i) => ({
          question: q.question,
          expectedKeywords: q.expectedKeywords,
          userAnswer: answers[i],
        })),
      }

      const res = await fetch('/api/evaluate-exam', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to evaluate exam')
      }

      toast({
        title: "Exam submitted!",
        description: `You scored ${data.sessionScore}% on this comprehensive exam.`,
      })

      router.push(`/exam-results/${session.id}`)
    } catch (err: any) {
      setError(err.message)
      toast({
        title: "Error submitting exam",
        description: err.message,
        variant: "destructive",
      })
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Loading your exam paper...</p>
        </div>
      </div>
    )
  }

  if (!session) return null

  const allAnswered = answers.every(a => a.trim().length > 0)

  return (
    <div className="container py-12 max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div className="space-y-4 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
          <Brain className="h-4 w-4" />
          {session.topic}
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Comprehensive Exam</h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Answer all questions below based on your notes and general knowledge. The AI will evaluate your responses rigorously.
        </p>
      </div>

      {error && (
        <div className="bg-red-500/10 text-red-500 border border-red-500/20 p-4 rounded-xl flex items-start gap-3">
          <AlertCircle className="h-5 w-5 mt-0.5" />
          <div>
            <h3 className="font-bold">Error</h3>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Questions List */}
      <div className="space-y-8">
        {session.questions.map((q, index) => (
          <Card key={index} className="shadow-md border-primary/10" ref={el => { questionRefs.current[index] = el }}>
            <CardHeader className="pb-4">
              <div className="flex items-start gap-3">
                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary/20 text-primary text-sm font-bold shrink-0 mt-0.5">
                  {index + 1}
                </div>
                <CardTitle className="text-xl leading-relaxed">
                  {q.question}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Type your comprehensive answer here..."
                value={answers[index]}
                onChange={(e) => handleAnswerChange(index, e.target.value)}
                className="min-h-[120px] text-base resize-y"
                disabled={submitting}
              />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Footer Actions */}
      <div className="pt-8 pb-12 flex flex-col items-center space-y-4 border-t">
        <div className="text-sm text-muted-foreground">
          {answers.filter(a => a.trim()).length} of {session.questions.length} questions answered
        </div>
        <Button
          size="lg"
          onClick={handleSubmit}
          disabled={submitting || !allAnswered}
          className="w-full max-w-sm h-14 text-lg bg-green-600 hover:bg-green-700 shadow-xl shadow-green-600/20"
        >
          {submitting ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Grading Exam...
            </>
          ) : (
            <>
              <Send className="mr-2 h-5 w-5" />
              Submit Exam for Grading
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
