'use client'

import { useState } from 'react'
import FileUpload from '@/components/FileUpload'
import TokenInput from '@/components/TokenInput'
import ProgressTracker from '@/components/ProgressTracker'
import ResultsDisplay from '@/components/ResultsDisplay'

export default function Home() {
  const [file, setFile] = useState<File | null>(null)
  const [apifyToken, setApifyToken] = useState<string>('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState({ current: 0, total: 0, currentUrl: '' })
  const [results, setResults] = useState<{ success: number; failed: number; total: number } | null>(null)
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile)
    setError(null)
    setResults(null)
    setDownloadUrl(null)
  }

  const handleTokenChange = (token: string) => {
    setApifyToken(token)
    setError(null)
  }

  const handleProcess = async () => {
    if (!file) {
      setError('Please select an XLSX file')
      return
    }

    if (!apifyToken.trim()) {
      setError('Please enter your Apify token')
      return
    }

    setIsProcessing(true)
    setError(null)
    setResults(null)
    setDownloadUrl(null)
    setProgress({ current: 0, total: 0, currentUrl: '' })

    const formData = new FormData()
    formData.append('file', file)
    formData.append('apifyToken', apifyToken)

    try {
      const response = await fetch('/api/process', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to process file')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      setDownloadUrl(url)

      // Get results from response headers if available
      const successCount = parseInt(response.headers.get('X-Success-Count') || '0')
      const failedCount = parseInt(response.headers.get('X-Failed-Count') || '0')
      const totalCount = parseInt(response.headers.get('X-Total-Count') || '0')

      setResults({
        success: successCount,
        failed: failedCount,
        total: totalCount,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while processing the file')
    } finally {
      setIsProcessing(false)
      setProgress({ current: 0, total: 0, currentUrl: '' })
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            LinkedIn Email Extractor
          </h1>
          <p className="text-lg text-gray-600">
            Extract emails from LinkedIn profiles using Apify
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          {/* File Upload Section */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Upload XLSX File
            </h2>
            <FileUpload onFileSelect={handleFileSelect} disabled={isProcessing} />
            {file && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800">
                  <span className="font-medium">Selected:</span> {file.name} ({(file.size / 1024).toFixed(2)} KB)
                </p>
              </div>
            )}
          </div>

          {/* Token Input Section */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Apify Token
            </h2>
            <TokenInput
              value={apifyToken}
              onChange={handleTokenChange}
              disabled={isProcessing}
            />
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Process Button */}
          <button
            onClick={handleProcess}
            disabled={isProcessing || !file || !apifyToken.trim()}
            className="w-full py-3 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg shadow-lg hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
          >
            {isProcessing ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : (
              'Process File'
            )}
          </button>
        </div>

        {/* Progress Tracker */}
        {isProcessing && (
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <ProgressTracker progress={progress} />
          </div>
        )}

        {/* Results Display */}
        {results && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <ResultsDisplay
              results={results}
              downloadUrl={downloadUrl}
              fileName={file?.name || 'processed_file.xlsx'}
            />
          </div>
        )}
      </div>
    </main>
  )
}

