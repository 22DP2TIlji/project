import { useState } from 'react';
import { useSession } from 'next-auth/react';

export const useLikeDestination = () => {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleLike = async (destinationId: number, isLiked: boolean) => {
    if (!session) {
      setError('You must be logged in to like destinations');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/destinations/like', {
        method: isLiked ? 'DELETE' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ destinationId }),
      });

      if (!response.ok) {
        throw new Error('Failed to update like status');
      }

      return await response.json();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    toggleLike,
    isLoading,
    error,
  };
}; 