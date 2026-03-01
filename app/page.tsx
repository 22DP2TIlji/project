"use client"

import Link from "next/link"
import RandomPlace from "@/components/random-place"

export default function Home() {
  return (
    <>
      <section className="relative h-[70vh] bg-gray-100 flex items-center justify-center">
        <div className="absolute inset-0 overflow-hidden bg-gray-200" />
        <div className="relative z-10 text-center">
          <h1 className="text-5xl md:text-6xl font-light mb-4">Discover Latvia</h1>
          <p className="text-xl md:text-2xl font-light mb-8">
            Plan your perfect trip through Latvia
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="md:col-span-2">
              <div className="border border-gray-200 p-8 md:p-12 rounded-md text-center">
                <h2 className="text-3xl font-light mb-4">
                  We help you organize your journey
                </h2>
                <Link
                  href="/destinations"
                  className="inline-block mt-6 px-6 py-3 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Explore destinations
                </Link>
              </div>
            </div>
            <div>
              <RandomPlace />
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
