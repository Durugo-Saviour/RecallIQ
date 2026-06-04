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

    const { sessionId, courseId, answers } = await request.json()
    if (!sessionId || !courseId || !answers || !Array.isArray(answers)) {
      return NextResponse.json({ error: "Invalid request payload" }, { status: 400 })
    }

    // Get the session to make sure it exists and belongs to the user
    const { data: session, error: sessionError } = await supabase
      .from('study_sessions')
      .select('topic')
      .eq('id', sessionId)
      .eq('user_id', user.id)
      .single()

    if (sessionError || !session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 })
    }

    const promptText = answers.map((a: any, i: number) => `
Answer ${i+1}:
Question: "${a.question}"
Expected keywords: ${JSON.stringify(a.expectedKeywords)}
Student answer: "${a.userAnswer}"
`).join('\n')

    let gradedResults = []

    try {
      const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
        generationConfig: { responseMimeType: "application/json" }
      })

      const prompt = `You are a strict and helpful examiner grading an exam. Grade the student's answers. Return ONLY a valid JSON array, no markdown, no explanation.

Grade these 5 answers and return a JSON array of exactly 5 objects.

${promptText}

For the feedback string, provide two things separated by a double newline:
1. "Corrections:" Specific corrections to their answer.
2. "Better way to RECALL:" A specific technique (e.g. an analogy, a mnemonic, or a visualization) to help them remember this exact concept easily in the future.

Return this exact structure:
[
  { "score": <0-100>, "feedback": "Corrections: ... \\n\\nBetter way to RECALL: ..." }
]`

      const response = await model.generateContent(prompt)
      const text = response.response.text()
      gradedResults = JSON.parse(text.replace(/```json|```/g, "").trim())
      
      if (!Array.isArray(gradedResults) || gradedResults.length !== answers.length) {
        throw new Error("Invalid format from AI")
      }
    } catch (aiError: any) {
      console.error("AI Evaluation Error:", aiError)
      throw new Error("Failed to evaluate exam answers. Please check your Gemini API key or try again.")
    }

    // Insert results into DB
    let totalScore = 0
    const resultsToInsert = answers.map((a: any, i: number) => {
      const score = Math.round(gradedResults[i].score || 0)
      totalScore += score
      return {
        session_id: sessionId,
        user_id: user.id,
        question: a.question,
        user_answer: a.userAnswer,
        score,
        feedback: gradedResults[i].feedback,
        topic: session.topic
      }
    })

    const { data: insertedResults, error: insertError } = await supabase
      .from('recall_results')
      .insert(resultsToInsert)
      .select()

    if (insertError) throw insertError

    // Calculate session average
    const sessionScore = Math.round(totalScore / answers.length)

    // Update mastery score
    const { data: currentMastery, error: masteryError } = await supabase
      .from('mastery_scores')
      .select('score, sessions_completed')
      .eq('user_id', user.id)
      .eq('course_id', courseId)
      .single()

    const oldMastery = currentMastery ? currentMastery.score : 50
    const sessionsCompleted = currentMastery ? currentMastery.sessions_completed : 0
    
    // Exam mode gives more weight to mastery updates (0.6 instead of 0.3)
    const newMastery = Math.round((oldMastery * 0.4) + (sessionScore * 0.6))

    const { error: upsertError } = await supabase
      .from('mastery_scores')
      .upsert({
        user_id: user.id,
        course_id: courseId,
        score: newMastery,
        sessions_completed: sessionsCompleted + 1,
        last_updated: new Date().toISOString()
      }, { onConflict: 'user_id, course_id' })

    if (upsertError) throw upsertError

    return NextResponse.json({
      sessionScore,
      results: insertedResults,
      newMastery,
      oldMastery
    })

  } catch (error: any) {
    console.error("Evaluate error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
