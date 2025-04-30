'use client'

import React, { useState } from 'react'
import Link from 'next/link'

export default function TransportationPage() {
  const [searchQuery, setSearchQuery] = useState('')

  const transportOptions = [
    {
      id: 'public-transport',
      name: 'Public Transport',
      description: 'Efficient and affordable way to travel around Latvia',
      options: [
        {
          title: 'Buses and Trams',
          description: 'Efficient network in major cities with regular schedules'
        },
        {
          title: 'Trains',
          description: 'Connecting major cities and towns across Latvia'
        },
        {
          title: 'Tickets',
          description: 'Electronic ticket system (e-talons) available at kiosks and online'
        },
        {
          title: 'Mobile Apps',
          description: 'Real-time schedules and ticket purchasing'
        }
      ]
    },
    {
      id: 'car-bike-rental',
      name: 'Car & Bike Rental',
      description: 'Flexible options for independent travel',
      options: [
        {
          title: 'Car Rental',
          description: 'International and local companies available at airports and cities'
        },
        {
          title: 'Bike Rental',
          description: 'City bike stations and rental shops in major cities'
        },
        {
          title: 'Electric Scooters',
          description: 'Available in Riga and other major cities'
        },
        {
          title: 'Taxis',
          description: 'Reliable taxi services with mobile apps for booking'
        }
      ]
    }
  ]

  const filteredOptions = transportOptions.filter(option =>
    option.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    option.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <section className="relative h-[40vh] bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
        <div className="absolute inset-0 overflow-hidden bg-gray-200 dark:bg-gray-700">{/* Placeholder for background image */}</div>
        <div className="relative z-10 text-center">
          <h1 className="text-5xl md:text-6xl font-light text-gray-900 dark:text-white">Getting Around</h1>
          <p className="mt-4 text-xl text-gray-700 dark:text-gray-200">Transportation options in Latvia</p>
        </div>
      </section>

      {/* Search Section */}
      <section className="py-8 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <input
              type="text"
              placeholder="Search transportation options..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
            />
          </div>
        </div>
      </section>

      {/* Transport Options Grid */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {filteredOptions.map((option) => (
              <div
                key={option.id}
                className="group border border-gray-200 dark:border-gray-700 rounded-md p-6 hover:shadow-md transition-shadow bg-white dark:bg-gray-800"
              >
                <h3 className="text-xl font-medium mb-2 text-gray-900 dark:text-white">{option.name}</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">{option.description}</p>
                <div className="space-y-4">
                  {option.options.map((item, index) => (
                    <div key={index}>
                      <h4 className="font-medium text-gray-900 dark:text-white">{item.title}</h4>
                      <p className="text-gray-600 dark:text-gray-300">{item.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
} 