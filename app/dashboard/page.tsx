import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { CourseCard } from "@/components/CourseCard"
import { AddCourseModal } from "@/components/AddCourseModal"
import { getDaysUntil } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"

export default async function DashboardPage() {
  const supabase = createClient()
  
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    redirect("/auth/login")
  }

  // Fetch courses with their mastery scores
  // Because of RLS, we only get the user's courses
  const { data: courses, error } = await supabase
    .from('courses')
    .select(`
      id,
      name,
      exam_date,
      difficulty,
      mastery_scores ( score )
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error("Error fetching courses:", error)
  }

  // Calculate summary stats
  const totalCourses = courses?.length || 0
  
  let averageMastery = 0
  let daysToNearest = Infinity
  
  if (totalCourses > 0) {
    const totalScore = courses!.reduce((acc, course) => {
      return acc + (course.mastery_scores?.[0]?.score || 0)
    }, 0)
    averageMastery = Math.round(totalScore / totalCourses)
    
    courses!.forEach(course => {
      if (course.exam_date) {
        const days = getDaysUntil(course.exam_date)
        if (days >= 0 && days < daysToNearest) {
          daysToNearest = days
        }
      }
    })
  }

  const isPro = user.user_metadata?.is_pro === true

  return (
    <div className="container py-8 max-w-6xl mx-auto space-y-8">
      {/* Welcome Header */}
      <div className="flex justify-between items-center bg-card p-6 rounded-xl border">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Welcome back!</h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-muted-foreground text-sm">{user.email}</span>
            {isPro ? (
              <span className="bg-gradient-to-r from-yellow-500 via-amber-500 to-orange-500 text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-sm select-none">
                Pro Member
              </span>
            ) : (
              <span className="bg-muted text-muted-foreground text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider select-none">
                Free Plan
              </span>
            )}
          </div>
        </div>
        {!isPro && (
          <Link href="/pricing">
            <Button size="sm" className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white border-0 font-semibold shadow-sm">
              Upgrade to Pro
            </Button>
          </Link>
        )}
      </div>

      {/* Summary Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card p-6 rounded-lg border flex flex-col justify-center items-center">
          <span className="text-sm text-muted-foreground font-medium">Total Courses</span>
          <span className="text-4xl font-bold mt-2">{totalCourses}</span>
        </div>
        <div className="bg-card p-6 rounded-lg border flex flex-col justify-center items-center">
          <span className="text-sm text-muted-foreground font-medium">Average Mastery</span>
          <span className="text-4xl font-bold mt-2 text-primary">{averageMastery}%</span>
        </div>
        <div className="bg-card p-6 rounded-lg border flex flex-col justify-center items-center">
          <span className="text-sm text-muted-foreground font-medium">Nearest Exam</span>
          <span className="text-4xl font-bold mt-2">
            {daysToNearest === Infinity ? "-" : `${daysToNearest} days`}
          </span>
        </div>
      </div>

      <div>
        <p className="text-muted-foreground text-sm italic mb-4">
          "RecallIQ doesn't ask did you study? — it asks can you prove it?"
        </p>
        
        {totalCourses === 0 ? (
          <div className="text-center py-20 bg-card rounded-lg border border-dashed flex flex-col items-center">
            <h3 className="text-xl font-semibold mb-2">No courses yet</h3>
            <p className="text-muted-foreground mb-6">Add your first course to get started.</p>
            <AddCourseModal>
              <Button>
                <Plus className="h-4 w-4 mr-2" /> Add Course
              </Button>
            </AddCourseModal>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses!.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        )}
      </div>

      {totalCourses > 0 && <AddCourseModal />}
    </div>
  )
}
