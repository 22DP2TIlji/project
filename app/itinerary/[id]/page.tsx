'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

// Define interfaces for the data structure based on your Prisma schema
interface RoutePoint {
  id: number;
  routeId: number;
  objectId: number;
  objectType: 'attraction' | 'event' | 'accommodation';
  sequence: number;
  createdAt: string; // Assuming date is returned as string
}

interface ItineraryData {
  id: number;
  userId: number;
  name: string;
  description: string | null;
  createdAt: string; // Assuming date is returned as string
  updatedAt: string; // Assuming date is returned as string
  points: RoutePoint[]; // Include the points
}

export default function ItineraryPage() {
  const params = useParams();
  // Safely get the itinerary ID from the URL
  const itineraryId = Array.isArray(params?.id) ? params?.id[0] : params?.id;

  const [itinerary, setItinerary] = useState<ItineraryData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchItinerary = async () => {
      if (!itineraryId) {
        setIsLoading(false);
        setError('Itinerary ID not provided');
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Call the API endpoint to fetch the itinerary
        const response = await fetch(`/api/routes/${itineraryId}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch itinerary');
        }

        setItinerary(data);
      } catch (err) {
        console.error('Error fetching itinerary:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
        setItinerary(null); // Clear itinerary on error
      } finally {
        setIsLoading(false);
      }
    };

    fetchItinerary();
  }, [itineraryId]); // Re-run effect if itineraryId changes

  if (isLoading) {
    return <div className="container mx-auto px-4 py-16 text-center">Loading itinerary...</div>;
  }

  if (error) {
    return <div className="container mx-auto px-4 py-16 text-center text-red-600">Error: {error}</div>;
  }

  if (!itinerary) {
    return <div className="container mx-auto px-4 py-16 text-center">Itinerary not found.</div>;
  }

  // Render the itinerary details
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">{itinerary.name}</h1>
      {itinerary.description && <p className="text-gray-700 mb-6">{itinerary.description}</p>}

      <h2 className="text-2xl font-semibold mb-3">Points of Interest:</h2>
      {itinerary.points.length > 0 ? (
        <ol className="list-decimal list-inside space-y-3">
          {itinerary.points.map((point, index) => (
            <li key={point.id} className="text-gray-800">
              {/* You would typically fetch details for each objectId here */}
              Point {index + 1}: {point.objectType} with ID {point.objectId}
              {/* You could add links or more details about each point */}
            </li>
          ))}
        </ol>
      ) : (
        <p className="text-gray-600">This itinerary has no points yet.</p>
      )}

      {/* Add more details or actions as needed */}
    </div>
  );
} 