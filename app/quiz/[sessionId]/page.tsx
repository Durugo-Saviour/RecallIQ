"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Loader2, ArrowRight, ArrowLeft, Send, Brain, HelpCircle } from "lucide-react"
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

export default function QuizPage() {
  const params = useParams()
  const router = useRouter()
  const sessionId = params.sessionId as string
  const supabase = createClient()
  const { toast } = useToast()

  const [session, setSession] = useState<Session | null>(null)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

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
          description: "This quiz session doesn't exist or has no questions.",
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

  const handleAnswerChange = (value: string) => {
    const newAnswers = [...answers]
    newAnswers[currentQuestion] = value
    setAnswers(newAnswers)
  }

  const goNext = () => {
    if (session && currentQuestion < session.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    }
  }

  const goPrev = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  const handleSubmit = async () => {
    if (!session) return

    // Check for empty answers
    const emptyAnswers = answers.filter(a => !a.trim())
    if (emptyAnswers.length > 0) {
      toast({
        title: "Incomplete answers",
        description: `You have ${emptyAnswers.length} empty answer(s). Please answer all questions.`,
        variant: "destructive",
      })
      // Navigate to first empty answer
      const firstEmpty = answers.findIndex(a => !a.trim())
      setCurrentQuestion(firstEmpty)
      return
    }

    setSubmitting(true)

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

      const res = await fetch('/api/evaluate-answers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to evaluate answers')
      }

      toast({
        title: "Quiz submitted!",
        description: `You scored ${data.sessionScore}% on this session.`,
      })

      router.push(`/results/${session.id}`)
    } catch (error: any) {
      toast({
        title: "Error submitting quiz",
        description: error.message,
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
          <p className="text-muted-foreground">Loading your quiz...</p>
        </div>
      </div>
    )
  }

  if (!session) return null

  const totalQuestions = session.questions.length
  const progressPercent = ((currentQuestion + 1) / totalQuestions) * 100
  const currentQ = session.questions[currentQuestion]
  const isLastQuestion = currentQuestion === totalQuestions - 1
  const allAnswered = answers.every(a => a.trim().length > 0)

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-6">
        {/* Header */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
              <Brain className="h-4 w-4" />
              {session.topic}
            </div>
            <span className="text-sm font-medium text-muted-foreground">
              {currentQuestion + 1} of {totalQuestions}
            </span>
          </div>
          <Progress value={progressPercent} className="h-2" />
        </div>

        {/* Question Card */}
        <Card className="shadow-lg">
          <CardHeader className="pb-4">
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary text-primary-foreground text-sm font-bold shrink-0 mt-0.5">
                {currentQuestion + 1}
              </div>
              <CardTitle className="text-xl leading-relaxed">
                {currentQ.question}
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Type your answer here... Write everything you can recall without looking at your notes."
              value={answers[currentQuestion]}
              onChange={(e) => handleAnswerChange(e.target.value)}
              className="min-h-[160px] text-base resize-none"
              disabled={submitting}
              autoFocus
            />
            <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
              <HelpCircle className="h-3.5 w-3.5" />
              Write from memory — the more detail, the better your score.
            </div>
          </CardContent>
          <CardFooter className="flex justify-between pt-4">
            <Button
              variant="outline"
              onClick={goPrev}
              disabled={currentQuestion === 0 || submitting}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>

            <div className="flex gap-2">
              {/* Question dots */}
              {session.questions.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentQuestion(i)}
                  disabled={submitting}
                  className={`h-2.5 w-2.5 rounded-full transition-all ${
                    i === currentQuestion
                      ? 'bg-primary scale-125'
                      : answers[i]?.trim()
                        ? 'bg-primary/50'
                        : 'bg-muted-foreground/30'
                  }`}
                />
              ))}
            </div>

            {isLastQuestion ? (
              <Button
                onClick={handleSubmit}
                disabled={submitting || !allAnswered}
                className="bg-green-600 hover:bg-green-700"
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Grading...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Submit Quiz
                  </>
                )}
              </Button>
            ) : (
              <Button onClick={goNext}>
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </CardFooter>
        </Card>

        {/* Answer status bar */}
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <span>{answers.filter(a => a.trim()).length} of {totalQuestions} answered</span>
          {allAnswered && !submitting && (
            <span className="text-green-500 font-medium">✓ All done — submit when ready!</span>
          )}
        </div>
      </div>
    </div>
  )
}
