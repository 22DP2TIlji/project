'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

// Definējam saskarnes (interfaces) datu struktūrai
interface RoutePoint {
  id: number;
  routeId: number;
  objectId: number;
  objectType: 'attraction' | 'event' | 'accommodation';
  sequence: number;
  createdAt: string; 
}

interface ItineraryData {
  id: number;
  userId: number;
  name: string;
  description: string | null;
  createdAt: string; 
  updatedAt: string; 
  points: RoutePoint[]; 
}

export default function ItineraryPage() {
  const params = useParams();
  // Droša maršruta ID iegūšana no URL
  const itineraryId = Array.isArray(params?.id) ? params?.id[0] : params?.id;

  const [itinerary, setItinerary] = useState<ItineraryData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchItinerary = async () => {
      if (!itineraryId) {
        setIsLoading(false);
        setError('Maršruta ID nav norādīts');
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Izsaucam API galpunktu, lai iegūtu maršrutu
        const response = await fetch(`/api/routes/${itineraryId}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Neizdevās ielādēt maršrutu');
        }

        setItinerary(data);
      } catch (err) {
        console.error('Kļūda ielādējot maršrutu:', err);
        setError(err instanceof Error ? err.message : 'Notikusi kļūda');
        setItinerary(null); // Notīrām datus kļūdas gadījumā
      } finally {
        setIsLoading(false);
      }
    };

    fetchItinerary();
  }, [itineraryId]);

  if (isLoading) {
    return <div className="container mx-auto px-4 py-16 text-center">Ielādē maršrutu...</div>;
  }

  if (error) {
    return <div className="container mx-auto px-4 py-16 text-center text-red-600">Kļūda: {error}</div>;
  }

  if (!itinerary) {
    return <div className="container mx-auto px-4 py-16 text-center">Maršruts nav atrasts.</div>;
  }

  // Maršruta detaļu attēlošana
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">{itinerary.name}</h1>
      {itinerary.description && <p className="text-gray-700 mb-6">{itinerary.description}</p>}

      <h2 className="text-2xl font-semibold mb-3">Apskates vietas:</h2>
      {itinerary.points.length > 0 ? (
        <ol className="list-decimal list-inside space-y-3">
          {itinerary.points.map((point, index) => (
            <li key={point.id} className="text-gray-800">
              {/* Šeit parasti tiktu ielādēta detalizēta informācija katram objectId */}
              Punkts {index + 1}: {point.objectType === 'attraction' ? 'Apskates objekts' : 
                                 point.objectType === 'event' ? 'Pasākums' : 'Naktsmītne'} 
              (ID: {point.objectId})
            </li>
          ))}
        </ol>
      ) : (
        <p className="text-gray-600">Šim maršrutam vēl nav pievienotu punktu.</p>
      )}
    </div>
  );
}