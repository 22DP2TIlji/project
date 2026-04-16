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
    name: "Rīgas vecpilsēta",
    description:
      "Izpētiet burvīgās bruģētās ielas un krāsainās ēkas Rīgas vēsturiskajā vecpilsētā, kas ir UNESCO Pasaules mantojuma sarakstā iekļauta vieta ar satriecošu arhitektūru.",
    fullDescription: `
      Rīgas vecpilsēta (Vecrīga) ir aizraujošs arhitektūras stilu apvienojums, kas aptver vairāk nekā 800 gadus. Klīstot pa tās šaurajām bruģētajām ieliņām, jūs atklāsiet gotikas smailes, baroka fasādes un jūgendstila šedevrus.
      
      Vecrīgas sirds ir Rātslaukums, kur atrodas ikoniskais Melngalvju nams – lielisks holandiešu renesanses arhitektūras piemērs. Turpat blakus Svētā Pētera baznīca piedāvā panorāmas skatu uz pilsētu no tās augstās smailes.
      
      Nepalaidiet garām "Trīs brāļus" – vecāko dzīvojamo māju kompleksu Rīgā, kur katra ēka pārstāv citu pilsētas arhitektūras attīstības periodu. Rīgas Doms, kas dibināts 1211. gadā, ir vēl viens obligāti apmeklējams piemineklis ar iespaidīgām ērģelēm un skaistu krusteju.
      
      Vecpilsētā atrodas arī neskaitāmi muzeji, mājīgas kafejnīcas un tradicionāli latviešu restorāni, kur var nobaudīt vietējos ēdienus, piemēram, pelēkos zirņus ar speķi, rupjmaizi un Rīgas Melno balzamu.
    `,
  },
  sigulda: {
    id: "sigulda",
    name: "Sigulda",
    description:
      'Pazīstama kā "Latvijas Šveice", Sigulda piedāvā elpu aizraujošas ainavas, viduslaiku pilis un āra aktivitātes gleznainā Gaujas nacionālā parka ieskautā vidē.',
    fullDescription: `
      Sigulda ir gleznaina pilsēta Gaujas senlejā, aptuveni stundas brauciena attālumā no Rīgas. Šī vieta ir slavena ar savām satriecošajām dabas ainavām, kas ir īpaši skaistas rudenī, kad meži pārvēršas dinamiskā sarkanā, oranžā un zelta krāsu paletē.
      
      Pilsētā atrodas vairākas vēsturiskas pilis. Viduslaiku Siguldas pils drupas datētas ar 1207. gadu, savukārt Siguldas Jaunajā pilī, kas celta 19. gadsimtā, tagad atrodas pašvaldība. Ielejas pretējā pusē paceļas iespaidīgā Turaidas pils – rekonstruēts viduslaiku cietoksnis ar muzeja kompleksu un skulptūru parku.
      
      Piedzīvojumu meklētāji Siguldā atradīs daudz ko darīt. Pilsēta ir Latvijas piedzīvojumu galvaspilsēta, piedāvājot tādas aktivitātes kā braukšanu ar bobslēgu olimpiskajā trasē, gumijlēkšanu, braucienu ar vagoniņu pāri Gaujas senlejai, kā arī plašas pārgājienu un riteņbraukšanas takas nacionālajā parkā.
      
      Nepalaidiet garām iespēju doties ar gaisa vagoniņu pāri Gaujas ielejai, lai baudītu elpu aizraujošus skatus, vai apmeklēt Gūtmaņa alu – lielāko alu Baltijā ar seniem ierakstiem, kas datēti pat ar 17. gadsimtu.
    `,
  },
  jurmala: {
    id: "jurmala",
    name: "Jūrmala",
    description:
      "Latvijas galvenā kūrortpilsēta ar 33 km garām baltu smilšu pludmalēm Baltijas jūras krastā, burvīgu koka arhitektūru un relaksējošu spa kultūru.",
    fullDescription: `
      Jūrmala ir Latvijas nozīmīgākais kūrorts, kas stiepjas 33 kilometru garumā gar Rīgas jūras līča balto smilšu pludmali. Pilsēta ir bijusi populārs brīvdienu galamērķis kopš 19. gadsimta beigām.
      
      Pilsēta ir slavena ar savu unikālo koka arhitektūru – greznām vasarnīcām, kas celtas 19. gadsimta beigās un 20. gadsimta sākumā. Šīs burvīgās koka villas, no kurām daudzas ir jūgendstila stilā, piešķir Jūrmalai tās raksturīgo tēlu. Jomas iela, galvenā gājēju iela, ir pilna ar restorāniem, kafejnīcām un veikaliem.
      
      Jūrmalai ir senas kūrortpilsētas tradīcijas ar tādiem dabas resursiem kā minerālūdeņi, ārstnieciskās dūņas un priežu smaržas piesātināts gaiss. Daudzas luksusa viesnīcas un vēsturiskās sanatorijas piedāvā spa procedūras un labsajūtas programmas.
      
      Plašā, smilšainā pludmale ir pilsētas galvenā atrakcija, kas ir lieliski piemērota peldēšanai vasarā un garām pastaigām visa gada garumā. Rīgas jūras līča seklie ūdeņi vasarā labi uzsilst, padarot to par ideālu vietu ģimenēm ar bērniem.
    `,
  },
  cesis: {
    id: "cesis",
    name: "Cēsis",
    description:
      "Viena no Latvijas gleznainākajām pilsētām, Cēsis lepojas ar labi saglabājušos viduslaiku pili, burvīgu vecpilsētu un skaistu apkārtni, kas ir lieliski piemērota vēstures entuziastiem.",
    fullDescription: `
      Cēsis ir viena no Latvijas šarmantākajām un vēsturiskākajām pilsētām, kuras pirmsākumi meklējami 1206. gadā. Pilsētas viduslaiku plānojums ir saglabājies, ar šaurām ieliņām, kas vijas ap centrālo laukumu.
      
      Galvenais apskates objekts ir Cēsu pils komplekss, kas sastāv no Livonijas ordeņa viduslaiku pils drupām un Jaunās pils, kurā tagad atrodas Cēsu Vēstures un mākslas muzejs. Apmeklētāji var izpētīt viduslaiku pils drupas ar lukturīšiem, uzkāpt Rietumu tornī, lai baudītu panorāmas skatu, un uzzināt par reģiona bagāto vēsturi.
      
      Pilsētas vēsturiskajā centrā ir labi saglabājušās 18.–19. gadsimta koka ēkas, iespaidīgā Svētā Jāņa baznīca, kas celta 13. gadsimtā, kā arī vairākas mākslas galerijas un amatnieku darbnīcas. Centrālais laukums, Rožu laukums, ir patīkama vieta, kur atpūsties kādā āra kafejnīcā.
      
      Cēsu apkārtnē atrodas skaistais Gaujas nacionālais parks, kas piedāvā pārgājienu takas, smilšakmens klintis un gleznaino Gaujas upes ieleju.
    `,
  },
  kuldiga: {
    id: "kuldiga",
    name: "Kuldīga",
    description:
      "Gleznaina pilsēta, kas pazīstama ar sarkanajiem dakstiņu jumtiem, bruģētām ielām un Eiropas platāko ūdenskritumu – Ventas rumbu.",
    fullDescription: `
      Kuldīga bieži tiek raksturota kā viena no Latvijas fotogēniskākajām pilsētām. Tās vēsturiskajam centram ir gandrīz Vidusjūras reģiona atmosfēra.
      
      Pilsētas slavenākais dabas objekts ir Ventas rumba, Eiropas platākais ūdenskritums (249 metri). Pavasarī šeit var vērot unikālu skatu – lidojošās zivis, kas mēģina pārvarēt ūdenskritumu.
      
      Senais ķieģeļu tilts pār Ventu, celts 1874. gadā, piedāvā lielisku skatu uz ūdenskritumu un ir iecienīta vieta fotogrāfiem. Kuldīgas vēsturiskais centrs ir iekļauts UNESCO Pasaules mantojuma sarakstā.
    `,
  },
  liepaja: {
    id: "liepaja",
    name: "Liepāja",
    description:
      "Piekrastes pilsēta ar skaistām pludmalēm, vēsturisku kara ostu un dzīvīgu mūzikas dzīvi. Zināma kā 'pilsēta, kurā piedzimst vējš'.",
    fullDescription: `
      Liepāja ir dinamiska ostas pilsēta Latvijas rietumu piekrastē. Tā lepojas ar brīnišķīgu Zilā karoga pludmali ar baltām, smalkām smiltīm.
      
      Liepājai ir spēcīgas mūzikas tradīcijas, un tā bieži tiek dēvēta par Latvijas rokmūzikas galvaspilsētu. Apmeklējiet koncertzāli 'Lielais dzintars', kas ir arhitektūras šedevrs.
      
      Viens no unikālākajiem apskates objektiem ir Karosta – bijusī militārā jūras bāze pilsētas ziemeļos ar tās cietumu, kas tagad ir muzejs.
    `,
  },
  rundale: {
    id: "rundale",
    name: "Rundāles pils",
    description:
      "Iespaidīga baroka pils, ko bieži dēvē par 'Latvijas Versaļu'. Pils izceļas ar satriecošu arhitektūru un krāšņiem franču dārziem.",
    fullDescription: `
      Rundāles pils ir izcilākais baroka arhitektūras piemērs Latvijā. To projektējis slavenais itāļu arhitekts Frančesko Bartolomeo Rastrelli.
      
      Pils interjers ir greznības un elegances paraugs ar oriģinālām 18. gadsimta mēbelēm, zīda tapetēm un sarežģītiem stuka dekorējumiem. Pils dārzā atrodas rožu kolekcija ar vairāk nekā 2400 šķirnēm.
    `,
  },
  gauja: {
    id: "gauja",
    name: "Gaujas nacionālais parks",
    description:
      "Latvijas lielākais un vecākais nacionālais parks ar daudzveidīgām ainavām, klintīm un pārgājienu takām.",
    fullDescription: `
      Gaujas nacionālais parks, dibināts 1973. gadā, aizsargā Gaujas senlejas unikālo dabu. Parks ir mājvieta lielai bioloģiskajai daudzveidībai un kultūrvēsturiskiem pieminekļiem.
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
  const [moreDestinations, setMoreDestinations] = useState<any[]>([])
  const [loadingMore, setLoadingMore] = useState(true)
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
        const res = await fetch(`/api/destinations/${id}`, { cache: "no-store" })
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
        console.error("Kļūda ielādējot galamērķi:", e)
      } finally {
        setLoadingDestination(false)
      }
    }
    fetchDestination()
  }, [id])

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

        const res = await fetch(`/api/destinations/${id}/reviews`)
        const data = await res.json().catch(() => ({}))

        if (res.ok && data.success) {
          setReviews(data.reviews || [])
        } else {
          setReviewError(data.message || "Neizdevās ielādēt atsauksmes")
        }
      } catch (e) {
        console.error("Kļūda ielādējot atsauksmes:", e)
        setReviewError("Neizdevās ielādēt atsauksmes")
      } finally {
        setLoadingReviews(false)
      }
    }

    fetchReviews()
  }, [id, isNumericDestination])

  useEffect(() => {
    if (!destination) {
      setLoadingMore(false)
      return
    }
    setLoadingMore(true)
    const loadMore = async () => {
      try {
        const res = await fetch('/api/destinations?limit=8', { cache: "no-store" })
        const data = await res.json()
        const list = data?.destinations || []
        const currentId = destination?.id != null ? String(destination.id) : null
        const filtered = currentId
          ? list.filter((d: any) => String(d.id) !== currentId)
          : list
        setMoreDestinations(filtered.slice(0, 4))
      } catch {
        setMoreDestinations([])
      } finally {
        setLoadingMore(false)
      }
    }
    loadMore()
  }, [destination])

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

      const res = await fetch(`/api/destinations/${id}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
          rating: newRating,
          comment: newComment.trim(),
        }),
      })

      const data = await res.json().catch(() => ({}))

      if (!res.ok || !data.success) {
        const msg = data.message || `Neizdevās pievienot atsauksmi (${res.status})`
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
      console.error("Kļūda pievienojot atsauksmi:", e)
      const msg = "Neizdevās pievienot atsauksmi. Pārbaudiet savienojumu."
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
        <p className="text-gray-600">Ielādē galamērķi...</p>
      </div>
    )
  }

  if (!destination) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-light mb-4">Galamērķis nav atrasts</h1>
        <p className="mb-8 text-gray-600">Meklētais galamērķis neeksistē vai ir izdzēsts.</p>
        <Link
          href="/destinations"
          className="inline-block px-6 py-3 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
        >
          Atpakaļ uz galamērķiem
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
                <span>← Atpakaļ uz galamērķiem</span>
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

            <div className="mt-12 pt-10 border-t border-gray-200">
              <div className="bg-white rounded-md shadow-sm border border-gray-200 p-6 md:p-8">
                <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
                  <div>
                    <h2 className="text-2xl font-light text-gray-900 flex items-center gap-2">
                      <Star className="h-6 w-6 text-yellow-500" aria-hidden />
                      Atsauksmes
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                      {!isNumericDestination
                        ? "Atsauksmes ir pieejamas vietām no Galamērķu saraksta."
                        : reviews.length > 0
                          ? (
                              <>
                                <span className="font-medium text-gray-900">
                                  {averageRating.toFixed(1)} / 5
                                </span>{" "}
                                — {reviews.length} atsauksme{reviews.length % 10 === 1 && reviews.length % 100 !== 11 ? "" : "s"}
                              </>
                            )
                          : "Vēl nav nevienas atsauksmes. Esi pirmais, kas dalās pieredzē!"}
                    </p>
                  </div>
                  <MessageCircle className="h-8 w-8 text-gray-300 shrink-0" aria-hidden />
                </div>

                {!isNumericDestination ? (
                  <div className="p-5 rounded-md border border-gray-200 bg-gray-50/80 text-center text-gray-600">
                    <p className="mb-2">Lai atstātu atsauksmi, atveriet šo vietu no <Link href="/destinations" className="text-gray-900 underline">Galamērķu</Link> saraksta.</p>
                  </div>
                ) : (
                  <>
                <div className="mb-8 p-5 rounded-md border border-gray-200 bg-gray-50/80">
                  {isAuthenticated && user ? (
                    <>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">
                        Dalies ar savu pieredzi
                      </h3>
                      <form onSubmit={handleSubmitReview} className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Tavs vērtējums
                          </label>
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1">
                              {[1, 2, 3, 4, 5].map((value) => (
                                <button
                                  key={value}
                                  type="button"
                                  onClick={() => setNewRating(value)}
                                  className="p-1 rounded focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-1"
                                  aria-label={`${value} zvaigzne${value === 1 ? "" : "s"}`}
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
                            Komentārs
                          </label>
                          <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            rows={3}
                            placeholder="Kas tev šajā vietā patika vai nepatika?"
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
                          {submitting ? "Nosūta..." : "Iesniegt atsauksmi"}
                        </button>
                      </form>
                    </>
                  ) : (
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">
                          Vēlies atstāt atsauksmi?
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          Pieslēdzies, lai dalītos pieredzē un palīdzētu citiem ceļotājiem.
                        </p>
                      </div>
                      <Link
                        href="/login"
                        className="inline-flex items-center justify-center px-5 py-2.5 rounded-md border border-gray-300 text-sm font-medium text-gray-900 bg-white hover:bg-gray-50 transition-colors"
                      >
                        Pieslēgties
                      </Link>
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-4">
                    {reviews.length > 0 ? "Ko saka citi" : "Atsauksmes"}
                  </h3>
                  {loadingReviews ? (
                    <div className="flex items-center gap-3 py-6 text-gray-500">
                      <div className="h-4 w-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                      <span className="text-sm">Ielādē atsauksmes...</span>
                    </div>
                  ) : reviews.length === 0 ? (
                    <div className="py-8 text-center rounded-md border border-dashed border-gray-200 bg-gray-50/50">
                      <MessageCircle className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">
                        Šim galamērķim vēl nav nevienas atsauksmes.
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Pieslēdzies un esi pirmais!
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
                                  {review.user?.name || "Ceļotājs"}
                                </span>
                                <span className="inline-flex items-center gap-0.5 text-amber-600">
                                  <Star className="h-4 w-4 fill-current" />
                                  <span className="text-sm">{review.rating}/5</span>
                                </span>
                              </div>
                              {review.createdAt && (
                                <span className="text-xs text-gray-400">
                                  {new Date(review.createdAt).toLocaleDateString("lv-LV")}
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
              <h2 className="text-2xl font-light mb-6">Izpētiet citus galamērķus</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {moreDestinations.map((d: any) => (
                  <Link key={d.id} href={`/destination/${d.id}`} className="group">
                    <div className="relative h-32 mb-2 overflow-hidden rounded-md bg-gray-200">
                      {d.image_url && (
                        <img
                          src={d.image_url}
                          alt={d.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      )}
                    </div>
                    <h3 className="text-sm font-medium group-hover:underline">{d.name}</h3>
                    {d.city && <p className="text-xs text-gray-500 mt-0.5">{d.city}</p>}
                  </Link>
                ))}
              </div>
              {loadingMore && moreDestinations.length === 0 && (
                <p className="text-gray-500 text-sm">Ielādē galamērķus...</p>
              )}
              {!loadingMore && moreDestinations.length === 0 && (
                <Link href="/destinations" className="text-blue-600 hover:underline text-sm">
                  Skatīt visus galamērķus
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  )
}