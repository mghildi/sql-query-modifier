// app/page.tsx
'use client'

import Link from 'next/link'
import React from 'react'

export default function HomePage() {
  return (
    <div className="p-6 max-w-3xl mx-auto text-center">
      <h1 className="text-3xl font-bold mb-6">Welcome to SQL Query Modifier</h1>
      <Link href="/submissions">
        <button className="bg-blue-600 text-white px-5 py-3 rounded-lg hover:bg-blue-700">
          Go to Submissions
        </button>
      </Link>
    </div>
  )
}
