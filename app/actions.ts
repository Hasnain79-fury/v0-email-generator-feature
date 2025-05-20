"use server"

import { generateText } from "ai"
import { createOpenRouter } from "@openrouter/ai-sdk-provider"

type EmailParams = {
  context: string
  purpose: string
  tone: string
  recipient: string
  language: string
}

export async function generateEmail({ context, purpose, tone, recipient, language }: EmailParams): Promise<string> {
  const recipientText = recipient ? `to ${recipient}` : ""

  // Create OpenRouter provider instance
  const openrouter = createOpenRouter({
    apiKey: process.env.OPENROUTER_API_KEY!,
  })

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

  try {
    const { text } = await generateText({
      model: openrouter.chat("qwen/qwen3-0.6b-04-28:free"),
      system: systemPrompt,
      prompt: userPrompt,
      temperature: 0.7,
      maxTokens: 1000,
    })

    return text
  } catch (error) {
    console.error("Error generating email:", error)
    throw new Error("Failed to generate email")
  }
}
