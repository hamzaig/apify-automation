'use client'

interface ProgressTrackerProps {
  progress: {
    current: number
    total: number
    currentUrl: string
  }
}

export default function ProgressTracker({ progress }: ProgressTrackerProps) {
  const hasProgress = progress.total > 0
  const percentage = hasProgress ? (progress.current / progress.total) * 100 : 0

  return (
    <div>
      <h3 className="text-xl font-semibold text-gray-800 mb-4">Processing Progress</h3>
      <div className="space-y-4">
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">
              {hasProgress ? (
                <>Processing {progress.current} of {progress.total} profiles</>
              ) : (
                <>Processing your file...</>
              )}
            </span>
            {hasProgress && (
              <span className="text-sm font-medium text-gray-700">
                {Math.round(percentage)}%
              </span>
            )}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            {hasProgress ? (
              <div
                className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full rounded-full transition-all duration-300 ease-out"
                style={{ width: `${percentage}%` }}
              />
            ) : (
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full rounded-full animate-pulse" style={{ width: '60%' }} />
            )}
          </div>
        </div>
        {progress.currentUrl && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800 truncate">
              <span className="font-medium">Current:</span> {progress.currentUrl}
            </p>
          </div>
        )}
        {!hasProgress && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              Please wait while we process your LinkedIn profiles. This may take a few minutes...
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

