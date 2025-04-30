'use client'
import React, { useReducer } from 'react'

import Link from "next/link"

export default function Footer() {
  return (
    <footer className="w-full py-8 border-t border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm">
      <div className="container mx-auto px-4">
        <div className="text-center text-sm text-gray-600 dark:text-gray-400">
          <p className="mb-2">All rights reserved.</p>
          <p>
            Created with{" "}
            <Link href="https://www.webnode.com" className="underline hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              Webnode
            </Link>{" "}
            •{" "}
            <Link href="/cookies" className="underline hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              Cookie Policy
            </Link>
          </p>
        </div>
      </div>
    </footer>
  )
}
