'use client'
import React, { useReducer, useState, useEffect } from 'react'

import Link from "next/link"
import { useParams } from "next/navigation"
import LikeButton from "@/components/like-button"

// Define a more complete type based on how destination object is used
interface DestinationData {
  id: number; // Ensure id is a number based on your SQL schema
  name: string;
  description: string; // Ensure description is a string
  fullDescription: string;
  category?: string;
  region?: string;
  // Add other properties as needed
}

// Define the type for the destinations object with string keys and DestinationData values
const destinations: { [id: string]: DestinationData } = {
  // Example structure (ensure all your destinations follow this)
  // The key should match the string ID you expect from the URL
  // Example for Gauja National Park with ID 8, accessed via /destination/8
  '8': {
    id: 8,
    name: 'Gauja National Park',
    description: 'Latvia\'s largest and oldest national park...',
    fullDescription: 'The park is home to an impressive biodiversity...',
    category: 'nature',
    region: 'central',
  },
  // ... add other destinations here, ensuring each matches DestinationData interface
  // Use the string representation of the actual ID from your database as the key

  // Using dummy data for now based on previous interactions
    '1': { id: 1, name: 'Ķengarags', description: 'Visit it and feel the extremal experience. ;)', fullDescription: 'Visit it and feel the extremal experience. ;)' },
    '2': { id: 2, name: 'Sigulda', description: 'Known as the "Switzerland of Latvia,"...', fullDescription: 'Known as the "Switzerland of Latvia," Sigulda offers breathtaking landscapes, medieval castles, and outdoor activities surrounded by the picturesque Gauja National Park.', category: 'nature', region: 'central' },
    '3': { id: 3, name: 'Jūrmala', description: 'Latvia\'s premier beach resort town...', fullDescription: 'Latvia\'s premier beach resort town features 33 km of white sand beaches along the Baltic Sea, charming wooden architecture, and a relaxing spa culture.', category: 'beach', region: 'western' },
    '4': { id: 4, name: 'Cēsis', description: 'One of Latvia\'s most picturesque towns...', fullDescription: 'One of Latvia\'s most picturesque towns, Cēsis boasts a well-preserved medieval castle, charming old town, and beautiful surroundings perfect for history enthusiasts.', category: 'city', region: 'central' },
    '5': { id: 5, name: 'Kuldīga', description: 'A picturesque town known for its red-tiled roofs...', fullDescription: 'A picturesque town known for its red-tiled roofs, cobblestone streets, and Europe\'s widest waterfall, Ventas Rumba. The historic center is a well-preserved example of a traditional Latvian town.', category: 'city', region: 'western' },
    '6': { id: 6, name: 'Liepāja', description: 'A coastal city with beautiful beaches...', fullDescription: 'A coastal city with beautiful beaches, a historic naval port, and a vibrant music scene. Known as \'The city where the wind is born,\' Liepāja offers a mix of cultural heritage and seaside charm.', category: 'city', region: 'western' },
    '7': { id: 7, name: 'Rundāle Palace', description: 'A magnificent baroque palace...', fullDescription: 'A magnificent baroque palace often called the \'Versailles of Latvia.\' The palace features stunning architecture, lavish interiors, and beautiful French-style gardens.', category: 'palace', region: 'southern' },
    '9': { id: 9, name: 'Old town, Riga', description: 'Explore the charming cobblestone streets...', fullDescription: 'Explore the charming cobblestone streets and colorful buildings of Riga\'s historic Old Town, a UNESCO World Heritage site featuring stunning architecture from various periods.', category: 'city', region: 'central' },
    '10': { id: 10, name: 'Ķīpsala', description: 'Daugavas pludmale', fullDescription: 'Daugavas pludmale' },
    '11': { id: 11, name: 'Jugla', description: '...', fullDescription: '...' },
};

export default function DestinationPage() {
  const params = useParams()
  // Safely access the id parameter and ensure it's a string
  const id = Array.isArray(params?.id) ? params?.id[0] : params?.id;
  const destinationId = typeof id === 'string' ? id : undefined;

  const [destination, setDestination] = useState<DestinationData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setIsLoading(true)
    if (destinationId && destinations[destinationId]) {
      setDestination(destinations[destinationId])
      setIsLoading(false)
    } else {
      console.error(`Destination with id ${destinationId} not found`)
      setDestination(null)
      setIsLoading(false)
    }
  }, [destinationId]) // Depend only on destinationId

  // Loading state
  if (isLoading) {
     return (
      <div className="container mx-auto px-4 py-16 text-center">
        Loading...
      </div>
     )
  }

  // Not Found state
  if (!destination) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        Destination not found.
      </div>
    )
  }

  // Render destination details
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">{destination.name}</h1>
      {/* Use description property */}
      {destination.description && <p className="text-gray-600 mb-4">{destination.description}</p>}
      <p className="text-gray-700">{destination.fullDescription}</p>
      {/* Render other destination details like category, region */}
      {destination.category && <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm mr-2">{destination.category}</span>}
      {destination.region && <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm">{destination.region}</span>}
       {/* You can add the LikeButton component here, passing the destination.id */}
       {/* Make sure LikeButton handles fetching its own liked status */}
       <LikeButton destinationId={destination.id} destinationName={destination.name} />
        </div>
  )
}

