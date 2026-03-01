'use client'

import { useState, useTransition } from 'react'
import { saveOpenRouterKey, savePreferredModel } from '@/actions/settings'

interface SettingsClientProps {
  initialSettings: {
    hasApiKey: boolean
    preferredModel: string | null
    onboardingCompleted: boolean
  }
}

export default function SettingsClient({ initialSettings }: SettingsClientProps) {
  const [apiKey, setApiKey] = useState('')
  const [hasApiKey, setHasApiKey] = useState(initialSettings.hasApiKey)
  const [model, setModel] = useState(initialSettings.preferredModel ?? '')
  const [isPending, startTransition] = useTransition()
  const [apiKeyMessage, setApiKeyMessage] = useState<string | null>(null)
  const [modelMessage, setModelMessage] = useState<string | null>(null)

  function handleSaveApiKey() {
    if (!apiKey.trim()) return
    setApiKeyMessage(null)
    startTransition(async () => {
      try {
        await saveOpenRouterKey(apiKey)
        setHasApiKey(true)
        setApiKey('')
        setApiKeyMessage('API key saved successfully.')
      } catch {
        setApiKeyMessage('Failed to save API key.')
      }
    })
  }

  function handleSaveModel() {
    const trimmed = model.trim()
    if (!trimmed) return
    if (!trimmed.includes('/')) {
      setModelMessage('Model ID should be in the format "provider/model-name" (e.g., "anthropic/claude-sonnet-4").')
      return
    }
    setModelMessage(null)
    startTransition(async () => {
      try {
        await savePreferredModel(trimmed)
        setModelMessage('Model preference saved successfully.')
      } catch {
        setModelMessage('Failed to save model preference.')
      }
    })
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
      <p className="text-gray-600 mb-8">
        Configure your API key and preferred model for resume generation.
      </p>

      <div className="space-y-8">
        {/* API Key Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-1">OpenRouter API Key</h2>
          <p className="text-sm text-gray-500 mb-4">
            Your API key is used to call AI models via OpenRouter.
          </p>

          {hasApiKey && (
            <div className="mb-4 flex items-center gap-2">
              <span className="text-sm text-gray-600">Current key:</span>
              <span className="text-sm font-mono text-gray-500">{'••••••••'}</span>
              <span className="inline-block px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded">
                Active
              </span>
            </div>
          )}

          <div className="flex gap-3">
            <input
              type="text"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder={hasApiKey ? 'Enter new key to replace' : 'Enter your OpenRouter API key'}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isPending}
            />
            <button
              type="button"
              onClick={handleSaveApiKey}
              disabled={isPending || !apiKey.trim()}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? 'Saving...' : 'Save'}
            </button>
          </div>

          {apiKeyMessage && (
            <p className="mt-2 text-sm text-green-600">{apiKeyMessage}</p>
          )}
        </div>

        {/* Model Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-1">Preferred Model</h2>
          <p className="text-sm text-gray-500 mb-4">
            Choose the AI model for resume generation. Browse available models at{' '}
            <a
              href="https://openrouter.ai/models"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              openrouter.ai/models
            </a>
            .
          </p>

          <div className="flex gap-3">
            <input
              type="text"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder="anthropic/claude-sonnet-4"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isPending}
            />
            <button
              type="button"
              onClick={handleSaveModel}
              disabled={isPending || !model.trim()}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? 'Saving...' : 'Save'}
            </button>
          </div>

          {modelMessage && (
            <p className={`mt-2 text-sm ${modelMessage.includes('successfully') ? 'text-green-600' : 'text-red-600'}`}>
              {modelMessage}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
