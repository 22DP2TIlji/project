"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { MapPin, Heart, MessageCircle, Copy, Send } from "lucide-react"

type PublicRoute = {
  id: number
  name: string
  description: string | null
  userName: string
  likesCount: number
  commentsCount: number
  createdAt: string
  likedByCurrentUser?: boolean
}

export default function PublicRoutesPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [routes, setRoutes] = useState<PublicRoute[]>([])
  const [loading, setLoading] = useState(true)
  const [cloning, setCloning] = useState<number | null>(null)
  const [commentText, setCommentText] = useState<Record<number, string>>({})
  const [routeComments, setRouteComments] = useState<Record<number, Array<{ id: number; userName: string; text: string }>>>({})
  const [likedState, setLikedState] = useState<Record<number, boolean>>({})
  
  useEffect(() => {
    const load = async () => {
      try {
        const params = new URLSearchParams({ limit: "20" })
        if (user?.id && user.id !== "admin") params.set("userId", user.id)
        const res = await fetch(`/api/routes/public?${params}`)
        const data = await res.json()
        if (data.success && data.routes) {
          setRoutes(data.routes)
          setLikedState(
            Object.fromEntries(
              data.routes.map((route: PublicRoute) => [route.id, !!route.likedByCurrentUser])
            )
          )
        }
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [user?.id])

  const toggleLike = async (routeId: number) => {
    if (!user?.id) {
      router.push("/login")
      return
    }
    const res = await fetch(`/api/routes/${routeId}/likes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.id }),
    })
    const data = await res.json()
    if (!res.ok || !data.success) {
      alert(data.message || "Neizdevās atjaunināt patīk.")
      return
    }
    setLikedState((prev) => ({ ...prev, [routeId]: !!data.liked }))
    setRoutes((prev) =>
      prev.map((r) => (r.id === routeId ? { ...r, likesCount: data.count } : r))
    )
  }

  const loadComments = async (routeId: number) => {
    const res = await fetch(`/api/routes/${routeId}/comments`)
    const data = await res.json()
    if (data.success) {
      setRouteComments((prev) => ({ ...prev, [routeId]: data.comments || [] }))
    }
  }

  const addComment = async (routeId: number) => {
    if (!user?.id) {
      router.push("/login")
      return
    }
    const text = (commentText[routeId] || "").trim()
    if (!text) return
    const res = await fetch(`/api/routes/${routeId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.id, text }),
    })
    const data = await res.json()
    if (!res.ok || !data.success) {
      alert(data.message || "Neizdevās pievienot komentāru.")
      return
    }
    setCommentText((prev) => ({ ...prev, [routeId]: "" }))
    await loadComments(routeId)
    setRoutes((prev) =>
      prev.map((r) =>
        r.id === routeId ? { ...r, commentsCount: (r.commentsCount || 0) + 1 } : r
      )
    )
  }

  const clone = async (routeId: number) => {
    if (!user || !user.id) {
      router.push("/login")
      return
    }
    setCloning(routeId)
    try {
      const res = await fetch(`/api/routes/${routeId}/clone`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id }),
      })
      const data = await res.json()
      if (data.success) {
        alert("Maršruts veiksmīgi nokopēts!")
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("savedItinerariesUpdated"))
        }
      } else {
        alert(data.message || "Neizdevās nokopēt maršrutu.")
      }
    } catch (e) {
      console.error(e)
      alert("Neizdevās nokopēt maršrutu.")
    } finally {
      setCloning(null)
    }
  }

  return (
    <>
      <section className="travel-hero">
        <div className="travel-hero-glow" />
        <div className="relative z-10 mx-auto max-w-4xl px-4 text-center">
          <h1 className="travel-hero-title">Publiskie maršruti</h1>
          <p className="travel-hero-subtitle">
            Pārlūkojiet citu ceļotāju kopīgotos maršrutus
          </p>
        </div>
      </section>

      <section className="travel-section">
        <div className="container mx-auto px-4 max-w-2xl">
          {loading ? (
            <p className="text-gray-600 text-center">Ielādē...</p>
          ) : routes.length === 0 ? (
            <p className="text-gray-600 text-center">
              Pagaidām nav neviena publiska maršruta
            </p>
          ) : (
            <ul className="space-y-4">
              {routes.map((r) => (
                <li
                  key={r.id}
                  className="bg-white p-4 rounded-md border border-gray-200 shadow-sm"
                >
                  <h3 className="font-medium text-gray-900">{r.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">autors: {r.userName}</p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                    <button
                      onClick={() => toggleLike(r.id)}
                      className={`flex items-center gap-1 transition-colors ${likedState[r.id] ? "text-red-600" : "text-gray-600"}`}
                      title="Patīk"
                      aria-pressed={!!likedState[r.id]}
                    >
                      <Heart className={`h-4 w-4 ${likedState[r.id] ? "fill-red-500 text-red-500" : ""}`} />
                      {r.likesCount}
                    </button>
                    <span className="flex items-center gap-1" title="Komentāri">
                      <MessageCircle className="h-4 w-4" />
                      {r.commentsCount}
                    </span>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => clone(r.id)}
                      disabled={cloning === r.id}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-md disabled:opacity-50 transition-colors"
                    >
                      <Copy className="h-4 w-4" />
                      {cloning === r.id ? "Kopē..." : "Kopēt sev"}
                    </button>
                    <Link
                      href={`/itinerary?route=${r.id}&openMap=1`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                      title="Atvērt šo maršrutu sadaļā Plānot ceļojumu"
                    >
                      <MapPin className="h-4 w-4" />
                      Apskatīt detalizēti
                    </Link>
                  </div>
                  <div className="mt-3 border-t border-gray-100 pt-3">
                    <button
                      className="text-sm text-blue-600 hover:underline"
                      onClick={() => loadComments(r.id)}
                    >
                      Parādīt komentārus
                    </button>
                    {routeComments[r.id]?.length ? (
                      <div className="mt-2 space-y-2">
                        {routeComments[r.id].map((c) => (
                          <div key={c.id} className="text-sm bg-gray-50 rounded-md p-2">
                            <p className="font-medium text-gray-700">{c.userName}</p>
                            <p className="text-gray-600">{c.text}</p>
                          </div>
                        ))}
                      </div>
                    ) : null}
                    <div className="mt-2 flex gap-2">
                      <input
                        value={commentText[r.id] || ""}
                        onChange={(e) =>
                          setCommentText((prev) => ({ ...prev, [r.id]: e.target.value }))
                        }
                        placeholder="Uzrakstiet komentāru"
                        className="flex-1 rounded-md border border-gray-300 px-3 py-1.5 text-sm"
                      />
                      <button
                        onClick={() => addComment(r.id)}
                        className="px-3 py-1.5 rounded-md bg-gray-800 text-white text-sm hover:bg-gray-700 inline-flex items-center gap-1"
                      >
                        <Send className="h-4 w-4" />
                        Sūtīt
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <p className="mt-8 text-center text-sm text-gray-500">
            Vai vēlaties radīt ko savu?{" "}
            <Link href="/itinerary" className="text-blue-600 hover:underline">
              Plānojiet savu maršrutu
            </Link>
          </p>
        </div>
      </section>
    </>
  )
}