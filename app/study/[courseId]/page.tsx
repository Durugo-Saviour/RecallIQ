"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Brain, Clock, Loader2, Sparkles, ArrowRight, BookOpen } from "lucide-react"
import { getDaysUntil } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

interface Course {
  id: string
  name: string
  exam_date: string
  difficulty: number
  mastery_scores: { score: number }[]
}

export default function StudyPage() {
  const params = useParams()
  const router = useRouter()
  const courseId = params.courseId as string
  const supabase = createClient()
  const { toast } = useToast()

  const [course, setCourse] = useState<Course | null>(null)
  const [topic, setTopic] = useState("")
  const [notes, setNotes] = useState("")
  const [mode, setMode] = useState<"recall" | "exam">("recall")
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)

  useEffect(() => {
    async function fetchCourse() {
      const { data, error } = await supabase
        .from('courses')
        .select(`
          id,
          name,
          exam_date,
          difficulty,
          mastery_scores ( score )
        `)
        .eq('id', courseId)
        .single()

      if (error || !data) {
        toast({
          title: "Course not found",
          description: "The course you're looking for doesn't exist.",
          variant: "destructive",
        })
        router.push('/dashboard')
        return
      }

      setCourse(data)
      setLoading(false)
    }

    fetchCourse()
  }, [courseId])

  const handleGenerateQuestions = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (mode === "recall" && !topic.trim()) return
    if (mode === "exam" && !notes.trim()) return

    setGenerating(true)

    try {
      const endpoint = mode === "recall" ? '/api/generate-questions' : '/api/generate-exam'
      const payload = mode === "recall" 
        ? { courseId, topic: topic.trim() }
        : { courseId, notes: notes.trim() }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate')
      }

      toast({
        title: mode === "recall" ? "Questions ready!" : "Exam ready!",
        description: "Your session has been generated. Good luck!",
      })

      if (mode === "recall") {
        router.push(`/quiz/${data.sessionId}`)
      } else {
        router.push(`/exam-quiz/${data.sessionId}`)
      }
    } catch (error: any) {
      toast({
        title: "Error generating session",
        description: error.message,
        variant: "destructive",
      })
      setGenerating(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!course) return null

  const mastery = Math.round(course.mastery_scores?.[0]?.score ?? 0)
  const daysUntilExam = Math.max(0, getDaysUntil(course.exam_date))

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-6">
        {/* Course Info Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
            <BookOpen className="h-4 w-4" />
            Study Session
          </div>
          <h1 className="text-3xl font-bold tracking-tight">{course.name}</h1>
          <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Brain className="h-4 w-4" />
              Mastery: <strong className="text-foreground">{mastery}%</strong>
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              Exam in: <strong className="text-foreground">{daysUntilExam} days</strong>
            </span>
          </div>
        </div>

        {/* Mode Toggle */}
        <div className="flex bg-muted p-1 rounded-xl">
          <button
            onClick={() => setMode("recall")}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
              mode === "recall" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Quick Recall
          </button>
          <button
            onClick={() => setMode("exam")}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
              mode === "exam" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Exam Mode
          </button>
        </div>

        {/* Input Card */}
        <Card className="border-2 border-dashed border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              {mode === "recall" ? "What did you just study?" : "Paste your study notes"}
            </CardTitle>
            <CardDescription>
              {mode === "recall"
                ? "Enter a specific topic. Our AI will generate 5 flashcard-style questions."
                : "Paste your notes or study materials. Our AI will generate a comprehensive exam based on your notes and general knowledge."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleGenerateQuestions} className="space-y-4">
              {mode === "recall" ? (
                <div className="space-y-2">
                  <Label htmlFor="topic">Topic / Chapter</Label>
                  <Input
                    id="topic"
                    placeholder="e.g. Chapter 5: Linked Lists and Stacks"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    required
                    disabled={generating}
                    className="h-12 text-base"
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="notes">Study Notes / Materials</Label>
                  <textarea
                    id="notes"
                    placeholder="Paste your notes here..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    required
                    disabled={generating}
                    className="flex min-h-[150px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                  />
                </div>
              )}
              
              <Button
                type="submit"
                className="w-full h-12 text-base font-semibold"
                disabled={generating || (mode === "recall" ? !topic.trim() : !notes.trim())}
              >
                {generating ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Generating {mode === "recall" ? "Questions" : "Exam"}...
                  </>
                ) : (
                  <>
                    Generate {mode === "recall" ? "Recall Quiz" : "Exam"}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Tips */}
        <div className="rounded-lg bg-muted/50 border p-4">
          <h3 className="font-semibold text-sm mb-2">💡 Tips for better results</h3>
          {mode === "recall" ? (
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Be specific — "Binary Search Trees" works better than "Trees"</li>
              <li>• Include chapter numbers if applicable</li>
              <li>• One topic per session for focused recall</li>
            </ul>
          ) : (
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Paste a full chapter's worth of notes</li>
              <li>• The more detail you provide, the better the exam questions</li>
              <li>• The AI will also incorporate general course knowledge</li>
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
