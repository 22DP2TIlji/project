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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAccommodations = async () => {
      try {
        const response = await fetch('/api/accommodations');
        if (!response.ok) {
          throw new Error(`Error fetching accommodations: ${response.statusText}`);
        }
        const data = await response.json();
        setAccommodations(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        console.error('Failed to fetch accommodations:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAccommodations();
  }, []);

  if (loading) {
    return <div className="container mx-auto px-4 py-8 text-center">Loading accommodations...</div>;
  }

  if (error) {
    return <div className="container mx-auto px-4 py-8 text-center text-red-500">Error: {error}</div>;
  }

  if (accommodations.length === 0) {
    return <div className="container mx-auto px-4 py-8 text-center">No accommodations found.</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-light mb-6 text-center">Accommodation Varieties</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {accommodations.map((accommodation) => (
          <AccommodationCard key={accommodation.id} accommodation={accommodation} />
        ))}
      </div>
    </div>
  );
} 