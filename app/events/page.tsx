'use client'

import React, { useState } from 'react'
import Link from 'next/link'

const EVENTS = [
  {
    id: 'song-festival',
    name: 'Latvian Song and Dance Festival',
    date: 'July 2025',
    location: 'Rīga',
    description: 'The Latvian Song and Dance Celebration is a massive cultural event held every five years. Thousands of singers and dancers from across Latvia perform traditional songs and dances.',
    highlights: ['UNESCO Intangible Cultural Heritage', 'Thousands of participants', 'Week-long celebration'],
    image: '/images/song-festival.jpg'
  },
  {
    id: 'riga-festival',
    name: 'Rīga Festival',
    date: 'June',
    location: 'Rīga',
    description: 'Annual cultural festival featuring music, theater, and art. The festival brings together local and international artists for a vibrant celebration of culture.',
    highlights: ['Music concerts', 'Theater performances', 'Art exhibitions'],
    image: '/images/riga-festival.jpg'
  },
  {
    id: 'christmas-markets',
    name: 'Christmas Markets',
    date: 'December',
    location: 'Rīga',
    description: 'Traditional Christmas markets in the heart of Rīga\'s Old Town. Handcrafted gifts, Latvian delicacies, and festive atmosphere.',
    highlights: ['Handmade crafts', 'Traditional food', 'Festive entertainment'],
    image: '/images/christmas-markets.jpg'
  }
]

export default function EventsPage() {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredEvents = EVENTS.filter(event =>
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
          <h1 className="text-5xl md:text-6xl font-light text-gray-900 dark:text-white">Events in Latvia</h1>
          <p className="mt-4 text-xl text-gray-700 dark:text-gray-200">Discover festivals and events across Latvia</p>
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
