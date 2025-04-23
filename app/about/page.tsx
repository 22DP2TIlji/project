'use client'
import React, { useReducer } from 'react'

export default function About() {
  return (
    <>
      <section className="relative h-[40vh] bg-gray-100 flex items-center justify-center">
        <div className="absolute inset-0 overflow-hidden bg-gray-200">{/* Placeholder for background image */}</div>
        <div className="relative z-10 text-center">
          <h1 className="text-5xl md:text-6xl font-light">About Us</h1>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="mb-12">
              <h2 className="text-3xl font-light mb-6">Our Story</h2>
              <p className="mb-4">
                Founded by passionate Latvian travel enthusiasts, Travellatvia began with a simple mission: to share the
                hidden treasures of our beautiful country with the world. What started as a small blog documenting our
                favorite local spots has grown into a comprehensive travel service.
              </p>
              
            </div>

            <div className="relative h-80 mb-12 rounded-md overflow-hidden bg-gray-200">
              {/* Placeholder for image */}
            </div>

            <div className="mb-12">
              <h2 className="text-3xl font-light mb-6">Our Philosophy</h2>
              <p className="mb-4">
                We believe travel should be transformative, educational, and sustainable. Every itinerary we create aims
                to connect travelers with authentic Latvian experiences while respecting our environment and supporting
                local communities.
              </p>
              <p>
                Whether you're seeking a cultural deep-dive into Riga's historic streets, a peaceful retreat in our
                pristine forests, or an adventure along our Baltic coastline, we're committed to making your Latvian
                journey unforgettable.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

