"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"
import { Plus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function AddCourseModal({ children }: { children?: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [examDate, setExamDate] = useState("")
  const [difficulty, setDifficulty] = useState("3")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data: userData, error: userError } = await supabase.auth.getUser()
      if (userError || !userData.user) throw new Error("Not authenticated")

      const diffInt = parseInt(difficulty)
      if (diffInt < 1 || diffInt > 5) throw new Error("Difficulty must be between 1 and 5")

      // Insert course
      const { data: course, error: courseError } = await supabase
        .from('courses')
        .insert({
          user_id: userData.user.id,
          name,
          exam_date: examDate,
          difficulty: diffInt
        })
        .select()
        .single()

      if (courseError) throw courseError

      // Insert mastery score
      const { error: masteryError } = await supabase
        .from('mastery_scores')
        .insert({
          user_id: userData.user.id,
          course_id: course.id,
          score: 0,
          sessions_completed: 0
        })

      if (masteryError) throw masteryError

      toast({
        title: "Course added",
        description: `${name} has been added to your dashboard.`,
      })
      
      setOpen(false)
      setName("")
      setExamDate("")
      setDifficulty("3")
      router.refresh()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children ? children : (
          <Button className="fixed bottom-8 right-8 rounded-full h-14 w-14 shadow-xl p-0 z-50 bg-primary text-primary-foreground hover:scale-105 transition-transform">
            <Plus className="h-6 w-6" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add New Course</DialogTitle>
            <DialogDescription>
              Enter the details for the course you want to study.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Course Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Organic Chemistry"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="date">Exam Date</Label>
              <Input
                id="date"
                type="date"
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="difficulty">Difficulty (1-5)</Label>
              <Input
                id="difficulty"
                type="number"
                min="1"
                max="5"
                step="1"
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground">
                1 is easiest, 5 is hardest. This helps us prioritize your study schedule.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Adding..." : "Add Course"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
