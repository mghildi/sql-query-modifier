// app/review/page.tsx
import React from 'react'
import Link from 'next/link'

export default async function ReviewPage() {
  // … your existing fetch + review logic …

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Review Submissions</h1>
        <Link href="/submissions">
          <button className="bg-gray-600 text-white px-3 py-1 rounded">
            Back to Submissions
          </button>
        </Link>
      </div>

      {/* … your approval UI … */}
    </div>
  )
}
