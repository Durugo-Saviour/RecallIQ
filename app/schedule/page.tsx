"use client"

import { useEffect, useState, useMemo } from "react"
import { Loader2, Clock, Target, CalendarDays, Brain, ArrowRight, TrendingUp, AlertCircle, BookOpen } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Progress } from "@/components/ui/progress"

interface ScheduleItem {
  courseId: string
  courseName: string
  daysUntilExam: number
  masteryScore: number
  priorityScore: number
  recommendedMinutes: number
}

interface TimetableCell {
  courseId: string
  courseName: string
  minutes: number
  masteryScore: number
  daysUntilExam: number
  priorityScore: number
  isExamDay: boolean
}

function getWeekDates(): Date[] {
  const today = new Date()
  const dayOfWeek = today.getDay() // 0 = Sunday
  const monday = new Date(today)
  monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1))
  monday.setHours(0, 0, 0, 0)

  const dates: Date[] = []
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    dates.push(d)
  }
  return dates
}

function formatDay(date: Date): string {
  return date.toLocaleDateString("en-US", { weekday: "short" })
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

function isToday(date: Date): boolean {
  const today = new Date()
  return date.toDateString() === today.toDateString()
}

function isPast(date: Date): boolean {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return date < today
}

function buildTimetable(
  schedule: ScheduleItem[],
  weekDates: Date[]
): Map<string, TimetableCell[]> {
  const timetable = new Map<string, TimetableCell[]>()
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Initialize all dates
  weekDates.forEach((date) => {
    timetable.set(date.toDateString(), [])
  })

  // For each course, distribute study sessions across the week
  schedule.forEach((item) => {
    const examDate = new Date(today)
    examDate.setDate(today.getDate() + item.daysUntilExam)
    examDate.setHours(0, 0, 0, 0)

    weekDates.forEach((date) => {
      if (isPast(date) && !isToday(date)) return // Skip past days

      const dateKey = date.toDateString()
      const currentCells = timetable.get(dateKey) || []

      // Check if this is the exam day
      if (date.toDateString() === examDate.toDateString()) {
        currentCells.push({
          courseId: item.courseId,
          courseName: item.courseName,
          minutes: item.recommendedMinutes,
          masteryScore: item.masteryScore,
          daysUntilExam: item.daysUntilExam,
          priorityScore: item.priorityScore,
          isExamDay: true,
        })
        timetable.set(dateKey, currentCells)
        return
      }

      // If exam is past or today and not exam day, skip
      if (date > examDate) return

      // Distribute study time: higher priority courses appear more days
      // Top priority: every day, lower priority: every other day or less
      const daysDiff = Math.ceil(
        (date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      )

      // Courses with high priority or close exams study every day
      // Others spread out based on priority
      const studyFrequency = item.priorityScore >= 0.7 
        ? 1 
        : item.priorityScore >= 0.5 
          ? 2 
          : 3

      if (daysDiff % studyFrequency === 0) {
        // Scale minutes: less time on days further from exam
        const proximityFactor = Math.max(0.5, 1 - (daysDiff / Math.max(1, item.daysUntilExam)) * 0.3)
        const adjustedMinutes = Math.round(item.recommendedMinutes * proximityFactor)

        currentCells.push({
          courseId: item.courseId,
          courseName: item.courseName,
          minutes: Math.max(15, adjustedMinutes),
          masteryScore: item.masteryScore,
          daysUntilExam: item.daysUntilExam,
          priorityScore: item.priorityScore,
          isExamDay: false,
        })
        timetable.set(dateKey, currentCells)
      }
    })
  })

  // Sort each day's cells by priority
  timetable.forEach((cells, key) => {
    cells.sort((a, b) => b.priorityScore - a.priorityScore)
    timetable.set(key, cells)
  })

  return timetable
}

// Color palette for courses - cycling through vibrant accent colors
const courseColors = [
  { bg: "from-violet-500/20 to-purple-500/10", border: "border-violet-500/30", text: "text-violet-400", dot: "bg-violet-500" },
  { bg: "from-cyan-500/20 to-teal-500/10", border: "border-cyan-500/30", text: "text-cyan-400", dot: "bg-cyan-500" },
  { bg: "from-amber-500/20 to-orange-500/10", border: "border-amber-500/30", text: "text-amber-400", dot: "bg-amber-500" },
  { bg: "from-emerald-500/20 to-green-500/10", border: "border-emerald-500/30", text: "text-emerald-400", dot: "bg-emerald-500" },
  { bg: "from-rose-500/20 to-pink-500/10", border: "border-rose-500/30", text: "text-rose-400", dot: "bg-rose-500" },
  { bg: "from-blue-500/20 to-indigo-500/10", border: "border-blue-500/30", text: "text-blue-400", dot: "bg-blue-500" },
]

export default function SchedulePage() {
  const [schedule, setSchedule] = useState<ScheduleItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchSchedule() {
      try {
        const response = await fetch('/api/schedule')
        if (!response.ok) {
          throw new Error('Failed to fetch schedule')
        }
        const data = await response.json()
        setSchedule(data.schedule)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchSchedule()
  }, [])

  const weekDates = useMemo(() => getWeekDates(), [])
  const timetable = useMemo(() => buildTimetable(schedule, weekDates), [schedule, weekDates])
  const courseColorMap = useMemo(() => {
    const map = new Map<string, typeof courseColors[0]>()
    schedule.forEach((item, i) => {
      map.set(item.courseId, courseColors[i % courseColors.length])
    })
    return map
  }, [schedule])

  // Calculate total study time for the week
  const totalWeekMinutes = useMemo(() => {
    let total = 0
    timetable.forEach((cells) => {
      cells.forEach((cell) => {
        if (!cell.isExamDay) total += cell.minutes
      })
    })
    return total
  }, [timetable])

  if (loading) {
    return (
      <div className="container py-20 flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground animate-pulse">Calculating your optimal study path...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container py-20 text-center text-destructive">
        <AlertCircle className="mx-auto h-12 w-12 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Something went wrong</h2>
        <p>{error}</p>
      </div>
    )
  }

  return (
    <div className="container py-8 max-w-7xl mx-auto space-y-8">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-background p-8 rounded-2xl border border-primary/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Brain className="w-32 h-32" />
        </div>
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 text-primary text-sm font-medium mb-4">
            <Target className="w-4 h-4" />
            AI-Powered Study Plan
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight mb-2 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
            Smart Schedule
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Our algorithm automatically reprioritises what you should study next based on your current mastery, difficulty, and upcoming exam dates.
          </p>
        </div>
      </div>

      {schedule.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <CalendarDays className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-bold mb-2">No active courses found</h3>
            <p className="text-muted-foreground max-w-sm mb-6">
              Add your courses and their exam dates to get a personalized study schedule.
            </p>
            <Link href="/dashboard">
              <Button>Add a Course</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Week Stats Bar */}
          <div className="flex flex-wrap items-center gap-4 px-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>
                Total this week:{" "}
                <span className="font-bold text-foreground">
                  {Math.floor(totalWeekMinutes / 60)}h {totalWeekMinutes % 60}m
                </span>
              </span>
            </div>
            <div className="h-4 w-px bg-border" />
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <BookOpen className="w-4 h-4" />
              <span>
                <span className="font-bold text-foreground">{schedule.length}</span> course{schedule.length !== 1 ? "s" : ""}
              </span>
            </div>
            <div className="h-4 w-px bg-border" />
            {/* Course legend */}
            <div className="flex items-center gap-3 flex-wrap">
              {schedule.map((item) => {
                const color = courseColorMap.get(item.courseId)
                return (
                  <div key={item.courseId} className="flex items-center gap-1.5 text-sm">
                    <div className={`w-2.5 h-2.5 rounded-full ${color?.dot}`} />
                    <span className="text-muted-foreground">{item.courseName}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Timetable Grid */}
          <div className="grid grid-cols-7 gap-3">
            {weekDates.map((date) => {
              const dateKey = date.toDateString()
              const cells = timetable.get(dateKey) || []
              const todayCol = isToday(date)
              const pastDay = isPast(date) && !todayCol
              const dayMinutes = cells.reduce((sum, c) => sum + (c.isExamDay ? 0 : c.minutes), 0)

              return (
                <div
                  key={dateKey}
                  className={`rounded-xl border transition-all duration-300 flex flex-col min-h-[340px] ${
                    todayCol
                      ? "border-primary/50 bg-primary/5 shadow-lg shadow-primary/10 ring-1 ring-primary/20"
                      : pastDay
                        ? "border-border/50 bg-muted/30 opacity-60"
                        : "border-border bg-card hover:border-primary/20 hover:shadow-sm"
                  }`}
                >
                  {/* Day Header */}
                  <div className={`px-3 py-3 border-b text-center ${
                    todayCol ? "border-primary/20 bg-primary/10" : "border-border/50"
                  }`}>
                    <p className={`text-xs font-semibold uppercase tracking-widest ${
                      todayCol ? "text-primary" : "text-muted-foreground"
                    }`}>
                      {formatDay(date)}
                    </p>
                    <p className={`text-lg font-bold ${todayCol ? "text-primary" : "text-foreground"}`}>
                      {formatDate(date)}
                    </p>
                    {todayCol && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-wide mt-1">
                        Today
                      </span>
                    )}
                    {!pastDay && dayMinutes > 0 && (
                      <p className="text-[11px] text-muted-foreground mt-1">
                        {dayMinutes} min total
                      </p>
                    )}
                  </div>

                  {/* Day Content */}
                  <div className="flex-1 p-2 space-y-2 overflow-y-auto">
                    {pastDay && cells.length === 0 ? (
                      <div className="flex items-center justify-center h-full">
                        <p className="text-xs text-muted-foreground/50 italic">Past</p>
                      </div>
                    ) : cells.length === 0 ? (
                      <div className="flex items-center justify-center h-full">
                        <p className="text-xs text-muted-foreground/50 italic">Rest day</p>
                      </div>
                    ) : (
                      cells.map((cell, idx) => {
                        const color = courseColorMap.get(cell.courseId)
                        return (
                          <div
                            key={`${cell.courseId}-${idx}`}
                            className={`rounded-lg p-2.5 bg-gradient-to-br ${color?.bg} ${color?.border} border transition-all duration-200 hover:scale-[1.02] group`}
                          >
                            {/* Course name */}
                            <div className="flex items-start gap-1.5 mb-1.5">
                              <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${color?.dot}`} />
                              <p className="text-xs font-bold text-foreground leading-tight truncate" title={cell.courseName}>
                                {cell.courseName}
                              </p>
                            </div>

                            {cell.isExamDay ? (
                              <div className="flex items-center gap-1 mt-1">
                                <AlertCircle className="w-3 h-3 text-destructive" />
                                <span className="text-[10px] font-bold text-destructive uppercase tracking-wide">
                                  Exam Day!
                                </span>
                              </div>
                            ) : (
                              <>
                                {/* Time */}
                                <div className="flex items-center gap-1 text-muted-foreground mb-1.5">
                                  <Clock className="w-3 h-3" />
                                  <span className="text-[11px] font-medium">{cell.minutes} min</span>
                                </div>

                                {/* Mastery bar */}
                                <div className="space-y-0.5">
                                  <div className="flex items-center justify-between">
                                    <span className="text-[10px] text-muted-foreground">Mastery</span>
                                    <span className="text-[10px] font-semibold text-foreground">{Math.round(cell.masteryScore)}%</span>
                                  </div>
                                  <Progress value={cell.masteryScore} className="h-1" />
                                </div>

                                {/* Study button */}
                                {todayCol && (
                                  <Link href={`/study/${cell.courseId}`} className="block mt-2">
                                    <Button 
                                      size="sm" 
                                      className="w-full h-7 text-[11px] gap-1 opacity-80 group-hover:opacity-100 transition-opacity"
                                    >
                                      Study
                                      <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
                                    </Button>
                                  </Link>
                                )}
                              </>
                            )}
                          </div>
                        )
                      })
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Priority Legend */}
          <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground pt-2">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded border-2 border-primary/50 bg-primary/10" />
              <span>Today</span>
            </div>
            <div className="flex items-center gap-1.5">
              <AlertCircle className="w-3 h-3 text-destructive" />
              <span>Exam Day</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-3 h-3" />
              <span>Study time auto-allocated by priority</span>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
