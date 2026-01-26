"use client"

import { Heart } from "lucide-react"
import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"

interface LikeButtonProps {
  destinationId: string
  destinationName: string
  onLikeChange?: (isLiked: boolean) => void
}

export default function LikeButton({ destinationId, destinationName, onLikeChange }: LikeButtonProps) {
  const { user, saveDestination, removeSavedDestination, refreshUser } = useAuth()
  const [isLiked, setIsLiked] = useState(false)
  const [updating, setUpdating] = useState(false)

  const idNum = parseInt(destinationId, 10)
  const isValidId = !isNaN(idNum)

  useEffect(() => {
    if (user && user.savedDestinations && isValidId) {
      const liked = user.savedDestinations.some(
        (id) => id === idNum || String(id) === destinationId
      )
      setIsLiked(liked)
      return
    }
    if (!user && typeof window !== "undefined") {
      const raw = localStorage.getItem("likedDestinations") || "{}"
      const obj = JSON.parse(raw) as Record<string, { id: string | number }>
      setIsLiked(!!obj[destinationId])
      return
    }
    setIsLiked(false)
  }, [user, user?.savedDestinations, destinationId, idNum, isValidId])

  const toggleLike = async () => {
    if (updating) return

    if (user && isValidId) {
      setUpdating(true)
      try {
        if (isLiked) {
          await removeSavedDestination(idNum)
          setIsLiked(false)
          onLikeChange?.(false)
        } else {
          await saveDestination(idNum)
          setIsLiked(true)
          onLikeChange?.(true)
        }
        await refreshUser()
      } catch (e) {
        console.error("Like toggle error:", e)
      } finally {
        setUpdating(false)
      }
      return
    }

    const raw = localStorage.getItem("likedDestinations") || "{}"
    const likedDestinations = JSON.parse(raw) as Record<string, { id: string; name: string }>

    if (isLiked) {
      delete likedDestinations[destinationId]
      setIsLiked(false)
      onLikeChange?.(false)
    } else {
      likedDestinations[destinationId] = { id: destinationId, name: destinationName }
      setIsLiked(true)
      onLikeChange?.(true)
    }

    localStorage.setItem("likedDestinations", JSON.stringify(likedDestinations))
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("likedDestinationsUpdated"))
    }
  }

  return (
    <button
      type="button"
      onClick={toggleLike}
      disabled={updating}
      className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-50"
      aria-label={isLiked ? "Remove from favorites" : "Add to favorites"}
    >
      <Heart
        className={`w-5 h-5 ${isLiked ? "fill-red-500 text-red-500" : "text-gray-400 hover:text-gray-600"}`}
      />
      <span className="text-gray-600">{isLiked ? "Liked" : "Like"}</span>
    </button>
  )
}
