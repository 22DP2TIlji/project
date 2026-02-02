"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { Star, MessageCircle, User as UserIcon } from "lucide-react"
import LikeButton from "@/components/like-button"
import { useAuth } from "@/lib/auth-context"

const destinations = {
  riga: {
    id: "riga",
    name: "Old town, Riga",
    description:
      "Explore the charming cobblestone streets and colorful buildings of Riga's historic Old Town, a UNESCO World Heritage site featuring stunning architecture from various periods.",
    fullDescription: `
      Riga's Old Town (Vecrīga) is a captivating blend of architectural styles spanning over 800 years. As you wander through its narrow cobblestone streets, you'll discover Gothic spires, baroque facades, and art nouveau masterpieces.
      
      The heart of Old Riga is the Town Hall Square (Rātslaukums), home to the iconic House of the Blackheads, a stunning example of Dutch Renaissance architecture. Nearby, St. Peter's Church offers panoramic views of the city from its towering spire.
      
      Don't miss the "Three Brothers" - the oldest complex of dwelling houses in Riga, each representing a different period of the city's architectural development. The Riga Cathedral, founded in 1211, is another must-visit landmark with its impressive organ and beautiful cloister.
      
      The Old Town is also home to numerous museums, cozy cafes, and traditional Latvian restaurants where you can sample local specialties like grey peas with bacon, rye bread, and Riga Black Balsam.
    `,
  },
  sigulda: {
    id: "sigulda",
    name: "Sigulda",
    description:
      'Known as the "Switzerland of Latvia," Sigulda offers breathtaking landscapes, medieval castles, and outdoor activities surrounded by the picturesque Gauja National Park.',
    fullDescription: `
      Sigulda is a picturesque town located in the Gauja River valley, about an hour's drive from Riga. The area is famous for its stunning natural landscapes, especially beautiful during autumn when the forests transform into a vibrant palette of red, orange, and gold.
      
      The town is home to several historical castles. The medieval Sigulda Castle ruins date back to 1207, while the New Castle of Sigulda, built in the 19th century, now houses the local council. Across the valley stands the impressive Turaida Castle, a reconstructed medieval fortress with a museum complex and sculpture park.
      
      Adventure enthusiasts will find plenty to do in Sigulda. The town is Latvia's adventure capital, offering activities like bobsledding on the Olympic track, bungee jumping, zip-lining across the Gauja valley, and extensive hiking and cycling trails through the national park.
      
      Don't miss the opportunity to take the cable car across the Gauja valley for breathtaking views, or visit the Gutmanis Cave, the largest cave in the Baltics with ancient inscriptions dating back to the 17th century.
    `,
  },
  jurmala: {
    id: "jurmala",
    name: "Jūrmala",
    description:
      "Latvia's premier beach resort town features 33 km of white sand beaches along the Baltic Sea, charming wooden architecture, and a relaxing spa culture.",
    fullDescription: `
      Jūrmala is Latvia's premier seaside resort, stretching along 33 kilometers of white sand beach on the Gulf of Riga. The town has been a popular holiday destination since the late 19th century when Russian nobility discovered its charms.
      
      The town is famous for its unique wooden architecture - ornate summer cottages built in the late 19th and early 20th centuries. These charming wooden villas, many in the Art Nouveau style, give Jūrmala its distinctive character. Jomas Street, the main pedestrian thoroughfare, is lined with restaurants, cafes, and shops.
      
      Jūrmala has a long tradition as a spa town, with natural resources like mineral waters, curative mud, and pine-scented air. Many luxury hotels and historic sanatoriums offer spa treatments and wellness programs.
      
      The wide, sandy beach is the town's main attraction, perfect for swimming in summer and long walks year-round. The shallow waters of the Gulf of Riga warm up nicely in summer, making it ideal for families with children.
    `,
  },
  cesis: {
    id: "cesis",
    name: "Cēsis",
    description:
      "One of Latvia's most picturesque towns, Cēsis boasts a well-preserved medieval castle, charming old town, and beautiful surroundings perfect for history enthusiasts.",
    fullDescription: `
      Cēsis is one of Latvia's most charming and historic towns, dating back to 1206 when the Livonian Brothers of the Sword built a castle here. The medieval layout of the town has been preserved, with narrow streets winding around the central square.
      
      The main attraction is the Cēsis Castle complex, consisting of the ruins of the medieval Livonian Order Castle and the New Castle, which now houses the Cēsis History and Art Museum. Visitors can explore the medieval castle ruins with lanterns, climb the western tower for panoramic views, and learn about the region's rich history.
      
      The town's historic center features well-preserved 18th-19th century wooden buildings, the impressive St. John's Church dating from the 13th century, and several art galleries and craft workshops. The central square, Rožu laukums (Rose Square), is a pleasant place to relax at an outdoor cafe.
      
      Surrounding Cēsis is the beautiful Gauja National Park, offering hiking trails, sandstone cliffs, and the picturesque Gauja River valley. The area is particularly stunning in autumn when the forests display vibrant fall colors.
    `,
  },
  kuldiga: {
    id: "kuldiga",
    name: "Kuldīga",
    description:
      "A picturesque town known for its red-tiled roofs, cobblestone streets, and Europe's widest waterfall, Ventas Rumba. The historic center is a well-preserved example of a traditional Latvian town.",
    fullDescription: `
      Kuldīga is often described as one of Latvia's most picturesque towns, with its well-preserved historic center featuring red-tiled roofs, cobblestone streets, and wooden buildings dating from the 17th-19th centuries. The town has a distinctly different feel from other Latvian cities, with an almost Mediterranean atmosphere.
      
      The town's most famous natural attraction is Ventas Rumba, Europe's widest waterfall at 249 meters across (though only 1.6-2 meters high). In spring, you can witness the unique spectacle of fish attempting to jump up the waterfall, giving rise to the town's historical fishing method using baskets to catch the jumping fish.
      
      The old brick bridge across the Venta River, built in 1874, offers excellent views of the waterfall and is a popular spot for photographers. The historic center of Kuldīga is centered around the Town Hall Square with its 17th-century Town Hall.
      
      Don't miss the opportunity to visit the Kuldīga Regional Museum housed in a former synagogue, stroll along the Alekšupīte River which runs through the town center (sometimes called the 'Venice of Latvia'), and explore the ruins of the Livonian Order Castle.
    `,
  },
  liepaja: {
    id: "liepaja",
    name: "Liepāja",
    description:
      "A coastal city with beautiful beaches, a historic naval port, and a vibrant music scene. Known as 'The city where the wind is born,' Liepāja offers a mix of cultural heritage and seaside charm.",
    fullDescription: `
      Liepāja is a vibrant coastal city on Latvia's western shore, known for its beautiful beaches, rich musical heritage, and unique military history. The city's slogan, 'The city where the wind is born,' reflects its breezy coastal location.
      
      The city boasts a gorgeous Blue Flag beach with white sand that stretches for kilometers along the Baltic Sea. The beach park features a landmark musical instrument sculpture and the famous amber clock.
      
      Liepāja has a strong musical tradition and is often called the 'Capital of Latvian Rock Music.' The city hosts numerous music festivals and events throughout the year. Visit the Liepāja Concert Hall 'Great Amber,' an architectural masterpiece shaped like a piece of amber crystal.
      
      One of the most unique attractions is Karosta, a former military naval base north of the city. This area was a closed military territory during the Soviet era and features impressive fortifications, the striking St. Nicholas Naval Cathedral, and the Karosta Prison, now a museum where visitors can experience what life was like for prisoners.
      
      The historic center of Liepāja features beautiful wooden architecture, Art Nouveau buildings, and the largest mechanical organ in the world at St. Trinity Cathedral.
    `,
  },
  rundale: {
    id: "rundale",
    name: "Rundāle Palace",
    description:
      "A magnificent baroque palace often called the 'Versailles of Latvia.' The palace features stunning architecture, lavish interiors, and beautiful French-style gardens.",
    fullDescription: `
      Rundāle Palace is Latvia's most outstanding example of baroque architecture, often called the 'Versailles of Latvia.' Built between 1736 and 1740 as a summer residence for Ernst Johann Biron, Duke of Courland, the palace was designed by the famous Italian architect Francesco Bartolomeo Rastrelli, who also designed the Winter Palace in St. Petersburg.
      
      The palace interior is a masterpiece of luxury and elegance, featuring original 18th-century furniture, silk wallpaper, intricate stucco decorations, and impressive collections of art. The most spectacular rooms include the White Hall, the Gold Hall, and the Duke's bedroom with its elaborate silk bed.
      
      The palace is surrounded by a meticulously restored French-style formal garden covering 10 hectares. The garden features ornate fountains, rose gardens with over 2,400 varieties of roses, green amphitheaters, and sculpted hedges. The garden is particularly beautiful in early summer when the roses are in bloom.
      
      The palace complex also includes a museum dedicated to Latvian history, temporary exhibition spaces, and a hunting lodge. Special events and classical music concerts are regularly held in the palace and gardens during the summer months.
    `,
  },
  gauja: {
    id: "gauja",
    name: "Gauja National Park",
    description:
      "Latvia's largest and oldest national park, featuring diverse landscapes, medieval castles, sandstone cliffs, and extensive hiking and cycling trails through pristine nature.",
    fullDescription: `
      Gauja National Park, established in 1973, is Latvia's largest and oldest national park, covering over 900 square kilometers of pristine nature. The park is centered around the ancient valley of the Gauja River, with dramatic sandstone cliffs, caves, and dense forests.
      
      The park is home to an impressive biodiversity, with over 900 plant species, 149 bird species, and 48 mammal species including lynx, wolves, elk, and beavers. The ancient forests, consisting primarily of pine, spruce, and mixed deciduous trees, cover more than half of the park's territory.
      
      One of the unique features of Gauja National Park is the combination of natural beauty and cultural heritage. The park contains several medieval castles, including Turaida Castle, Sigulda Castle ruins, and Cēsis Castle. These historical monuments are integrated into the natural landscape, creating a fascinating blend of history and nature.
      
      The park offers extensive recreational opportunities with over 500 km of marked hiking trails, cycling routes, and water tourism on the Gauja River. Adventure activities include zip-lining, bungee jumping, and winter sports. The park is particularly beautiful in autumn when the forest foliage turns vibrant shades of red, orange, and gold.
      
      Visitor centers in Sigulda, Līgatne, and Cēsis provide information about the park's attractions, trails, and wildlife.
    `,
  },
}

export default function DestinationPage() {
  const params = useParams()
  const id = params?.id as string
  const [destination, setDestination] = useState(null as any)
  const [loadingDestination, setLoadingDestination] = useState(true)
  const [reviews, setReviews] = useState<any[]>([])
  const [loadingReviews, setLoadingReviews] = useState(true)
  const [reviewError, setReviewError] = useState<string | null>(null)
  const [newRating, setNewRating] = useState<number>(5)
  const [newComment, setNewComment] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const { user, isAuthenticated } = useAuth()

  useEffect(() => {
    if (!id) {
      setLoadingDestination(false)
      return
    }

    const staticDest = destinations[id as keyof typeof destinations]
    if (staticDest) {
      setDestination(staticDest)
      setLoadingDestination(false)
      return
    }

    const numericId = Number(id)
    if (!Number.isFinite(numericId)) {
      setLoadingDestination(false)
      return
    }

    setLoadingDestination(true)
    const fetchDestination = async () => {
      try {
        const res = await fetch(`/api/destinations/${id}`)
        const data = await res.json()
        if (res.ok && data.success && data.destination) {
          const d = data.destination
          setDestination({
            id: String(d.id),
            name: d.name,
            description: d.description || "",
            fullDescription: d.description || "",
            image_url: d.image_url,
          })
        }
      } catch (e) {
        console.error("Error loading destination:", e)
      } finally {
        setLoadingDestination(false)
      }
    }
    fetchDestination()
  }, [id])

  // Загрузка отзывов только для направлений из БД (числовой id). Для slug (riga, sigulda) API не поддерживается.
  const isNumericDestination = typeof id === "string" && Number.isFinite(Number(id))

  useEffect(() => {
    if (!id) return

    if (!isNumericDestination) {
      setReviews([])
      setLoadingReviews(false)
      return
    }

    const fetchReviews = async () => {
      try {
        setLoadingReviews(true)
        setReviewError(null)

        const res = await fetch(`/api/reviews?destinationId=${encodeURIComponent(id)}`)
        const data = await res.json().catch(() => ({}))

        if (res.ok && data.success) {
          setReviews(data.reviews || [])
        } else {
          setReviewError(data.message || "Failed to load reviews")
        }
      } catch (e) {
        console.error("Error loading reviews:", e)
        setReviewError("Failed to load reviews")
      } finally {
        setLoadingReviews(false)
      }
    }

    fetchReviews()
  }, [id, isNumericDestination])

  const averageRating =
    reviews.length > 0
      ? reviews.reduce((sum: number, r: any) => sum + (r.rating || 0), 0) / reviews.length
      : 0

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!id || !isAuthenticated || !user) return
    if (!newComment.trim()) return
    if (!isNumericDestination) return

    try {
      setSubmitting(true)
      setReviewError(null)

      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          destinationId: Number(id),
          userId: user.id,
          rating: newRating,
          comment: newComment.trim(),
        }),
      })

      const data = await res.json().catch(() => ({}))

      if (!res.ok || !data.success) {
        const msg = data.message || `Failed to submit review (${res.status})`
        setReviewError(msg)
        if (typeof window !== "undefined") alert(msg)
        return
      }

      if (data.review) {
        setReviews((prev) => [data.review, ...prev])
      }
      setNewComment("")
      setNewRating(5)
    } catch (e) {
      console.error("Error submitting review:", e)
      const msg = "Could not submit review. Check your connection."
      setReviewError(msg)
      if (typeof window !== "undefined") alert(msg)
    } finally {
      setSubmitting(false)
    }
  }

  if (loadingDestination) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="inline-block h-8 w-8 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin mb-4" />
        <p className="text-gray-600">Loading destination...</p>
      </div>
    )
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

  return (
    <>
      <section className="relative h-[40vh] bg-gray-100 flex items-center justify-center">
        <div className="absolute inset-0 overflow-hidden bg-gray-200"></div>
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

            <div className="relative h-96 mb-8 overflow-hidden rounded-md bg-gray-200"></div>

            <div className="prose max-w-none">
              <p className="text-xl text-gray-700 mb-6">{destination.description}</p>

              {destination.fullDescription.split("\n\n").map((paragraph: string, index: number) => (
                <p key={index} className="mb-4 text-gray-700">
                  {paragraph.trim()}
                </p>
              ))}
            </div>

            {/* Reviews section — только для направлений из БД (числовой id) */}
            <div className="mt-12 pt-10 border-t border-gray-200">
              <div className="bg-white rounded-md shadow-sm border border-gray-200 p-6 md:p-8">
                <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
                  <div>
                    <h2 className="text-2xl font-light text-gray-900 flex items-center gap-2">
                      <Star className="h-6 w-6 text-yellow-500" aria-hidden />
                      Reviews
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                      {!isNumericDestination
                        ? "Reviews are available for places from the Destinations list."
                        : reviews.length > 0
                          ? (
                              <>
                                <span className="font-medium text-gray-900">
                                  {averageRating.toFixed(1)} / 5
                                </span>{" "}
                                — {reviews.length} review{reviews.length === 1 ? "" : "s"}
                              </>
                            )
                          : "No reviews yet. Be the first to share your experience."}
                    </p>
                  </div>
                  <MessageCircle className="h-8 w-8 text-gray-300 shrink-0" aria-hidden />
                </div>

                {!isNumericDestination ? (
                  <div className="p-5 rounded-md border border-gray-200 bg-gray-50/80 text-center text-gray-600">
                    <p className="mb-2">To leave a review, open this place from the <Link href="/destinations" className="text-gray-900 underline">Destinations</Link> list (places from the database).</p>
                  </div>
                ) : (
                  <>
                {/* Форма отзыва */}
                <div className="mb-8 p-5 rounded-md border border-gray-200 bg-gray-50/80">
                  {isAuthenticated && user ? (
                    <>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">
                        Share your experience
                      </h3>
                      <form onSubmit={handleSubmitReview} className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Your rating
                          </label>
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1">
                              {[1, 2, 3, 4, 5].map((value) => (
                                <button
                                  key={value}
                                  type="button"
                                  onClick={() => setNewRating(value)}
                                  className="p-1 rounded focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-1"
                                  aria-label={`${value} star${value === 1 ? "" : "s"}`}
                                >
                                  <Star
                                    className={`h-6 w-6 transition-colors ${
                                      value <= newRating
                                        ? "text-yellow-500 fill-yellow-500"
                                        : "text-gray-300"
                                    }`}
                                  />
                                </button>
                              ))}
                            </div>
                            <span className="text-sm text-gray-600">
                              {newRating} / 5
                            </span>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Comment
                          </label>
                          <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            rows={3}
                            placeholder="What did you like or dislike about this place?"
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                          />
                        </div>

                        {reviewError && (
                          <p className="text-sm text-red-600">{reviewError}</p>
                        )}

                        <button
                          type="submit"
                          disabled={submitting || !newComment.trim()}
                          className="inline-flex items-center justify-center px-5 py-2.5 rounded-md bg-gray-800 text-white text-sm font-medium hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          {submitting ? "Submitting..." : "Submit review"}
                        </button>
                      </form>
                    </>
                  ) : (
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">
                          Want to leave a review?
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          Log in to share your experience and help other travelers.
                        </p>
                      </div>
                      <Link
                        href="/login"
                        className="inline-flex items-center justify-center px-5 py-2.5 rounded-md border border-gray-300 text-sm font-medium text-gray-900 bg-white hover:bg-gray-50 transition-colors"
                      >
                        Log in
                      </Link>
                    </div>
                  )}
                </div>

                {/* Список отзывов */}
                <div>
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-4">
                    {reviews.length > 0 ? "What others say" : "Reviews"}
                  </h3>
                  {loadingReviews ? (
                    <div className="flex items-center gap-3 py-6 text-gray-500">
                      <div className="h-4 w-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                      <span className="text-sm">Loading reviews...</span>
                    </div>
                  ) : reviews.length === 0 ? (
                    <div className="py-8 text-center rounded-md border border-dashed border-gray-200 bg-gray-50/50">
                      <MessageCircle className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">
                        There are no reviews yet for this destination.
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Log in and be the first to share your experience.
                      </p>
                    </div>
                  ) : (
                    <ul className="space-y-4">
                      {reviews.map((review: any) => (
                        <li
                          key={review.id}
                          className="p-4 rounded-md border border-gray-200 bg-white shadow-sm flex gap-4"
                        >
                          <div className="shrink-0">
                            <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200">
                              <UserIcon className="h-5 w-5 text-gray-500" />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-medium text-gray-900">
                                  {review.user?.name || "Traveler"}
                                </span>
                                <span className="inline-flex items-center gap-0.5 text-amber-600">
                                  <Star className="h-4 w-4 fill-current" />
                                  <span className="text-sm">{review.rating}/5</span>
                                </span>
                              </div>
                              {review.createdAt && (
                                <span className="text-xs text-gray-400">
                                  {new Date(review.createdAt).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">
                              {review.comment}
                            </p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                  </>
                )}
              </div>
            </div>

            <div className="mt-12 pt-8 border-t border-gray-200">
              <h2 className="text-2xl font-light mb-6">Explore More Destinations</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.values(destinations)
                  .filter((d: any) => d.id !== destination.id)
                  .slice(0, 4)
                  .map((d: any) => (
                    <Link key={d.id} href={`/destination/${d.id}`} className="group">
                      <div className="relative h-32 mb-2 overflow-hidden rounded-md bg-gray-200"></div>
                      <h3 className="text-sm font-medium group-hover:underline">{d.name}</h3>
                    </Link>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
