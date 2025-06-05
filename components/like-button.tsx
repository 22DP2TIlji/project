"use client"

import { Heart } from "lucide-react"
import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"

interface LikeButtonProps {
  destinationId: number
  destinationName: string
}

export default function LikeButton({ destinationId, destinationName }: LikeButtonProps) {
  // Get user, saveDestination, and removeSavedDestination from auth context
  const { user, saveDestination, removeSavedDestination } = useAuth();
  // isLiked state is now derived from user.savedDestinations
  const isLiked = user?.savedDestinations?.includes(destinationId) || false;

  // No need for a separate useEffect to check likes on user change, as isLiked is derived
  // The auth context handles fetching the user with savedDestinations on load.

  const toggleLike = async () => {
    if (!user) {
      // Optionally show a message or redirect to login if not authenticated
      console.log("Please log in to like destinations.");
      return;
    }

    if (isLiked) {
      // Call the removeSavedDestination function (which expects number ID)
      await removeSavedDestination(destinationId);
    } else {
      // Call the saveDestination function (which expects number ID)
      await saveDestination(destinationId);
    }

    // The isLiked state will automatically update because the user object in the auth context changes
  };

  return (
    <button
      onClick={toggleLike}
      className="flex items-center space-x-1 text-sm"
      aria-label={isLiked ? "Remove from favorites" : "Add to favorites"}
    >
      <Heart className={`w-5 h-5 ${isLiked ? "fill-red-500 text-red-500" : "text-gray-400"}`} />
      <span>{isLiked ? "Liked" : "Like"}</span>
    </button>
  )
}

