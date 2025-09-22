// components/like-button.tsx
"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"

interface LikeButtonProps {
  destinationId: number
  destinationName: string
}

export default function LikeButton({ destinationId, destinationName }: LikeButtonProps) {
  const { user, saveDestination, removeSavedDestination } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  
  // Check if destination is liked
  const isLiked = user?.savedDestinations?.includes(destinationId) || false;

  const toggleLike = async () => {
    if (!user) {
      alert("Please log in to save destinations");
      return;
    }

    setIsLoading(true);
    
    try {
      if (isLiked) {
        await removeSavedDestination(destinationId);
      } else {
        await saveDestination(destinationId);
      }
    } catch (error) {
      console.error("Error toggling like:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Simple heart SVG icon
  const HeartIcon = ({ filled }: { filled: boolean }) => (
    <svg 
      className={`w-5 h-5 ${filled ? "fill-red-500 text-red-500" : "text-gray-400"}`}
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor" 
      viewBox="0 0 24 24"
      strokeWidth={2}
    >
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
      />
    </svg>
  );

  return (
    <button
      onClick={toggleLike}
      disabled={isLoading}
      className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
        isLoading 
          ? "opacity-50 cursor-not-allowed" 
          : "hover:bg-gray-100 dark:hover:bg-gray-800"
      }`}
      aria-label={isLiked ? "Remove from favorites" : "Add to favorites"}
    >
      <HeartIcon filled={isLiked} />
      <span className={isLiked ? "text-red-500" : "text-gray-600 dark:text-gray-400"}>
        {isLoading ? "..." : isLiked ? "Liked" : "Like"}
      </span>
    </button>
  )
}