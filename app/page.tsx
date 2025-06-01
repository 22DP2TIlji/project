"use client"
import React, { useEffect, useState, useMemo } from 'react'
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import type { Destination } from "@/lib/types"; // Assuming you have a types file for Destination

interface LikedDestination {
  id: string
  name: string
}

export default function Home() {
  const { user, isAuthenticated, removeSavedDestination } = useAuth(); // Get user and remove function
  const [allDestinations, setAllDestinations] = useState<Destination[]>([]); // State to hold all destinations
  const [isLoading, setIsLoading] = useState(true); // State for loading indicator
  const [darkMode, setDarkMode] = useState(false)

  console.log('Home page rendered. User:', user, 'IsAuthenticated:', isAuthenticated);

  useEffect(() => {
    console.log('Home page useEffect running');
    // Fetch all destinations when the component mounts
    const fetchDestinations = async () => {
      try {
        const response = await fetch('/api/destinations');
        if (response.ok) {
          const data = await response.json();
          console.log('Fetched all destinations:', data.destinations);
          setAllDestinations(data.destinations);
        } else {
          console.error('Failed to fetch destinations:', response.statusText);
          setAllDestinations([]);
        }
      } catch (error) {
        console.error('Error fetching destinations:', error);
        setAllDestinations([]);
      }
       setIsLoading(false);
    };

    fetchDestinations();

    // The rest of your effects (like checking for dark mode) can remain or be adjusted
    if (typeof window !== 'undefined') {
      setDarkMode(document.documentElement.classList.contains('dark'))
    }

  }, []); // Fetch destinations only once on mount

  // Filter destinations based on user's savedDestinations when user or allDestinations changes
  const likedDestinations = useMemo(() => {
    console.log('useMemo calculating liked destinations...');
    console.log('Current user:', user);
    console.log('Current user.savedDestinations:', user?.savedDestinations);
    console.log('Current allDestinations count:', allDestinations.length);

    // Ensure user and savedDestinations exist and allDestinations is not empty
    if (!user || !user.savedDestinations || allDestinations.length === 0) {
      console.log('useMemo: Conditions not met for filtering, returning empty array.');
      return [];
    }
    // Filter all destinations to find the ones whose IDs are in user.savedDestinations
    // At this point, TypeScript knows user and user.savedDestinations are not null/undefined
    const filtered = allDestinations.filter(dest => user.savedDestinations!.includes(dest.id)); // Use non-null assertion (!)
    console.log('useMemo calculated liked destinations:', filtered);
    return filtered;
  }, [user?.savedDestinations, allDestinations]); // Dependencies: user.savedDestinations and allDestinations

  return (
    <>
      {/* Hero Section */}
      <section className="relative h-[40vh] bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
        <div className="absolute inset-0 overflow-hidden bg-gray-200 dark:bg-gray-700">{/* Placeholder for background image */}</div>
        <div className="relative z-10 text-center">
          <h1 className="text-5xl md:text-6xl font-light text-gray-900 dark:text-white">Choose your next adventure in Latvia</h1>
          <p className="mt-4 text-xl text-gray-700 dark:text-gray-200">Discover the best destinations and plan your trip</p>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-light mb-4 text-gray-900 dark:text-white">We will help you to organize your adventure in Latvia</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
              Discover the best destinations, plan your itinerary, and create unforgettable memories in Latvia.
            </p>
            <Link
              href="/destinations"
              className="inline-block px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-300"
            >
              Explore Destinations
            </Link>
          </div>
        </div>
      </section>

      {/* Your Favorite Destinations */}
      <section className="py-16 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-light mb-4 text-center text-gray-900 dark:text-white">Your Favorite Destinations</h2>
          <p className="text-center text-gray-600 dark:text-gray-300 mb-8">Discover your saved places to visit</p>

          {isLoading ? (
             <div className="text-center text-gray-600 dark:text-gray-300">Loading favorite destinations...</div>
          ) : isAuthenticated && user && likedDestinations.length > 0 ? (
             // Display liked destinations if authenticated and user has liked any
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {likedDestinations.map((destination) => (
                <div key={destination.id} className="relative group rounded-md overflow-hidden shadow-lg">
                  <div className="w-full h-64 bg-gray-300 dark:bg-gray-700 overflow-hidden">
                    <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${destination.image || '/placeholder-image.jpg'})` }}></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent group-hover:from-black/90 transition-all duration-300"></div>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-4 bg-black bg-opacity-60 flex flex-col">
                    <h3 className="text-lg font-medium text-white mb-1 leading-tight">{destination.name}</h3>
                    <button
                      onClick={() => removeSavedDestination(destination.id as string)}
                      className="text-sm text-blue-300 hover:text-blue-400 transition-colors self-start"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : isAuthenticated && user && likedDestinations.length === 0 ? (
              // Message if authenticated but no liked destinations
            <div className="text-center">
              <p className="text-gray-600 dark:text-gray-300">
                You haven't liked any destinations yet. Visit our{" "}
                <Link href="/destinations" className="text-gray-900 dark:text-white hover:underline">
                  Destinations
                </Link>{" "}
                page to discover amazing places in Latvia!
              </p>
            </div>
           ) : (
              // Message if not authenticated
            <div className="text-center">
               <p className="text-gray-600 dark:text-gray-300">
                 Please{" "}
                 <Link href="/login" className="text-gray-900 dark:text-white hover:underline">
                   log in
                 </Link>{" "}
                 to see your favorite destinations.
               </p>
            </div>
          )}
        </div>
      </section>
    </>
  )
}
