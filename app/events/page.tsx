'use client'

import React, { useState } from 'react'
import Link from 'next/link'

export default function EventsPage() {
  const [searchQuery, setSearchQuery] = useState('')

  const events = [
    {
      id: 'song-festival',
      name: 'Song and Dance Festival',
      date: 'July 2024',
      location: 'Riga',
      description: 'The largest cultural event in Latvia, featuring thousands of performers.',
      highlights: [
        'Traditional folk songs and dances',
        'Grand finale at Mežaparks',
        'UNESCO Intangible Cultural Heritage'
      ],
      image: '/images/song-festival.jpg'
    },
    {
      id: 'riga-festival',
      name: 'Riga City Festival',
      date: 'August 2024',
      location: 'Riga',
      description: 'Celebration of Riga\'s birthday with concerts, markets, and fireworks.',
      highlights: [
        'Street performances',
        'Food and craft markets',
        'Fireworks display'
      ],
      image: '/images/riga-festival.jpg'
    },
    {
      id: 'christmas-markets',
      name: 'Christmas Markets',
      date: 'December 2024',
      location: 'Various cities',
      description: 'Traditional Christmas markets with local crafts and food.',
      highlights: [
        'Handmade crafts',
        'Traditional food and drinks',
        'Christmas concerts'
      ],
      image: '/images/christmas-markets.jpg'
    }
  ]

  const filteredEvents = events.filter(event =>
    event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <section className="relative h-[40vh] bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
        <div className="absolute inset-0 overflow-hidden bg-gray-200 dark:bg-gray-700">{/* Placeholder for background image */}</div>
        <div className="relative z-10 text-center">
          <h1 className="text-5xl md:text-6xl font-light text-gray-900 dark:text-white">Events & Festivals</h1>
          <p className="mt-4 text-xl text-gray-700 dark:text-gray-200">Discover cultural events and festivals in Latvia</p>
        </div>
      </section>

      {/* Search Section */}
      <section className="py-8 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <input
              type="text"
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
            />
          </div>
        </div>
      </section>

      {/* Events Grid */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredEvents.map((event) => (
              <div
                key={event.id}
                className="group border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden hover:shadow-md transition-shadow bg-white dark:bg-gray-800"
              >
                <div className="relative h-48 bg-gray-200 dark:bg-gray-700">
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 to-transparent"></div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-xl font-medium text-white">{event.name}</h3>
                    <p className="text-gray-200">{event.date} - {event.location}</p>
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-gray-600 dark:text-gray-300 mb-4">{event.description}</p>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Highlights</h4>
                    <ul className="list-disc list-inside text-gray-600 dark:text-gray-300">
                      {event.highlights.map((highlight, index) => (
                        <li key={index}>{highlight}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
} 