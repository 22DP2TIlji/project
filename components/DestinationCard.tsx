import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useLikeDestination } from '@/hooks/useLikeDestination';
import { Heart } from 'lucide-react';
import { useRouter } from 'next/navigation';

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
  const router = useRouter();
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const { toggleLike, isLoading, error } = useLikeDestination();

  const handleLikeClick = async () => {
    if (!user) {
     router.push('/login');
      return;
    }

    try {
      await toggleLike(id, isLiked);
      const newLikeStatus = !isLiked;
      setIsLiked(newLikeStatus);
      onLikeChange?.(newLikeStatus);
    } catch (err) {
      console.error('Kļūda mainot "patīk" statusu:', err);
    }
  };

  return (
    <div className="group overflow-hidden rounded-[1.5rem] border border-slate-200/80 bg-white/90 shadow-xl shadow-slate-900/5 transition hover:-translate-y-1 hover:shadow-2xl hover:shadow-sky-900/10">
      <div className="p-5">
        <div className="flex justify-between items-start">
          <h3 className="text-xl font-bold text-slate-950">{name}</h3>
          <button
            onClick={handleLikeClick}
            disabled={isLoading}
            className={`p-2 rounded-full transition-colors ${
             isLiked ? 'text-red-500' : 'text-slate-400 hover:text-red-500'
            } ${!user ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            title={user ? (isLiked ? 'Noņemt patīk' : 'Patīk') : 'Pieslēdzieties, lai pievienotu izlasei'}
          >
            <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
          </button>
        </div>
        <p className="mt-2 text-slate-600">{description}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {category && (
            <span className="rounded-full bg-sky-50 px-3 py-1 text-sm font-semibold text-sky-700">
              {category}
            </span>
          )}
          {region && (
            <span className="rounded-full bg-teal-50 px-3 py-1 text-sm font-semibold text-teal-700">
              {region}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}