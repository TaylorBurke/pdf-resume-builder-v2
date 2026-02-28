'use client'

interface ProgressBarProps {
  currentStep: number
  totalSteps: number
}

export default function ProgressBar({ currentStep, totalSteps }: ProgressBarProps) {
  return (
    <div className="w-full mb-8">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-gray-700">Profile Setup</span>
        <span className="text-sm text-gray-500">
          {currentStep} of {totalSteps}
        </span>
      </div>
      <div
        className="flex gap-1.5"
        role="progressbar"
        aria-valuenow={currentStep}
        aria-valuemin={1}
        aria-valuemax={totalSteps}
        data-completed={currentStep - 1}
      >
        {Array.from({ length: totalSteps }, (_, i) => {
          const stepIndex = i + 1
          let colorClass = 'bg-gray-200' // remaining
          if (stepIndex < currentStep) {
            colorClass = 'bg-blue-600' // completed
          } else if (stepIndex === currentStep) {
            colorClass = 'bg-blue-300' // current
          }
          return (
            <div
              key={i}
              className={`h-2 flex-1 rounded-full ${colorClass}`}
              data-step={stepIndex}
              data-status={
                stepIndex < currentStep
                  ? 'completed'
                  : stepIndex === currentStep
                    ? 'current'
                    : 'remaining'
              }
            />
          )
        })}
      </div>
    </div>
  )
}
