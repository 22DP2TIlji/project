import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useLikeDestination } from '@/hooks/useLikeDestination';
import { Heart } from 'lucide-react';

interface DestinationCardProps {
  id: number;
  name: string;
  description: string;
  category?: string;
  region?: string;
  isLiked?: boolean;
  onLikeChange?: (isLiked: boolean) => void;
}

export default function DestinationCard({
  id,
  name,
  description,
  category,
  region,
  isLiked: initialIsLiked = false,
  onLikeChange,
}: DestinationCardProps) {
  const { user } = useAuth();
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const { toggleLike, isLoading, error } = useLikeDestination();

  const handleLikeClick = async () => {
    if (!user) {
      // You might want to show a login prompt here
      return;
    }

    try {
      await toggleLike(id, isLiked);
      const newLikeStatus = !isLiked;
      setIsLiked(newLikeStatus);
      onLikeChange?.(newLikeStatus);
    } catch (err) {
      console.error('Error toggling like:', err);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-4">
        <div className="flex justify-between items-start">
          <h3 className="text-xl font-semibold text-gray-800">{name}</h3>
          <button
            onClick={handleLikeClick}
            disabled={isLoading || !user}
            className={`p-2 rounded-full transition-colors ${
              isLiked ? 'text-red-500' : 'text-gray-400 hover:text-red-500'
            } ${!user ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            title={user ? (isLiked ? 'Unlike' : 'Like') : 'Login to like'}
          >
            <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
          </button>
        </div>
        <p className="mt-2 text-gray-600">{description}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {category && (
            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
              {category}
            </span>
          )}
          {region && (
            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm">
              {region}
            </span>
          )}
        </div>
      </div>
    </div>
  );
} 