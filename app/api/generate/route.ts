import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { createOpenRouter } from "@openrouter/ai-sdk-provider"

export async function POST(request: NextRequest) {
  try {
    const { context, purpose, tone, recipient, language } = await request.json()

    if (!context || !purpose) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Create OpenRouter provider instance
    const openrouter = createOpenRouter({
      apiKey: process.env.OPENROUTER_API_KEY!,
    })

    const recipientText = recipient ? `to ${recipient}` : ""

    const systemPrompt = `You are an expert email writer. Your task is to write a professional, well-structured email based on the context provided.
    
    Guidelines:
    - Write in ${language} language
    - Use a ${tone} tone
    - Create a clear subject line
    - Include appropriate greeting and sign-off
    - Be concise but comprehensive
    - Format the email properly with spacing between sections
    - Do not include any explanations or notes outside the email content itself`

    const userPrompt = `Write a ${purpose} email ${recipientText} with the following context:
    
    ${context}`

    const { text } = await generateText({
      model: openrouter.chat("qwen/qwen3-0.6b-04-28:free"),
      system: systemPrompt,
      prompt: userPrompt,
      temperature: 0.7,
      maxTokens: 1000,
    })

    return NextResponse.json({ email: text })
  } catch (error) {
    console.error("Error generating email:", error)
    return NextResponse.json({ error: "Failed to generate email" }, { status: 500 })
  }
}
