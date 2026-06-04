import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"

const apiKey = process.env.GEMINI_API_KEY || ""
const genAI = new GoogleGenerativeAI(apiKey)

export async function POST(request: Request) {
  try {
    const supabase = createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { courseId, topic } = await request.json()
    if (!courseId || !topic) {
      return NextResponse.json({ error: "Missing courseId or topic" }, { status: 400 })
    }

    // Get course name
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('name')
      .eq('id', courseId)
      .single()

    if (courseError || !course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 })
    }

    let parsedQuestions = []
    
    try {
      const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
        generationConfig: { responseMimeType: "application/json" }
      })

      const prompt = `You are a study assistant. Generate exactly 5 active recall questions for a student who just studied "${topic}" in the course "${course.name}".
Important: Make sure at least one or two of the questions ask the student to apply the concept to a "real-world scenario" or "practical application" so they can learn how it is actually used.

Return ONLY a valid JSON array, no markdown, no explanation.
Return this exact JSON structure:
[
  { "question": "...", "expectedKeywords": ["keyword1", "keyword2", "keyword3"] }
]`

      const response = await model.generateContent(prompt)
      const text = response.response.text()
      parsedQuestions = JSON.parse(text.replace(/```json|```/g, "").trim())
      
      if (!Array.isArray(parsedQuestions) || parsedQuestions.length !== 5) {
        throw new Error("Invalid format from AI")
      }
    } catch (aiError: any) {
      console.error("AI Generation Error:", aiError)
      throw new Error(`Failed to generate questions: ${aiError.message || 'Unknown error'}`)
    }

    // Insert into study_sessions
    const { data: session, error: sessionError } = await supabase
      .from('study_sessions')
      .insert({
        course_id: courseId,
        user_id: user.id,
        topic: topic,
        questions: parsedQuestions
      })
      .select()
      .single()

    if (sessionError) {
      throw sessionError
    }

    return NextResponse.json({ sessionId: session.id })
  } catch (error: any) {
    console.error("Generate error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
