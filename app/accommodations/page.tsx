'use client';

import { useState, useEffect } from 'react';
import AccommodationCard from '@/components/AccommodationCard';

interface AccommodationData {
  id: number;
  name: string;
  description: string | null;
  address: string;
  latitude: number;
  longitude: number;
  category: string;
  price_range: string | null;
  contact_info: string | null;
  images: string | null;
  created_at: string;
  updated_at: string;
}

export default function AccommodationsPage() {
  const [accommodations, setAccommodations] = useState<AccommodationData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAccommodations = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/accommodations');
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch accommodations');
        }

        setAccommodations(data);
      } catch (err) {
        console.error('Error fetching accommodations:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
        setAccommodations([]); // Clear accommodations on error
      } finally {
        setIsLoading(false);
      }
    };

    fetchAccommodations();
  }, []);

  return (
    <>
      <section className="relative h-[40vh] bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
        <div className="absolute inset-0 overflow-hidden bg-gray-200 dark:bg-gray-700">{/* Placeholder for background image */}</div>
        <div className="relative z-10 text-center">
          <h1 className="text-5xl md:text-6xl font-light text-gray-900 dark:text-white">Accommodations</h1>
          <p className="mt-4 text-xl text-gray-700 dark:text-gray-200">Find the perfect place to stay</p>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-light mb-6">Available Accommodations</h2>

          {isLoading ? (
            <div className="text-center text-gray-600 dark:text-gray-300">Loading accommodations...</div>
          ) : error ? (
            <div className="text-center text-red-600">Error: {error}</div>
          ) : accommodations.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {accommodations.map((accommodation) => (
                <AccommodationCard key={accommodation.id} accommodation={accommodation} />
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-600 dark:text-gray-300">No accommodations found.</div>
          )}
        </div>
      </section>
    </>
  );
} 