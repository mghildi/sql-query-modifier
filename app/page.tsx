'use client'

import Link from 'next/link'
import React from 'react'
import Image from 'next/image'

export default function HomePage() {
  return (
    <div className="p-6 max-w-3xl mx-auto text-center">
      <h1 className="text-3xl font-bold mb-6">Welcome to SQL Query Modifier</h1>

      <div className="space-x-4 mb-8">
        <Link href="/submissions">
          <button className="bg-gray-200 text-gray-800 px-5 py-3 rounded-lg hover:bg-gray-300 active:bg-blue-500 active:text-white">
            Go to Submissions
          </button>
        </Link>
        <Link href="/review">
          <button className="bg-gray-200 text-gray-800 px-5 py-3 rounded-lg hover:bg-gray-300 active:bg-blue-500 active:text-white">
            Go to Review
          </button>
        </Link>
      </div>

      
        <Image
          src="/qaw.png"
          alt="My Logo"
          width={428}
          height={328}
          className="p-6 max-w-3xl mx-auto text-center"
          
        />

      

    </div>
  )
}
