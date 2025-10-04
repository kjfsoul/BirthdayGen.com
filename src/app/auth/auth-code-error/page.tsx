export default function AuthCodeErrorPage() {
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
          <a
            href="/auth"
            className="inline-block bg-purple-600 text-white px-6 py-2 rounded-md hover:bg-purple-700 transition-colors"
          >
            Back to Sign In
          </a>
        </div>
      </div>
    </div>
  )
}
