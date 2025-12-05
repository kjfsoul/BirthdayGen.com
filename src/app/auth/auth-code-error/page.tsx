'use client'

import { useSearchParams } from 'react-router-dom'
import { Suspense } from 'react'

function ErrorContent() {
  const [searchParams] = useSearchParams()
  const error = searchParams.get('error') || null
  const errorDescription = searchParams.get('error_description') || null

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md mx-auto text-center">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Authentication Error
          </h1>
          <p className="text-gray-600 mb-6">
            There was a problem signing you in. Please try again or contact support if the issue persists.
          </p>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md text-left">
              <p className="text-sm font-semibold text-red-800 mb-1">Error Details:</p>
              <p className="text-sm text-red-700">
                <span className="font-medium">Type:</span> {error}
              </p>
              {errorDescription && (
                <p className="text-sm text-red-700 mt-1">
                  <span className="font-medium">Description:</span> {errorDescription}
                </p>
              )}
            </div>
          )}

          <div className="space-y-3">
            <a
              href="/auth"
              className="block bg-purple-600 text-white px-6 py-2 rounded-md hover:bg-purple-700 transition-colors"
            >
              Back to Sign In
            </a>

            <p className="text-xs text-gray-500 mt-4">
              Common issues:
              <br />• Redirect URLs not configured in Supabase
              <br />• OAuth provider settings incorrect
              <br />• Expired or invalid auth code
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AuthCodeErrorPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ErrorContent />
    </Suspense>
  )
}
