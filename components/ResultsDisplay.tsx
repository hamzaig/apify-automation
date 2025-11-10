'use client'

interface ResultsDisplayProps {
  results: {
    success: number
    failed: number
    total: number
  }
  downloadUrl: string | null
  fileName: string
}

export default function ResultsDisplay({ results, downloadUrl, fileName }: ResultsDisplayProps) {
  const handleDownload = () => {
    if (downloadUrl) {
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = `processed_${fileName}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const successRate = results.total > 0 ? ((results.success / results.total) * 100).toFixed(1) : '0'

  return (
    <div>
      <h3 className="text-xl font-semibold text-gray-800 mb-6">Processing Complete!</h3>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-green-700">{results.success}</div>
          <div className="text-sm text-green-600">Emails Found</div>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-red-700">{results.failed}</div>
          <div className="text-sm text-red-600">Not Found</div>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-blue-700">{successRate}%</div>
          <div className="text-sm text-blue-600">Success Rate</div>
        </div>
      </div>

      {/* Download Button */}
      {downloadUrl && (
        <button
          onClick={handleDownload}
          className="w-full py-3 px-6 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-lg shadow-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center space-x-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          <span>Download Processed File</span>
        </button>
      )}
    </div>
  )
}

