"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { format } from "date-fns"
import { Loader2, Search, ArrowRight, Brain, Calendar, BookOpen, AlertCircle } from "lucide-react"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface StudySessionSummary {
  id: string
  topic: string
  courseName: string
  date: string
  averageScore: number
  totalQuestions: number
}

export default function ResultsHistoryPage() {
  const [loading, setLoading] = useState(true)
  const [sessions, setSessions] = useState<StudySessionSummary[]>([])
  const [courses, setCourses] = useState<string[]>([])
  
  // Filters
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCourse, setSelectedCourse] = useState("all")
  const [sortBy, setSortBy] = useState("newest") // newest, oldest, highest_score, lowest_score

  const supabase = createClient()

  useEffect(() => {
    async function fetchSessions() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: results, error } = await supabase
        .from('recall_results')
        .select(`
          session_id,
          topic,
          score,
          created_at,
          study_sessions ( course_id, courses ( name ) )
        `)
        .order('created_at', { ascending: false })

      if (results) {
        const sessionMap = new Map<string, any>()
        const uniqueCourses = new Set<string>()

        results.forEach(r => {
          const courseName = (r as any).study_sessions?.courses?.name || "Unknown Course"
          uniqueCourses.add(courseName)

          if (!sessionMap.has(r.session_id)) {
            sessionMap.set(r.session_id, {
              id: r.session_id,
              topic: r.topic,
              courseName,
              date: r.created_at,
              totalScore: 0,
              count: 0
            })
          }
          const s = sessionMap.get(r.session_id)
          s.totalScore += r.score
          s.count += 1
        })

        const formattedSessions: StudySessionSummary[] = Array.from(sessionMap.values()).map(s => ({
          id: s.id,
          topic: s.topic,
          courseName: s.courseName,
          date: s.date,
          averageScore: Math.round(s.totalScore / s.count),
          totalQuestions: s.count
        }))

        setSessions(formattedSessions)
        setCourses(Array.from(uniqueCourses))
      }
      setLoading(false)
    }

    fetchSessions()
  }, [])

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  // Filter and sort sessions
  const filteredSessions = sessions
    .filter(s => {
      const matchesSearch = s.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            s.courseName.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCourse = selectedCourse === "all" || s.courseName === selectedCourse
      return matchesSearch && matchesCourse
    })
    .sort((a, b) => {
      if (sortBy === "newest") return new Date(b.date).getTime() - new Date(a.date).getTime()
      if (sortBy === "oldest") return new Date(a.date).getTime() - new Date(b.date).getTime()
      if (sortBy === "highest_score") return b.averageScore - a.averageScore
      if (sortBy === "lowest_score") return a.averageScore - b.averageScore
      return 0
    })

  const getScoreColor = (score: number) => {
    if (score >= 75) return "text-green-500 border-green-500/20 bg-green-500/10"
    if (score >= 50) return "text-yellow-500 border-yellow-500/20 bg-yellow-500/10"
    return "text-red-500 border-red-500/20 bg-red-500/10"
  }

  return (
    <div className="container py-8 max-w-5xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Quiz Results & History</h1>
          <p className="text-muted-foreground">Review your past performance and see detailed feedback.</p>
        </div>
        <Link href="/dashboard">
          <Button variant="outline">Back to Dashboard</Button>
        </Link>
      </div>

      {sessions.length === 0 ? (
        <Card className="text-center py-16 border-dashed">
          <CardHeader>
            <div className="mx-auto bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mb-4">
              <Brain className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-xl">No study history yet</CardTitle>
            <CardDescription className="max-w-md mx-auto">
              Once you start a study session and complete a recall quiz, your detailed line-by-line results will appear here.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard">
              <Button>Start Studying Now</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-card p-4 rounded-xl border">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search topic or course..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-9 h-10"
              />
            </div>
            
            {/* Filter by course */}
            <select
              value={selectedCourse}
              onChange={e => setSelectedCourse(e.target.value)}
              className="h-10 px-3 rounded-md border border-input bg-background text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              <option value="all">All Courses</option>
              {courses.map((course, idx) => (
                <option key={idx} value={course}>{course}</option>
              ))}
            </select>

            {/* Sort by */}
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="h-10 px-3 rounded-md border border-input bg-background text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              <option value="newest">Sort by Date: Newest</option>
              <option value="oldest">Sort by Date: Oldest</option>
              <option value="highest_score">Sort by Score: Highest</option>
              <option value="lowest_score">Sort by Score: Lowest</option>
            </select>
          </div>

          {/* Results Grid */}
          {filteredSessions.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground flex flex-col items-center gap-2">
              <AlertCircle className="h-8 w-8 text-muted-foreground" />
              <p>No results match your filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredSessions.map(session => (
                <Link
                  href={`/results/${session.id}`}
                  key={session.id}
                  className="block group"
                >
                  <Card className="h-full border hover:border-primary transition-all duration-200 cursor-pointer hover:shadow-md relative overflow-hidden">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1.5">
                          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary uppercase tracking-wider">
                            <BookOpen className="h-3.5 w-3.5" />
                            {session.courseName}
                          </div>
                          <CardTitle className="text-lg line-clamp-1 group-hover:text-primary transition-colors">
                            {session.topic}
                          </CardTitle>
                        </div>
                        
                        <div className={`px-3 py-1.5 rounded-lg border font-bold text-lg ${getScoreColor(session.averageScore)}`}>
                          {session.averageScore}%
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="pb-4">
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-4 w-4" />
                          {format(new Date(session.date), 'MMM d, yyyy • h:mm a')}
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <span>{session.totalQuestions} questions</span>
                          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1 ml-1 text-primary" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
