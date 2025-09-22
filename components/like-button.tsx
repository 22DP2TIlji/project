"use client"

import { Heart } from "lucide-react"
import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"

interface LikeButtonProps {
  destinationId: string
  destinationName: string
}

export default function LikeButton({ destinationId, destinationName }: LikeButtonProps) {
  const { user } = useAuth()
  const [isLiked, setIsLiked] = useState(false)

  useEffect(() => {
    checkIfLiked()
  }, [user, destinationId])

  const checkIfLiked = () => {
    if (user) {
      // Check user's likes in localStorage
      const users = JSON.parse(localStorage.getItem("users") || "[]")
      const currentUser = users.find((u: any) => u.id === user.id)

      if (currentUser && currentUser.likes && currentUser.likes[destinationId]) {
        setIsLiked(true)
        return
      }
    } else {
      // Check anonymous likes in localStorage
      const likedDestinations = JSON.parse(localStorage.getItem("likedDestinations") || "{}")
      setIsLiked(!!likedDestinations[destinationId])
    }

    setIsLiked(false)
  }

  const toggleLike = () => {
    if (user) {
      // Update user's likes in localStorage
      const users = JSON.parse(localStorage.getItem("users") || "[]")
      const userIndex = users.findIndex((u: any) => u.id === user.id)

      if (userIndex !== -1) {
        // Initialize likes object if it doesn't exist
        if (!users[userIndex].likes) {
          users[userIndex].likes = {}
        }

        if (isLiked) {
          // Remove from liked destinations
          delete users[userIndex].likes[destinationId]
        } else {
          // Add to liked destinations
          users[userIndex].likes[destinationId] = {
            id: destinationId,
            name: destinationName,
          }
        }

        localStorage.setItem("users", JSON.stringify(users))
      }
    } else {
      // Update anonymous likes in localStorage
      const likedDestinations = JSON.parse(localStorage.getItem("likedDestinations") || "{}")

      if (isLiked) {
        // Remove from liked destinations
        delete likedDestinations[destinationId]
      } else {
        // Add to liked destinations
        likedDestinations[destinationId] = {
          id: destinationId,
          name: destinationName,
        }
      }

      localStorage.setItem("likedDestinations", JSON.stringify(likedDestinations))
    }

    setIsLiked(!isLiked)
  }

  return (
    <button
      onClick={toggleLike}
      className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-800 transition-colors"
      aria-label={isLiked ? "Remove from favorites" : "Add to favorites"}
    >
      <Heart className={`w-5 h-5 ${isLiked ? "fill-red-500 text-red-500" : "text-gray-400 hover:text-gray-600"}`} />
      <span className="text-gray-600">{isLiked ? "Liked" : "Like"}</span>
    </button>
  )
}
