'use client'

import { useState, useTransition, useCallback, useEffect, useRef } from 'react'
import { saveOpenRouterKey, savePreferredModel } from '@/actions/settings'

interface SettingsClientProps {
  initialSettings: {
    hasApiKey: boolean
    preferredModel: string | null
    onboardingCompleted: boolean
  }
}

type ModelStatus = 'idle' | 'validating' | 'valid' | 'invalid'

export default function SettingsClient({ initialSettings }: SettingsClientProps) {
  const [apiKey, setApiKey] = useState('')
  const [hasApiKey, setHasApiKey] = useState(initialSettings.hasApiKey)
  const [model, setModel] = useState(initialSettings.preferredModel ?? '')
  const [isPending, startTransition] = useTransition()
  const [apiKeyMessage, setApiKeyMessage] = useState<string | null>(null)
  const [modelMessage, setModelMessage] = useState<string | null>(null)
  const [modelStatus, setModelStatus] = useState<ModelStatus>(
    initialSettings.preferredModel ? 'valid' : 'idle'
  )
  const [modelDisplayName, setModelDisplayName] = useState<string | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null)

  const validateModel = useCallback(async (modelId: string) => {
    const trimmed = modelId.trim()
    if (!trimmed) {
      setModelStatus('idle')
      setModelMessage(null)
      setModelDisplayName(null)
      return
    }
    if (!trimmed.includes('/')) {
      setModelStatus('invalid')
      setModelMessage('Model ID should be in the format "provider/model-name".')
      setModelDisplayName(null)
      return
    }

    setModelStatus('validating')
    setModelMessage(null)
    setModelDisplayName(null)

    try {
      const res = await fetch(`https://openrouter.ai/api/v1/models/${trimmed}`)
      if (res.ok) {
        const data = await res.json()
        setModelStatus('valid')
        setModelDisplayName(data?.data?.name ?? trimmed)
        setModelMessage(null)
      } else {
        setModelStatus('invalid')
        setModelMessage(`Model "${trimmed}" not found on OpenRouter.`)
      }
    } catch {
      setModelStatus('invalid')
      setModelMessage('Could not validate model. Check your connection.')
    }
  }, [])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (!model.trim()) {
      setModelStatus('idle')
      setModelMessage(null)
      setModelDisplayName(null)
      return
    }
    debounceRef.current = setTimeout(() => validateModel(model), 500)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [model, validateModel])

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
    if (!trimmed || modelStatus !== 'valid') return
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

  const modelInputBorder =
    modelStatus === 'valid'
      ? 'border-green-500 focus:ring-green-500'
      : modelStatus === 'invalid'
        ? 'border-red-500 focus:ring-red-500'
        : 'border-gray-300 focus:ring-blue-500'

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
            <div className="relative flex-1">
              <input
                type="text"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="anthropic/claude-sonnet-4"
                className={`w-full px-3 py-2 pr-9 border rounded-lg text-sm focus:outline-none focus:ring-2 ${modelInputBorder}`}
                disabled={isPending}
              />
              {modelStatus === 'validating' && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2">
                  <svg className="w-4 h-4 animate-spin text-gray-400" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                </span>
              )}
              {modelStatus === 'valid' && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </span>
              )}
              {modelStatus === 'invalid' && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={handleSaveModel}
              disabled={isPending || modelStatus !== 'valid'}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? 'Saving...' : 'Save'}
            </button>
          </div>

          {modelDisplayName && modelStatus === 'valid' && !modelMessage && (
            <p className="mt-2 text-sm text-green-600">{modelDisplayName}</p>
          )}
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
