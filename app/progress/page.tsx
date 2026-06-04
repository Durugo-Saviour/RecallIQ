"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { format } from "date-fns"
import { Loader2, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function ProgressPage() {
  const [loading, setLoading] = useState(true)
  const [chartData, setChartData] = useState<any[]>([])
  const [recentSessions, setRecentSessions] = useState<any[]>([])
  const [weakTopics, setWeakTopics] = useState<any[]>([])
  const supabase = createClient()

  useEffect(() => {
    async function fetchProgress() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Fetch courses and their latest mastery
      const { data: courses } = await supabase
        .from('courses')
        .select(`
          id,
          name,
          mastery_scores ( score )
        `)
      
      if (courses) {
        const dataForChart = courses.map(c => ({
          name: c.name,
          mastery: Math.round(c.mastery_scores?.[0]?.score || 0)
        }))
        setChartData(dataForChart)
      }

      // Fetch recent sessions from recall_results
      // Wait, sessions have studied_at, but we can get them from study_sessions joined with recall_results
      // Simpler: fetch from recall_results, group by session
      const { data: results } = await supabase
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
        // Process recent sessions
        const sessionMap = new Map()
        results.forEach(r => {
          if (!sessionMap.has(r.session_id)) {
            sessionMap.set(r.session_id, {
              id: r.session_id,
              topic: r.topic,
              courseName: (r as any).study_sessions?.courses?.name || "Unknown Course",
              date: r.created_at,
              totalScore: 0,
              count: 0
            })
          }
          const s = sessionMap.get(r.session_id)
          s.totalScore += r.score
          s.count += 1
        })

        const formattedSessions = Array.from(sessionMap.values()).map(s => ({
          ...s,
          averageScore: Math.round(s.totalScore / s.count)
        })).slice(0, 10) // Top 10 recent

        setRecentSessions(formattedSessions)

        // Process weak topics (at least 2 attempts)
        const topicMap = new Map()
        results.forEach(r => {
          if (!topicMap.has(r.topic)) {
            topicMap.set(r.topic, { topic: r.topic, totalScore: 0, count: 0, courseName: (r as any).study_sessions?.courses?.name })
          }
          const t = topicMap.get(r.topic)
          t.totalScore += r.score
          t.count += 1
        })

        const weak = Array.from(topicMap.values())
          .filter(t => t.count >= 2)
          .map(t => ({
            topic: t.topic,
            courseName: t.courseName,
            averageScore: Math.round(t.totalScore / t.count)
          }))
          .sort((a, b) => a.averageScore - b.averageScore)
          .slice(0, 5)

        setWeakTopics(weak)
      }

      setLoading(false)
    }

    fetchProgress()
  }, [])

  if (loading) return <div className="container py-20 text-center"><Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" /></div>

  return (
    <div className="container py-8 max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Your Progress</h1>
        <p className="text-muted-foreground">Track your mastery and identify knowledge gaps.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Course Mastery</CardTitle>
              <CardDescription>Your current mastery score for each course.</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" />
                    <XAxis 
                      dataKey="name" 
                      tick={{ fill: 'hsl(var(--muted-foreground))' }} 
                      tickLine={false} 
                      axisLine={false}
                    />
                    <YAxis 
                      domain={[0, 100]} 
                      tick={{ fill: 'hsl(var(--muted-foreground))' }} 
                      tickLine={false} 
                      axisLine={false}
                      tickFormatter={(value) => `${value}%`}
                    />
                    <Tooltip 
                      cursor={{ fill: 'hsl(var(--muted))', opacity: 0.2 }}
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                    />
                    <Bar dataKey="mastery" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  No courses added yet.
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Study Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              {recentSessions.length > 0 ? (
                <div className="space-y-4">
                  {recentSessions.map(session => (
                    <Link
                      href={`/results/${session.id}`}
                      key={session.id}
                      className="flex justify-between items-center p-4 rounded-lg bg-muted/30 border hover:bg-muted transition-colors cursor-pointer group"
                    >
                      <div>
                        <div className="font-medium group-hover:text-primary transition-colors">{session.topic}</div>
                        <div className="text-sm text-muted-foreground">{session.courseName} • {format(new Date(session.date), 'MMM d, yyyy')}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-xl font-bold">{session.averageScore}%</div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No study sessions completed yet.
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Weak Topics</CardTitle>
              <CardDescription>Topics you've studied multiple times but still struggle with.</CardDescription>
            </CardHeader>
            <CardContent>
              {weakTopics.length > 0 ? (
                <div className="space-y-4">
                  {weakTopics.map((topic, i) => (
                    <div key={i} className="flex flex-col space-y-1 pb-4 border-b last:border-0 last:pb-0">
                      <div className="flex justify-between items-start">
                        <span className="font-medium text-sm leading-tight">{topic.topic}</span>
                        <span className="text-destructive font-bold text-sm ml-4">{topic.averageScore}%</span>
                      </div>
                      <span className="text-xs text-muted-foreground">{topic.courseName}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  Not enough data yet. Keep studying!
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
