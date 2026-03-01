'use client'

interface TemplateSelectorProps {
  selectedTemplate: string
  onSelect: (templateId: string) => void
}

const TEMPLATES = [
  {
    id: 'clean',
    name: 'Clean',
    description: 'Simple and professional layout with clear sections.',
  },
  {
    id: 'bold',
    name: 'Bold',
    description: 'Strong headings and accent colors for impact.',
  },
  {
    id: 'executive',
    name: 'Executive',
    description: 'Elegant design suited for senior-level positions.',
  },
]

export default function TemplateSelector({ selectedTemplate, onSelect }: TemplateSelectorProps) {
  return (
    <div>
      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Template</h3>
      <div className="grid grid-cols-3 gap-3">
        {TEMPLATES.map((template) => (
          <button
            key={template.id}
            type="button"
            onClick={() => onSelect(template.id)}
            className={`p-3 rounded-lg border-2 text-left transition-colors ${
              selectedTemplate === template.id
                ? 'border-blue-600 bg-blue-50 dark:border-blue-500 dark:bg-blue-950'
                : 'border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600'
            }`}
          >
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{template.name}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{template.description}</p>
          </button>
        ))}
      </div>
    </div>
  )
}
