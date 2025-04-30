'use client'

import React, { useState } from 'react'
import Link from 'next/link'

export default function WeatherPage() {
  const [searchQuery, setSearchQuery] = useState('')

  const seasons = [
    {
      id: 'spring',
      name: 'Spring (March - May)',
      description: 'Mild temperatures, perfect for exploring cities and nature awakening',
      temperature: '5-15°C',
      activities: ['City tours', 'Nature walks', 'Cultural events'],
      packing: ['Light jacket', 'Umbrella', 'Comfortable walking shoes']
    },
    {
      id: 'summer',
      name: 'Summer (June - August)',
      description: 'Warm and sunny, ideal for beach visits and outdoor activities',
      temperature: '15-25°C',
      activities: ['Beach holidays', 'Festivals', 'Outdoor sports'],
      packing: ['Summer clothes', 'Sunscreen', 'Swimwear']
    },
    {
      id: 'autumn',
      name: 'Autumn (September - November)',
      description: 'Colorful foliage, perfect for nature walks and cultural events',
      temperature: '5-15°C',
      activities: ['Nature photography', 'Cultural events', 'Mushroom picking'],
      packing: ['Warm layers', 'Rain gear', 'Hiking boots']
    }
  ]

  const filteredSeasons = seasons.filter(season =>
    season.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    season.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <section className="relative h-[40vh] bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
        <div className="absolute inset-0 overflow-hidden bg-gray-200 dark:bg-gray-700">{/* Placeholder for background image */}</div>
        <div className="relative z-10 text-center">
          <h1 className="text-5xl md:text-6xl font-light text-gray-900 dark:text-white">Weather in Latvia</h1>
          <p className="mt-4 text-xl text-gray-700 dark:text-gray-200">Plan your visit with current weather conditions</p>
        </div>
      </section>

      {/* Search Section */}
      <section className="py-8 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <input
              type="text"
              placeholder="Search seasons..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
            />
          </div>
        </div>
      </section>

      {/* Seasons Grid */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredSeasons.map((season) => (
              <div
                key={season.id}
                className="group border border-gray-200 dark:border-gray-700 rounded-md p-6 hover:shadow-md transition-shadow bg-white dark:bg-gray-800"
              >
                <h3 className="text-xl font-medium mb-2 text-gray-900 dark:text-white">{season.name}</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">{season.description}</p>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">Average Temperature</h4>
                    <p className="text-gray-600 dark:text-gray-300">{season.temperature}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">Best Activities</h4>
                    <ul className="list-disc list-inside text-gray-600 dark:text-gray-300">
                      {season.activities.map((activity, index) => (
                        <li key={index}>{activity}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">What to Pack</h4>
                    <ul className="list-disc list-inside text-gray-600 dark:text-gray-300">
                      {season.packing.map((item, index) => (
                        <li key={index}>{item}</li>
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