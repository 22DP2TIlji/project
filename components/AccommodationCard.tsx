import { useState, useEffect } from 'react';

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

interface AccommodationCardProps {
  accommodation: AccommodationData;
}

export default function AccommodationCard({ accommodation }: AccommodationCardProps) {
  // Sadalām attēlu virkni, ja tā ir komatiem atdalīts saraksts, vai izmantojam vietturi
  const imageUrl = accommodation.images ? accommodation.images.split(',')[0] : '/placeholder-image.jpg';

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden h-full flex flex-col transition-hover hover:shadow-lg">
      <div className="relative h-48 w-full overflow-hidden">
        {/* Attēla attēlošana */}
        {imageUrl && (
          <img 
            src={imageUrl} 
            alt={accommodation.name} 
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105" 
          />
        )}
      </div>
      
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="text-xl font-semibold text-gray-800 mb-2">{accommodation.name}</h3>
        
        {accommodation.category && (
          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs mb-2 self-start">
            {accommodation.category}
          </span>
        )}
        
        {accommodation.description && (
          <p className="mt-2 text-gray-600 text-sm flex-grow line-clamp-3">
            {accommodation.description}
          </p>
        )}
        
        <div className="mt-4 text-sm text-gray-700 space-y-1">
          {accommodation.address && (
            <p>
              <strong className="font-medium">Adrese:</strong> {accommodation.address}
            </p>
          )}
          
          {accommodation.price_range && (
            <p>
              <strong className="font-medium">Cenu līmenis:</strong> {accommodation.price_range}
            </p>
          )}
          
          {accommodation.contact_info && (
            <p>
              <strong className="font-medium">Kontakti:</strong> {accommodation.contact_info}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}