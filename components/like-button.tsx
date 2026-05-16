"use client"

import { Heart } from "lucide-react"
import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"

interface LikeButtonProps {
  destinationId: string
  destinationName: string
  onLikeChange?: (isLiked: boolean) => void
}

export default function LikeButton({ destinationId, destinationName, onLikeChange }: LikeButtonProps) {
  const { user, isAuthenticated, saveDestination, removeSavedDestination, refreshUser } = useAuth()
  const router = useRouter()
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
    
    setIsLiked(false)
  }, [user, user?.savedDestinations, destinationId, idNum, isValidId])

  useEffect(() => {
    if (user || typeof window === "undefined") return
    localStorage.removeItem("likedDestinations")
  }, [user])

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
        console.error("Kļūda mainot patīk statusu:", e)
      } finally {
        setUpdating(false)
      }
      return
    }

    router.push("/login")
  }
  return (
    <button
      type="button"
      onClick={toggleLike}
       disabled={updating || !isAuthenticated}
      className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-50"
      aria-label={isLiked ? "Noņemt no izlases" : "Pievienot izlasei"}
      title={isAuthenticated ? undefined : "Pieslēdzieties, lai saglabātu vietu"}
      >
      <Heart
        className={`w-5 h-5 ${isLiked ? "fill-red-500 text-red-500" : "text-gray-400 hover:text-gray-600"}`}
      />
      <span className="text-gray-600">{isLiked ? "Pievienots" : "Patīk"}</span>
    </button>
  )
}