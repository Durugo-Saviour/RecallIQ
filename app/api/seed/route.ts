import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST() {
  try {
    const supabase = createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Idempotent: delete existing courses (cascade will handle sessions, results, mastery)
    const { error: deleteError } = await supabase
      .from('courses')
      .delete()
      .eq('user_id', user.id)
      
    if (deleteError) throw deleteError

    // Helper to add days
    const addDays = (days: number) => {
      const d = new Date()
      d.setDate(d.getDate() + days)
      return d.toISOString()
    }

    // 1. Insert Courses
    const coursesToInsert = [
      { user_id: user.id, name: "Organic Chemistry", exam_date: addDays(12), difficulty: 5 },
      { user_id: user.id, name: "Calculus II", exam_date: addDays(18), difficulty: 4 },
      { user_id: user.id, name: "Microeconomics", exam_date: addDays(7), difficulty: 3 },
      { user_id: user.id, name: "World History", exam_date: addDays(25), difficulty: 2 },
      { user_id: user.id, name: "Computer Networks", exam_date: addDays(5), difficulty: 4 },
    ]

    const { data: courses, error: coursesError } = await supabase
      .from('courses')
      .insert(coursesToInsert)
      .select()

    if (coursesError) throw coursesError

    // 2. Insert Mastery Scores
    const masteryToInsert = [
      { user_id: user.id, course_id: courses[0].id, score: 35, sessions_completed: 4 },
      { user_id: user.id, course_id: courses[1].id, score: 72, sessions_completed: 8 },
      { user_id: user.id, course_id: courses[2].id, score: 58, sessions_completed: 3 },
      { user_id: user.id, course_id: courses[3].id, score: 81, sessions_completed: 2 },
      { user_id: user.id, course_id: courses[4].id, score: 29, sessions_completed: 5 },
    ]

    const { error: masteryError } = await supabase
      .from('mastery_scores')
      .insert(masteryToInsert)

    if (masteryError) throw masteryError

    // 3. Insert Study Sessions & Results
    // We will generate a few realistic sessions
    for (let i = 0; i < 10; i++) {
      const course = courses[i % courses.length]
      
      const { data: session, error: sessionError } = await supabase
        .from('study_sessions')
        .insert({
          course_id: course.id,
          user_id: user.id,
          topic: `Chapter ${Math.floor(Math.random() * 10) + 1} Review`,
          questions: [
            { question: "Q1?", expectedKeywords: [] },
            { question: "Q2?", expectedKeywords: [] },
            { question: "Q3?", expectedKeywords: [] },
            { question: "Q4?", expectedKeywords: [] },
            { question: "Q5?", expectedKeywords: [] }
          ]
        })
        .select()
        .single()

      if (sessionError) throw sessionError

      // Insert results for this session
      const resultsToInsert = []
      for (let j = 0; j < 5; j++) {
        // Random score between 40 and 90
        const score = Math.floor(Math.random() * (90 - 40 + 1) + 40)
        resultsToInsert.push({
          session_id: session.id,
          user_id: user.id,
          question: `Q${j+1}?`,
          user_answer: "Sample answer...",
          score: score,
          feedback: "Good attempt.",
          topic: session.topic
        })
      }

      await supabase.from('recall_results').insert(resultsToInsert)
    }

    return NextResponse.json({ success: true, message: "Seed completed successfully" })

  } catch (error: any) {
    console.error("Seed error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
