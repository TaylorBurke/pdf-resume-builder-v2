interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

interface OpenRouterRequest {
  apiKey: string
  model: string
  messages: ChatMessage[]
  temperature?: number
  maxTokens?: number
}

interface OpenRouterResponse {
  choices: {
    message: {
      content: string
    }
  }[]
}

export async function callOpenRouter({
  apiKey,
  model,
  messages,
  temperature = 0.7,
  maxTokens = 4096,
}: OpenRouterRequest): Promise<string> {
  if (!apiKey) {
    throw new Error('OpenRouter API key is required')
  }

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      'X-Title': 'Resume Builder',
    },
    body: JSON.stringify({
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`OpenRouter API error (${response.status}): ${error}`)
  }

  const data: OpenRouterResponse = await response.json()
  return data.choices[0].message.content
}

export async function callOpenRouterJSON<T>({
  apiKey,
  model,
  messages,
  temperature = 0.3,
  maxTokens = 4096,
}: OpenRouterRequest): Promise<T> {
  const content = await callOpenRouter({
    apiKey,
    model,
    messages,
    temperature,
    maxTokens,
  })

  // Extract JSON from response (handle markdown code blocks)
  const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/)
  const jsonString = jsonMatch ? jsonMatch[1].trim() : content.trim()

  try {
    return JSON.parse(jsonString) as T
  } catch {
    throw new Error(`Failed to parse AI response as JSON: ${content.slice(0, 200)}`)
  }
}
