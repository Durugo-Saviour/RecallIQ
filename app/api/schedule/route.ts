import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { differenceInDays } from "date-fns"

export async function GET() {
  try {
    const supabase = createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: courses, error } = await supabase
      .from('courses')
      .select(`
        id,
        name,
        exam_date,
        difficulty,
        mastery_scores ( score )
      `)

    if (error) throw error

    const schedule = courses.map((course) => {
      const daysUntilExam = Math.max(0, differenceInDays(new Date(course.exam_date), new Date()))
      
      // Calculate Urgency: maxes out at 1 when <= 7 days away
      // Avoid division by zero if daysUntilExam is 0
      const urgency = Math.min(1, 7 / (daysUntilExam === 0 ? 0.1 : daysUntilExam))
      
      const masteryScore = course.mastery_scores?.[0]?.score || 0
      const mastery_gap = (100 - masteryScore) / 100
      
      // difficulty is 1-5, so dividing by 5 gives 0-1
      const priority = (course.difficulty / 5 * 0.35) + (mastery_gap * 0.45) + (urgency * 0.20)
      
      const recommendedMinutes = Math.min(120, Math.round(priority * 120))

      return {
        courseId: course.id,
        courseName: course.name,
        daysUntilExam,
        masteryScore,
        priorityScore: priority,
        recommendedMinutes,
      }
    })

    // Sort descending by priority
    schedule.sort((a, b) => b.priorityScore - a.priorityScore)

    return NextResponse.json({ schedule })
  } catch (error: any) {
    console.error("Schedule error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
