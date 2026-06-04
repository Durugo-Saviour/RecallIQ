import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RiskBadge } from "./RiskBadge"
import Link from "next/link"
import { getDaysUntil } from "@/lib/utils"

import { DeleteCourseButton } from "./DeleteCourseButton"

interface CourseCardProps {
  course: {
    id: string
    name: string
    exam_date: string
    mastery_scores: { score: number }[]
  }
}

export function CourseCard({ course }: CourseCardProps) {
  const score = course.mastery_scores?.[0]?.score ?? 0
  const roundedScore = Math.round(score)
  const daysUntil = Math.max(0, getDaysUntil(course.exam_date))

  return (
    <Card className="flex flex-col h-full relative group">
      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
        <DeleteCourseButton courseId={course.id} courseName={course.name} />
      </div>
      <CardHeader className="pb-2 pt-6">
        <div className="flex justify-between items-start gap-4">
          <CardTitle className="text-xl line-clamp-2 pr-6">{course.name}</CardTitle>
          <RiskBadge score={roundedScore} />
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="flex flex-col gap-2 mt-4">
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Mastery</span>
            <span className="font-bold">{roundedScore}%</span>
          </div>
          <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
            <div 
              className="bg-primary h-full transition-all" 
              style={{ width: `${roundedScore}%` }}
            />
          </div>
          
          <div className="flex justify-between items-center text-sm mt-4">
            <span className="text-muted-foreground">Exam in</span>
            <span className="font-medium">{daysUntil} days</span>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Link href={`/study/${course.id}`} className="w-full">
          <Button className="w-full">Study Now</Button>
        </Link>
      </CardFooter>
    </Card>
  )
}
