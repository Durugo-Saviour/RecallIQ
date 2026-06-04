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

    const { courseId, notes } = await request.json()
    if (!courseId || !notes) {
      return NextResponse.json({ error: "Missing courseId or notes" }, { status: 400 })
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

      const prompt = `You are an expert professor and examiner. Generate exactly 5 comprehensive, exam-like questions based on the following notes provided by the student, as well as your general knowledge of the course "${course.name}".

Student Notes:
"""
${notes.substring(0, 3000)} // Truncating to avoid massive payloads
"""

Important: The questions should be challenging and test deep understanding, application, or synthesis of the concepts, not just simple definition recall.

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
      console.error("AI Exam Generation Error:", aiError)
      throw new Error(`Failed to generate exam: ${aiError.message || 'Unknown error'}`)
    }

    // Insert into study_sessions
    // We prefix the topic with "Exam Mode" to distinguish it in the DB
    const { data: session, error: sessionError } = await supabase
      .from('study_sessions')
      .insert({
        course_id: courseId,
        user_id: user.id,
        topic: "Exam Mode: Comprehensive Review",
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
