'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import Link from 'next/link'
import { Heart, MapPin, Trash2 } from 'lucide-react'

export default function SavedPage() {
  const router = useRouter()
  const { user, removeSavedDestination, removeSavedItinerary } = useAuth()
  const [activeTab, setActiveTab] = useState<'destinations' | 'itineraries'>('destinations')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Redirect if not logged in
    if (!user) {
      router.push('/login')
    }
  }, [user, router])

  const handleRemoveDestination = async (destinationId: string) => {
    setIsLoading(true)
    try {
      await removeSavedDestination(destinationId)
    } catch (error) {
      console.error('Error removing destination:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemoveItinerary = async (itineraryId: string) => {
    setIsLoading(true)
    try {
      await removeSavedItinerary(itineraryId)
    } catch (error) {
      console.error('Error removing itinerary:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!user) {
    return null // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
              Saved Items
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
              View and manage your saved destinations and itineraries.
            </p>
          </div>
          
          <div className="px-4 py-5 sm:p-6">
            {/* Tabs */}
            <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab('destinations')}
                  className={`${
                    activeTab === 'destinations'
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                >
                  Destinations
                </button>
                <button
                  onClick={() => setActiveTab('itineraries')}
                  className={`${
                    activeTab === 'itineraries'
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                >
                  Itineraries
                </button>
              </nav>
            </div>

            {/* Content */}
            {activeTab === 'destinations' ? (
              <div>
                {user.savedDestinations && user.savedDestinations.length > 0 ? (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {user.savedDestinations.map((destinationId) => (
                      <div 
                        key={destinationId}
                        className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 flex items-start justify-between"
                      >
                        <div className="flex items-start">
                          <MapPin className="h-5 w-5 text-blue-500 dark:text-blue-400 mt-0.5 mr-2" />
                          <div>
                            <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                              {destinationId}
                            </h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              Saved destination
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveDestination(destinationId)}
                          disabled={isLoading}
                          className="text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Heart className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No saved destinations</h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      Get started by saving some destinations you're interested in.
                    </p>
                    <div className="mt-6">
                      <Link
                        href="/destinations"
                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Browse Destinations
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div>
                {user.savedItineraries && user.savedItineraries.length > 0 ? (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {user.savedItineraries.map((itinerary) => (
                      <div 
                        key={itinerary.id}
                        className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4"
                      >
                        <div className="flex justify-between items-start">
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                            {itinerary.name || 'Unnamed Itinerary'}
                          </h4>
                          <button
                            onClick={() => handleRemoveItinerary(itinerary.id)}
                            disabled={isLoading}
                            className="text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {itinerary.description || 'No description available'}
                        </p>
                        <div className="mt-3 flex justify-end">
                          <Link
                            href={`/itinerary?id=${itinerary.id}`}
                            className="text-xs text-blue-600 hover:text-blue-500 dark:text-blue-400"
                          >
                            View Details
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <MapPin className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No saved itineraries</h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      Create and save your travel itineraries to see them here.
                    </p>
                    <div className="mt-6">
                      <Link
                        href="/itinerary"
                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Create Itinerary
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 