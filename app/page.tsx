'use client'

import Link from 'next/link'
import React from 'react'
import Image from 'next/image'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6">
      <h1 className="text-4xl font-bold mb-6 text-blue-300">
        SQL Query Management Tool
      </h1>

      <div className="space-x-4 mb-10">
        <Link href="/submissions">
          <button className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-lg hover:opacity-90">
            Go to Submissions
          </button>
        </Link>
        <Link href="/review">
          <button className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-lg hover:opacity-90">
            Go to Review
          </button>
        </Link>
      </div>

      <Image
        src="/qaw.png"
        alt="Preview"
        width={428}
        height={328}
        className="rounded-lg shadow-lg"
      />
    </div>
  )
}
