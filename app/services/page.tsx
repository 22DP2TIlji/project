'use client'
import React, { useReducer } from 'react'

import { MapPin, Calendar, Compass, Users, Briefcase, Phone } from "lucide-react"

export default function Services() {
  return (
    <>
      <section className="relative h-[40vh] bg-gray-100 flex items-center justify-center">
        <div className="absolute inset-0 overflow-hidden bg-gray-200">{/* Placeholder for background image */}</div>
        <div className="relative z-10 text-center">
          <h1 className="text-5xl md:text-6xl font-light">Our Services</h1>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-light mb-8 text-center">How We Can Help You Experience Latvia</h2>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="p-6 border border-gray-200 rounded-md">
                <div className="flex items-center mb-4">
                  <MapPin className="w-5 h-5 mr-2" />
                  <h3 className="text-xl font-medium">Custom Itineraries</h3>
                </div>
                <p>
                  Personalized travel plans tailored to your interests, timeframe, and budget, highlighting Latvia's
                  best offerings.
                </p>
              </div>

              <div className="p-6 border border-gray-200 rounded-md">
                <div className="flex items-center mb-4">
                  <Calendar className="w-5 h-5 mr-2" />
                  <h3 className="text-xl font-medium">Tour Booking</h3>
                </div>
                <p>
                  Hassle-free booking for guided tours, activities, and experiences throughout Latvia with local
                  experts.
                </p>
              </div>

              <div className="p-6 border border-gray-200 rounded-md">
                <div className="flex items-center mb-4">
                  <Compass className="w-5 h-5 mr-2" />
                  <h3 className="text-xl font-medium">Transportation</h3>
                </div>
                <p>
                  Arrangements for all your transportation needs, from airport transfers to intercity travel across
                  Latvia.
                </p>
              </div>

              <div className="p-6 border border-gray-200 rounded-md">
                <div className="flex items-center mb-4">
                  <Users className="w-5 h-5 mr-2" />
                  <h3 className="text-xl font-medium">Group Tours</h3>
                </div>
                <p>
                  Scheduled group tours to Latvia's most popular destinations with expert guides and like-minded
                  travelers.
                </p>
              </div>

              <div className="p-6 border border-gray-200 rounded-md">
                <div className="flex items-center mb-4">
                  <Briefcase className="w-5 h-5 mr-2" />
                  <h3 className="text-xl font-medium">Business Travel</h3>
                </div>
                <p>
                  Specialized services for business travelers, including meeting arrangements and corporate retreats in
                  Latvia.
                </p>
              </div>

              <div className="p-6 border border-gray-200 rounded-md">
                <div className="flex items-center mb-4">
                  <Phone className="w-5 h-5 mr-2" />
                  <h3 className="text-xl font-medium">24/7 Support</h3>
                </div>
                <p>
                  Round-the-clock assistance during your trip to Latvia, ensuring a smooth and worry-free experience.
                </p>
              </div>
            </div>

            <div className="mt-12 p-8 bg-gray-50 rounded-md text-center">
              <h3 className="text-xl font-medium mb-4">Ready to Plan Your Latvian Adventure?</h3>
              <p className="mb-6">
                Contact us today to discuss how we can help create your perfect Latvian experience.
              </p>
              <a
                href="/contact"
                className="inline-block px-6 py-3 bg-gray-800 text-white rounded-md hover:bg-gray-700 transition-colors"
              >
                Get in Touch
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

