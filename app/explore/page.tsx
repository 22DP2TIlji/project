"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { Cloud, Wind, Thermometer, Droplets, Calendar } from "lucide-react"

const EVENTS = [
  {
    id: "song-festival",
    name: "Vispārējie latviešu Dziesmu un Deju svētki",
    date: "2025. gada jūlijs",
    location: "Rīga",
    description:
      "Latvijas Dziesmu un deju svētki ir vērienīgs kultūras notikums, kas notiek reizi piecos gados. Tūkstošiem dziedātāju un dejotāju no visas Latvijas izpilda tradicionālās dziesmas un dejas.",
    highlights: ["UNESCO Nemateriālais kultūras mantojums", "Tūkstošiem dalībnieku", "Nedēļu ilgas svinības"],
    image: "/images/song-festival.jpg",
  },
  {
    id: "riga-festival",
    name: "Rīgas svētki",
    date: "Augusts",
    location: "Rīga",
    description:
      "Ikgadējs kultūras festivāls, kurā tiek piedāvāta mūzika, teātris un māksla. Festivāls pulcē vietējos un starptautiskos māksliniekus dinamiskām kultūras svinībām.",
    highlights: ["Mūzikas koncerti", "Teātra izrādes", "Mākslas izstādes"],
    image: "/images/riga-festival.jpg",
  },
  {
    id: "christmas-markets",
    name: "Ziemassvētku tirdziņi",
    date: "Decembris",
    location: "Rīga",
    description:
      "Tradicionālie Ziemassvētku tirdziņi pašā Rīgas vecpilsētas sirdī. Amatnieku dāvanas, latviešu delikateses un svētku atmosfēra.",
    highlights: ["Amatnieku izstrādājumi", "Tradicionālie ēdieni", "Svētku izklaides"],
    image: "/images/christmas-markets.jpg",
  },
]

const DISHES = [
  {
    id: "rye-bread",
    name: "Rupjmaize",
    description:
      "Tradicionālā latviešu rudzu maize – tumša, blīva un nedaudz skābena. Latvijas virtuves pamatvērtība.",
    details: ["Gatavota no rudzu miltiem", "Cepta malkas krāsnī", "Saglabājas svaiga nedēļām ilgi"],
  },
  {
    id: "grey-peas",
    name: "Pelēkie zirņi ar speķi",
    description:
      "Klasisks latviešu ēdiens, īpaši iecienīts Ziemassvētkos un Jaunajā gadā. Pelēkie zirņi pasniegti ar ceptu speķi un sīpoliem.",
    details: ["Tradicionāls svētku ēdiens", "Bagāts ar olbaltumvielām", "Bieži pasniedz ar kefīru"],
  },
  {
    id: "black-balsam",
    name: "Rīgas Melnais balzams",
    description:
      "Rūgts liķieris, kas gatavots no 24 dabīgām sastāvdaļām, tostarp zaļumiem, saknēm un ogām. Latvijas nacionālais dzēriens.",
    details: ["Radīts 1752. gadā", "45% alkohola saturs", "Bieži izmanto kokteiļos"],
  },
]

const PLACES = [
  {
    name: "Restorāni Rīgā",
    description: "Atklājiet tradicionālos latviešu restorānus galvaspilsētā.",
    options: ["Lido", "1221", "Folkklubs Ala"],
  },
  {
    name: "Centrāltirgus",
    description: "Lielākais tirgus Eiropā. Svaiga produkcija un vietējie gardumi.",
    options: ["Rīgas Centrāltirgus", "Nogaršojiet kūpinātas zivis", "Svaigas ogas sezonā"],
  },
]

interface CurrentWeather {
  temp: number
  feels_like: number
  humidity: number
  pressure: number
  weather: Array<{ main: string; description: string; icon: string }>
  wind_speed: number
}

interface ForecastDay {
  dt: number
  main: { temp: number; humidity: number }
  weather: Array<{ main: string; description: string; icon: string }>
  wind: { speed: number }
  dt_txt?: string
}

const WEATHER_CITIES = [
  { key: "riga", label: "Rīga", lat: 56.9496, lng: 24.1052 },
  { key: "daugavpils", label: "Daugavpils", lat: 55.8747, lng: 26.5362 },
  { key: "liepaja", label: "Liepāja", lat: 56.5047, lng: 21.0108 },
  { key: "jelgava", label: "Jelgava", lat: 56.6511, lng: 23.7213 },
  { key: "ventspils", label: "Ventspils", lat: 57.3937, lng: 21.5647 },
]

function ExploreWeather() {
  const [current, setCurrent] = useState<CurrentWeather | null>(null)
  const [forecast, setForecast] = useState<ForecastDay[]>([])
  const [selectedCity, setSelectedCity] = useState(WEATHER_CITIES[0])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        setLoading(true)
        setError(null)
        const res = await fetch(`/api/weather?lat=${selectedCity.lat}&lng=${selectedCity.lng}`, { cache: "no-store" })
        const data = await res.json()

        if (!res.ok) {
          throw new Error(data?.body || data?.error || "Neizdevās ielādēt laikapstākļus")
        }

        if (data?.current && data?.forecast?.list) {
          const currentData = data.current
          const forecastData = data.forecast
          setCurrent({
            temp: currentData.main.temp,
            feels_like: currentData.main.feels_like,
            humidity: currentData.main.humidity,
            pressure: currentData.main.pressure,
            weather: currentData.weather,
            wind_speed: currentData.wind.speed,
          })
          const daily = forecastData.list.filter((item: { dt_txt?: string }) =>
            String(item.dt_txt || "").includes("12:00:00")
          )
          setForecast(daily)
          return
        }

        if (data?.success && data?.weather) {
          const w = data.weather
          setCurrent({
            temp: w.temperature,
            feels_like: w.temperature,
            humidity: w.humidity ?? 0,
            pressure: 0,
            weather: [{ main: "Laikapstākļi", description: w.note || "Pašreizējie apstākļi", icon: "01d" }],
            wind_speed: w.windSpeed != null ? +(w.windSpeed / 3.6).toFixed(1) : 0,
          })
          setForecast([])
          return
        }

        throw new Error("Nezināma laikapstākļu atbilde")
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Neizdevās ielādēt laikapstākļu datus.")
      } finally {
        setLoading(false)
      }
    }
    fetchWeather()
  }, [selectedCity])

  const getDayName = (timestamp: number) =>
    new Date(timestamp * 1000).toLocaleDateString("lv-LV", { weekday: "long" })

  if (loading) {
    return <p className="text-gray-600 dark:text-gray-300 py-8">Ielādē laikapstākļus…</p>
  }
  if (error) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-900/20 p-4 text-amber-900 dark:text-amber-100">
        {error}
      </div>
    )
  }

  return (
    <div>
      {current && (
        <div className="max-w-3xl mx-auto mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-medium text-gray-900 dark:text-white mb-2">
                  Pašreizējie laikapstākļi ({selectedCity.label})
                </h3>
                <p className="text-gray-600 dark:text-gray-300 capitalize">
                  {new Date().toLocaleDateString("lv-LV", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
              <img
                src={`https://openweathermap.org/img/wn/${current.weather[0].icon}@2x.png`}
                alt={current.weather[0].description}
                className="w-20 h-20"
              />
            </div>
            <div className="mb-6">
              <label className="block text-sm text-gray-600 dark:text-gray-300 mb-2">Pilsēta</label>
              <select
                value={selectedCity.key}
                onChange={(e) => {
                  const next = WEATHER_CITIES.find((c) => c.key === e.target.value)
                  if (next) setSelectedCity(next)
                }}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                {WEATHER_CITIES.map((city) => (
                  <option key={city.key} value={city.key}>
                    {city.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center space-x-3">
                <Thermometer className="w-6 h-6 text-blue-500" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Temperatūra</p>
                  <p className="text-2xl font-medium text-gray-900 dark:text-white">{Math.round(current.temp)}°C</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Wind className="w-6 h-6 text-blue-500" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Vēja ātrums</p>
                  <p className="text-2xl font-medium text-gray-900 dark:text-white">{current.wind_speed} m/s</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Droplets className="w-6 h-6 text-blue-500" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Mitrums</p>
                  <p className="text-2xl font-medium text-gray-900 dark:text-white">{current.humidity}%</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Cloud className="w-6 h-6 text-blue-500" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Apstākļi</p>
                  <p className="text-2xl font-medium text-gray-900 dark:text-white capitalize">
                    {current.weather[0].description}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h3 className="text-2xl font-medium text-gray-900 dark:text-white mb-6 flex items-center">
            <Calendar className="w-6 h-6 mr-2" />
            5 dienu prognoze
          </h3>
          {forecast.length === 0 ? (
            <p className="text-gray-600 dark:text-gray-300">Prognoze nav pieejama</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              {forecast.map((day) => (
                <div
                  key={day.dt}
                  className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white">{getDayName(day.dt)}</h4>
                    <img
                      src={`https://openweathermap.org/img/wn/${day.weather[0].icon}.png`}
                      alt={day.weather[0].description}
                      className="w-10 h-10"
                    />
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Temp. {Math.round(day.main.temp)}°C</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300 capitalize">{day.weather[0].description}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Vējš {day.wind.speed} m/s</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function ExplorePage() {
  const [eventQuery, setEventQuery] = useState("")
  const [dishQuery, setDishQuery] = useState("")

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <section className="relative h-[38vh] bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
        <div className="absolute inset-0 overflow-hidden bg-gray-200 dark:bg-gray-700" />
        <div className="relative z-10 text-center px-4">
          <h1 className="text-4xl md:text-6xl font-light text-gray-900 dark:text-white">Iepazīsti Latviju</h1>
          <p className="mt-4 text-lg md:text-xl text-gray-700 dark:text-gray-200 max-w-2xl mx-auto">
            Pasākumi, virtuve un laikapstākļi vienuviet
          </p>
          <nav className="mt-8 flex flex-wrap justify-center gap-3 text-sm">
            <a
              href="#events"
              className="px-4 py-2 rounded-md bg-white/90 dark:bg-gray-800/90 shadow border border-gray-200 dark:border-gray-600 hover:bg-blue-50 dark:hover:bg-gray-700"
            >
              Pasākumi
            </a>
            <a
              href="#cuisine"
              className="px-4 py-2 rounded-md bg-white/90 dark:bg-gray-800/90 shadow border border-gray-200 dark:border-gray-600 hover:bg-blue-50 dark:hover:bg-gray-700"
            >
              Virtuve
            </a>
            <a
              href="#weather"
              className="px-4 py-2 rounded-md bg-white/90 dark:bg-gray-800/90 shadow border border-gray-200 dark:border-gray-600 hover:bg-blue-50 dark:hover:bg-gray-700"
            >
              Laikapstākļi
            </a>
          </nav>
        </div>
      </section>

      <section id="events" className="scroll-mt-20 py-12 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-light text-center mb-2 text-gray-900 dark:text-white">Pasākumi Latvijā</h2>
          <p className="text-center text-gray-600 dark:text-gray-300 mb-8">Atklājiet festivālus un notikumus</p>
          <div className="max-w-2xl mx-auto mb-10">
            <input
              type="text"
              placeholder="Meklēt pasākumus…"
              value={eventQuery}
              onChange={(e) => setEventQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-800 dark:text-white"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {EVENTS.filter(
              (e) =>
                e.name.toLowerCase().includes(eventQuery.toLowerCase()) ||
                e.location.toLowerCase().includes(eventQuery.toLowerCase()) ||
                e.description.toLowerCase().includes(eventQuery.toLowerCase())
            ).map((event) => (
              <div
                key={event.id}
                className="group border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden hover:shadow-md bg-white dark:bg-gray-800"
              >
                <div className="relative h-48 bg-gray-200 dark:bg-gray-700">
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-xl font-medium text-white">{event.name}</h3>
                    <p className="text-gray-200 text-sm">
                      {event.date} · {event.location}
                    </p>
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-gray-600 dark:text-gray-300 mb-4">{event.description}</p>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Svarīgākais</h4>
                  <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 text-sm">
                    {event.highlights.map((h, i) => (
                      <li key={i}>{h}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="cuisine" className="scroll-mt-20 py-12 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-light text-center mb-2 text-gray-900 dark:text-white">Latviešu virtuve</h2>
          <p className="text-center text-gray-600 dark:text-gray-300 mb-8">Tradicionālie ēdieni un kur tos nobaudīt</p>
          <div className="max-w-2xl mx-auto mb-10">
            <input
              type="text"
              placeholder="Meklēt ēdienus…"
              value={dishQuery}
              onChange={(e) => setDishQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-800 dark:text-white"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {DISHES.filter(
              (d) =>
                d.name.toLowerCase().includes(dishQuery.toLowerCase()) ||
                d.description.toLowerCase().includes(dishQuery.toLowerCase())
            ).map((dish) => (
              <div
                key={dish.id}
                className="border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden bg-white dark:bg-gray-800 p-6"
              >
                <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">{dish.name}</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">{dish.description}</p>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2 text-sm">Detaļas</h4>
                <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 text-sm">
                  {dish.details.map((detail, i) => (
                    <li key={i}>{detail}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <h3 className="text-2xl font-light text-center mb-8 text-gray-900 dark:text-white">Kur nobaudīt</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {PLACES.map((place) => (
              <div
                key={place.name}
                className="border border-gray-200 dark:border-gray-700 rounded-md p-6 bg-white dark:bg-gray-800"
              >
                <h4 className="text-xl font-medium mb-2 text-gray-900 dark:text-white">{place.name}</h4>
                <p className="text-gray-600 dark:text-gray-300 mb-4">{place.description}</p>
                <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 text-sm">
                  {place.options.map((opt) => (
                    <li key={opt}>{opt}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="weather" className="scroll-mt-20 py-12 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-light text-center mb-8 text-gray-900 dark:text-white">Laikapstākļi Latvijā</h2>
          <ExploreWeather />
          <p className="text-center mt-10">
            <Link href="/destinations" className="text-blue-600 dark:text-blue-400 hover:underline">
              Skatīt galamērķus →
            </Link>
          </p>
        </div>
      </section>
    </div>
  )
}