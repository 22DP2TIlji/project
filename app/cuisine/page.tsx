'use client'

import React, { useState } from 'react'
import Link from 'next/link'

export default function CuisinePage() {
  const [searchQuery, setSearchQuery] = useState('')

  const dishes = [
    {
      id: 'rye-bread',
      name: 'Rye Bread',
      description: 'Traditional dark rye bread, a staple of Latvian cuisine.',
      details: [
        'Made with rye flour',
        'Served with butter or cheese',
        'Used in many traditional dishes'
      ],
      image: '/images/rye-bread.jpg'
    },
    {
      id: 'grey-peas',
      name: 'Grey Peas with Bacon',
      description: 'Classic Latvian dish, often served during celebrations.',
      details: [
        'Traditional Christmas dish',
        'Made with local grey peas',
        'Served with smoked bacon'
      ],
      image: '/images/grey-peas.jpg'
    },
    {
      id: 'black-balsam',
      name: 'Riga Black Balsam',
      description: 'Traditional herbal liqueur, perfect as a souvenir.',
      details: [
        'Made with 24 natural ingredients',
        'Used in cocktails and desserts',
        'Believed to have medicinal properties'
      ],
      image: '/images/black-balsam.jpg'
    }
  ]

  const places = [
    {
      id: 'restaurants',
      name: 'Traditional Restaurants',
      description: 'Experience authentic Latvian cuisine in these restaurants',
      options: [
        'Lido - chain of traditional restaurants',
        'Folkklubs Ala Pagrabs - authentic atmosphere',
        '1221 Restaurant - modern take on traditional dishes'
      ]
    },
    {
      id: 'markets',
      name: 'Food Markets',
      description: 'Find fresh local produce and traditional foods',
      options: [
        'Riga Central Market - largest in Europe',
        'Agenskalns Market - local specialties',
        'Farmers\' markets in various cities'
      ]
    }
  ]

  const filteredDishes = dishes.filter(dish =>
    dish.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    dish.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <section className="relative h-[40vh] bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
        <div className="absolute inset-0 overflow-hidden bg-gray-200 dark:bg-gray-700">{/* Placeholder for background image */}</div>
        <div className="relative z-10 text-center">
          <h1 className="text-5xl md:text-6xl font-light text-gray-900 dark:text-white">Vietējā virtuve</h1>
          <p className="mt-4 text-xl text-gray-700 dark:text-gray-200">Atklājiet tradicionālos latviešu ēdienus</p>
        </div>
      </section>

      {/* Search Section */}
      <section className="py-8 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <input
              type="text"
              placeholder="Meklēt ēdienus..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
            />
          </div>
        </div>
      </section>

      {/* Dishes Grid */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredDishes.map((dish) => (
              <div
                key={dish.id}
                className="group border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden hover:shadow-md transition-shadow bg-white dark:bg-gray-800"
              >
                <div className="relative h-48 bg-gray-200 dark:bg-gray-700">
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 to-transparent"></div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-xl font-medium text-white">{dish.name}</h3>
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-gray-600 dark:text-gray-300 mb-4">{dish.description}</p>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Detaļas</h4>
                    <ul className="list-disc list-inside text-gray-600 dark:text-gray-300">
                      {dish.details.map((detail, index) => (
                        <li key={index}>{detail}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Where to Try Section */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-light mb-8 text-center text-gray-900 dark:text-white">Kur pagaršot?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {places.map((place) => (
              <div
                key={place.id}
                className="group border border-gray-200 dark:border-gray-700 rounded-md p-6 hover:shadow-md transition-shadow bg-white dark:bg-gray-800"
              >
                <h3 className="text-xl font-medium mb-2 text-gray-900 dark:text-white">{place.name}</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">{place.description}</p>
                <ul className="list-disc list-inside text-gray-600 dark:text-gray-300">
                  {place.options.map((option, index) => (
                    <li key={index}>{option}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
} 