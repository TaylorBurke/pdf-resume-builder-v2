import { describe, it, expect, vi, beforeAll, afterAll, afterEach } from 'vitest'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

const server = setupServer(
  http.post('https://openrouter.ai/api/v1/chat/completions', async () => {
    return HttpResponse.json({
      choices: [
        {
          message: {
            content: JSON.stringify({ result: 'test response' }),
          },
        },
      ],
    })
  })
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('OpenRouter Client', () => {
  it('callOpenRouter sends request and returns content string', async () => {
    const { callOpenRouter } = await import('@/lib/ai/openrouter')
    const result = await callOpenRouter({
      apiKey: 'test-key',
      model: 'anthropic/claude-sonnet-4',
      messages: [{ role: 'user', content: 'test prompt' }],
    })
    expect(typeof result).toBe('string')
    expect(result).toContain('test response')
  })

  it('callOpenRouter throws on missing API key', async () => {
    const { callOpenRouter } = await import('@/lib/ai/openrouter')
    await expect(
      callOpenRouter({
        apiKey: '',
        model: 'anthropic/claude-sonnet-4',
        messages: [{ role: 'user', content: 'test' }],
      })
    ).rejects.toThrow('OpenRouter API key is required')
  })

  it('callOpenRouterJSON parses JSON response', async () => {
    const { callOpenRouterJSON } = await import('@/lib/ai/openrouter')
    const result = await callOpenRouterJSON<{ result: string }>({
      apiKey: 'test-key',
      model: 'anthropic/claude-sonnet-4',
      messages: [{ role: 'user', content: 'test' }],
    })
    expect(result).toEqual({ result: 'test response' })
  })

  it('callOpenRouterJSON handles markdown code blocks', async () => {
    server.use(
      http.post('https://openrouter.ai/api/v1/chat/completions', async () => {
        return HttpResponse.json({
          choices: [{
            message: {
              content: '```json\n{"wrapped": true}\n```',
            },
          }],
        })
      })
    )
    const { callOpenRouterJSON } = await import('@/lib/ai/openrouter')
    const result = await callOpenRouterJSON<{ wrapped: boolean }>({
      apiKey: 'test-key',
      model: 'test-model',
      messages: [{ role: 'user', content: 'test' }],
    })
    expect(result).toEqual({ wrapped: true })
  })
})
