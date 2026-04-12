"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { Cloud, Wind, Thermometer, Droplets, Calendar } from "lucide-react"

const EVENTS = [
  {
    id: "song-festival",
    name: "Latvian Song and Dance Festival",
    date: "July 2025",
    location: "Rīga",
    description:
      "The Latvian Song and Dance Celebration is a massive cultural event held every five years. Thousands of singers and dancers from across Latvia perform traditional songs and dances.",
    highlights: ["UNESCO Intangible Cultural Heritage", "Thousands of participants", "Week-long celebration"],
    image: "/images/song-festival.jpg",
  },
  {
    id: "riga-festival",
    name: "Rīga Festival",
    date: "June",
    location: "Rīga",
    description:
      "Annual cultural festival featuring music, theater, and art. The festival brings together local and international artists for a vibrant celebration of culture.",
    highlights: ["Music concerts", "Theater performances", "Art exhibitions"],
    image: "/images/riga-festival.jpg",
  },
  {
    id: "christmas-markets",
    name: "Christmas Markets",
    date: "December",
    location: "Rīga",
    description:
      "Traditional Christmas markets in the heart of Rīga's Old Town. Handcrafted gifts, Latvian delicacies, and festive atmosphere.",
    highlights: ["Handmade crafts", "Traditional food", "Festive entertainment"],
    image: "/images/christmas-markets.jpg",
  },
]

const DISHES = [
  {
    id: "rye-bread",
    name: "Rye Bread",
    description:
      "Traditional Latvian rye bread (rupjmaize) - dark, dense, and slightly sour. A staple of Latvian cuisine.",
    details: ["Made from rye flour", "Baked in wood-fired ovens", "Keeps fresh for weeks"],
  },
  {
    id: "grey-peas",
    name: "Grey Peas with Bacon",
    description:
      "A classic Latvian New Year's dish. Grey peas (pelēkie zirņi) served with fried bacon and onions.",
    details: ["Traditional holiday dish", "Rich in protein", "Often served with kefir"],
  },
  {
    id: "black-balsam",
    name: "Riga Black Balsam",
    description:
      "A bitter liqueur made from 24 natural ingredients including herbs, roots, and berries. Latvia's national drink.",
    details: ["Created in 1752", "45% ABV", "Often used in cocktails"],
  },
]

const PLACES = [
  {
    name: "Restaurants in Rīga",
    description: "Discover traditional Latvian restaurants in the capital.",
    options: ["Lido", "1221", "Folkklub Ala"],
  },
  {
    name: "Central Market",
    description: "The largest market in Europe. Fresh produce and local specialties.",
    options: ["Rīga Central Market", "Try smoked fish", "Fresh berries in season"],
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

function ExploreWeather() {
  const [current, setCurrent] = useState<CurrentWeather | null>(null)
  const [forecast, setForecast] = useState<ForecastDay[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        setLoading(true)
        setError(null)
        const lat = 56.9496
        const lng = 24.1052
        const res = await fetch(`/api/weather?lat=${lat}&lng=${lng}`, { cache: "no-store" })
        const data = await res.json()

        if (!res.ok) {
          throw new Error(data?.body || data?.error || "Failed to load weather")
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
            weather: [{ main: "Weather", description: w.note || "Current conditions", icon: "01d" }],
            wind_speed: w.windSpeed != null ? +(w.windSpeed / 3.6).toFixed(1) : 0,
          })
          setForecast([])
          return
        }

        throw new Error("Unknown weather response")
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to load weather data.")
      } finally {
        setLoading(false)
      }
    }
    fetchWeather()
  }, [])

  const getDayName = (timestamp: number) =>
    new Date(timestamp * 1000).toLocaleDateString("en-US", { weekday: "long" })

  if (loading) {
    return <p className="text-gray-600 dark:text-gray-300 py-8">Loading weather…</p>
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
                <h3 className="text-2xl font-medium text-gray-900 dark:text-white mb-2">Current weather (Rīga)</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {new Date().toLocaleDateString("en-US", {
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center space-x-3">
                <Thermometer className="w-6 h-6 text-blue-500" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Temperature</p>
                  <p className="text-2xl font-medium text-gray-900 dark:text-white">{Math.round(current.temp)}°C</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Wind className="w-6 h-6 text-blue-500" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Wind speed</p>
                  <p className="text-2xl font-medium text-gray-900 dark:text-white">{current.wind_speed} m/s</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Droplets className="w-6 h-6 text-blue-500" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Humidity</p>
                  <p className="text-2xl font-medium text-gray-900 dark:text-white">{current.humidity}%</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Cloud className="w-6 h-6 text-blue-500" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Conditions</p>
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
            5-Day Forecast
          </h3>
          {forecast.length === 0 ? (
            <p className="text-gray-600 dark:text-gray-300">Forecast unavailable</p>
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
                  <p className="text-sm text-gray-600 dark:text-gray-300">Temp {Math.round(day.main.temp)}°C</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300 capitalize">{day.weather[0].description}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Wind {day.wind.speed} m/s</p>
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

  const filteredEvents = EVENTS.filter(
    (e) =>
      e.name.toLowerCase().includes(eventQuery.toLowerCase()) ||
      e.location.toLowerCase().includes(eventQuery.toLowerCase()) ||
      e.description.toLowerCase().includes(eventQuery.toLowerCase())
  )

  const filteredDishes = DISHES.filter(
    (d) =>
      d.name.toLowerCase().includes(dishQuery.toLowerCase()) ||
      d.description.toLowerCase().includes(dishQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <section className="relative h-[38vh] bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
        <div className="absolute inset-0 overflow-hidden bg-gray-200 dark:bg-gray-700" />
        <div className="relative z-10 text-center px-4">
          <h1 className="text-4xl md:text-6xl font-light text-gray-900 dark:text-white">Explore Latvia</h1>
          <p className="mt-4 text-lg md:text-xl text-gray-700 dark:text-gray-200 max-w-2xl mx-auto">
            Events, cuisine, and weather in one place
          </p>
          <nav className="mt-8 flex flex-wrap justify-center gap-3 text-sm">
            <a
              href="#events"
              className="px-4 py-2 rounded-md bg-white/90 dark:bg-gray-800/90 shadow border border-gray-200 dark:border-gray-600 hover:bg-blue-50 dark:hover:bg-gray-700"
            >
              Events
            </a>
            <a
              href="#cuisine"
              className="px-4 py-2 rounded-md bg-white/90 dark:bg-gray-800/90 shadow border border-gray-200 dark:border-gray-600 hover:bg-blue-50 dark:hover:bg-gray-700"
            >
              Cuisine
            </a>
            <a
              href="#weather"
              className="px-4 py-2 rounded-md bg-white/90 dark:bg-gray-800/90 shadow border border-gray-200 dark:border-gray-600 hover:bg-blue-50 dark:hover:bg-gray-700"
            >
              Weather
            </a>
          </nav>
        </div>
      </section>

      <section id="events" className="scroll-mt-20 py-12 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-light text-center mb-2 text-gray-900 dark:text-white">Events in Latvia</h2>
          <p className="text-center text-gray-600 dark:text-gray-300 mb-8">Discover festivals and events</p>
          <div className="max-w-2xl mx-auto mb-10">
            <input
              type="text"
              placeholder="Search events…"
              value={eventQuery}
              onChange={(e) => setEventQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-800 dark:text-white"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredEvents.map((event) => (
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
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Highlights</h4>
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
          <h2 className="text-3xl font-light text-center mb-2 text-gray-900 dark:text-white">Latvian cuisine</h2>
          <p className="text-center text-gray-600 dark:text-gray-300 mb-8">Traditional dishes and where to try them</p>
          <div className="max-w-2xl mx-auto mb-10">
            <input
              type="text"
              placeholder="Search dishes…"
              value={dishQuery}
              onChange={(e) => setDishQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-800 dark:text-white"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {filteredDishes.map((dish) => (
              <div
                key={dish.id}
                className="border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden bg-white dark:bg-gray-800 p-6"
              >
                <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">{dish.name}</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">{dish.description}</p>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2 text-sm">Details</h4>
                <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 text-sm">
                  {dish.details.map((detail, i) => (
                    <li key={i}>{detail}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <h3 className="text-2xl font-light text-center mb-8 text-gray-900 dark:text-white">Where to try</h3>
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
          <h2 className="text-3xl font-light text-center mb-8 text-gray-900 dark:text-white">Weather in Latvia</h2>
          <ExploreWeather />
          <p className="text-center mt-10">
            <Link href="/destinations" className="text-blue-600 dark:text-blue-400 hover:underline">
              Browse destinations →
            </Link>
          </p>
        </div>
      </section>
    </div>
  )
}
