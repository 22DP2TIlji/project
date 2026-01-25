"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import LikeButton from "@/components/like-button"
import { useAuth } from "@/lib/auth-context"

type Review = {
  id: number
  rating: number
  comment: string
  createdAt?: string
  user?: { id: number | string; name: string }
}

export default function DestinationPage() {
  const params = useParams()
  const id = String(params?.id || "")

  const { user, isAuthenticated } = useAuth()

  const [destination, setDestination] = useState<any>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)

  const [comment, setComment] = useState("")
  const [rating, setRating] = useState(5)
  const [sending, setSending] = useState(false)

  const fetchAll = async () => {
    if (!id) return
    setLoading(true)

    try {
      // 1) destination
      const dRes = await fetch(`/api/destinations/${id}`)
      const dData = await dRes.json()

      console.log("Destination API:", dData)

      if (!dRes.ok || !dData?.success) {
        setDestination(null)
        setReviews([])
        return
      }
      setDestination(dData.destination)

      // 2) reviews
      const rRes = await fetch(`/api/destinations/${id}/reviews`)
      const rData = await rRes.json()

      console.log("Reviews API:", rData)

      setReviews(rData?.reviews || [])
    } catch (e) {
      console.error(e)
      setDestination(null)
      setReviews([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!id) return
    fetchAll()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const submitReview = async () => {
    if (!isAuthenticated || !user) {
      alert("Please log in to leave a review")
      return
    }
    if (!comment.trim()) {
      alert("Write a comment")
      return
    }

    setSending(true)
    try {
      const res = await fetch(`/api/destinations/${id}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          rating,
          comment,
        }),
      })

      const data = await res.json()
      if (!res.ok || !data?.success) {
        alert(data?.message || "Failed to send review")
        return
      }

      setComment("")
      setRating(5)
      await fetchAll()
    } catch (e) {
      console.error(e)
      alert("Failed to send review")
    } finally {
      setSending(false)
    }
  }

  if (!id) {
    return <div className="container mx-auto px-4 py-16">Invalid destination id</div>
  }

  if (loading) {
    return <div className="container mx-auto px-4 py-16">Loading...</div>
  }

  if (!destination) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-light mb-4">Destination not found</h1>
        <p className="mb-8 text-gray-600">The destination you're looking for doesn't exist or has been removed.</p>
        <Link
          href="/destinations"
          className="inline-block px-6 py-3 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
        >
          Back to Destinations
        </Link>
      </div>
    )
  }

  const heroImg = destination.images?.[0]?.url

  return (
    <>
      <section className="relative h-[40vh] bg-gray-100 flex items-center justify-center">
        <div className="absolute inset-0 overflow-hidden bg-gray-200" />
        <div className="relative z-10 text-center">
          <h1 className="text-5xl md:text-6xl font-light">{destination.name}</h1>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <Link href="/destinations" className="text-gray-600 hover:text-gray-800 flex items-center">
                <span>← Back to Destinations</span>
              </Link>
              <LikeButton destinationId={destination.id} destinationName={destination.name} />
            </div>

            <div className="relative h-96 mb-8 overflow-hidden rounded-md bg-gray-200">
              {heroImg ? <img src={heroImg} alt={destination.name} className="w-full h-full object-cover" /> : null}
            </div>

            <div className="prose max-w-none">
              <p className="text-xl text-gray-700 mb-6">{destination.description}</p>
            </div>

            {/* ✅ REVIEWS */}
            <div className="mt-12 pt-8 border-t border-gray-200">
              <h2 className="text-2xl font-light mb-4">Reviews</h2>

              {/* Form */}
              <div className="border border-gray-200 rounded-md p-4 mb-6">
                <p className="text-sm text-gray-600 mb-3">
                  {isAuthenticated ? "Leave your review" : "Log in to leave a review"}
                </p>

                <div className="flex gap-3 items-center mb-3">
                  <label className="text-sm text-gray-700">Rating</label>
                  <select
                    value={rating}
                    onChange={(e) => setRating(Number(e.target.value))}
                    className="border rounded px-2 py-1"
                    disabled={!isAuthenticated || sending}
                  >
                    {[5, 4, 3, 2, 1].map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                </div>

                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Write your review..."
                  className="w-full border rounded p-3"
                  rows={4}
                  disabled={!isAuthenticated || sending}
                />

                <button
                  onClick={submitReview}
                  disabled={!isAuthenticated || sending}
                  className="mt-3 px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-50"
                >
                  {sending ? "Sending..." : "Send review"}
                </button>
              </div>

              {/* List */}
              {reviews.length === 0 ? (
                <p className="text-gray-600">No reviews yet.</p>
              ) : (
                <div className="space-y-4">
                  {reviews.map((r) => (
                    <div key={r.id} className="border border-gray-200 rounded-md p-4">
                      <div className="flex justify-between">
                        <div className="text-sm text-gray-700">
                          <span className="font-medium">{r.user?.name ?? "User"}</span> • ⭐ {r.rating}/5
                        </div>
                        <div className="text-xs text-gray-500">
                          {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : ""}
                        </div>
                      </div>
                      <p className="mt-2 text-gray-700">{r.comment}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
