import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function DELETE(
  request: Request,
  { params }: { params: { courseId: string } }
) {
  try {
    const supabase = createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const courseId = params.courseId

    // To delete a course, we must first delete all related records 
    // since ON DELETE CASCADE is not set up on the foreign keys.

    // 1. Delete all recall_results associated with sessions of this course
    // First, find all sessions for this course
    const { data: sessions } = await supabase
      .from('study_sessions')
      .select('id')
      .eq('course_id', courseId)
      .eq('user_id', user.id)

    if (sessions && sessions.length > 0) {
      const sessionIds = sessions.map(s => s.id)
      await supabase
        .from('recall_results')
        .delete()
        .in('session_id', sessionIds)
        .eq('user_id', user.id)
    }

    // 2. Delete study_sessions
    await supabase
      .from('study_sessions')
      .delete()
      .eq('course_id', courseId)
      .eq('user_id', user.id)

    // 3. Delete mastery_scores
    await supabase
      .from('mastery_scores')
      .delete()
      .eq('course_id', courseId)
      .eq('user_id', user.id)

    // 4. Finally, delete the course itself
    const { error: deleteCourseError } = await supabase
      .from('courses')
      .delete()
      .eq('id', courseId)
      .eq('user_id', user.id)

    if (deleteCourseError) {
      throw deleteCourseError
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error deleting course:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
