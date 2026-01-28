"use client"

import { useState, useEffect } from "react"
import { Cloud, Droplet, Wind, Thermometer } from "lucide-react"

interface WeatherWidgetProps {
  destinationId?: number
  lat?: number
  lng?: number
}

type WidgetWeather = {
  temperature: number
  humidity: number | null
  windSpeed: number | null
  precipitation: number | null
  note?: string | null
}

export default function WeatherWidget({ destinationId, lat, lng }: WeatherWidgetProps) {
  const [weather, setWeather] = useState<WidgetWeather | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchWeather = async () => {
      setLoading(true)
      try {
        let url = "/api/weather?"
        if (typeof destinationId === "number") {
          url += `destinationId=${destinationId}`
        } else if (lat != null && lng != null) {
          url += `lat=${lat}&lng=${lng}`
        } else {
          setWeather(null)
          setLoading(false)
          return
        }

        const res = await fetch(url, { cache: "no-store" })
        const data = await res.json()

        // ✅ формат 1: твой виджетовый { success, weather }
        if (data?.success && data?.weather) {
          setWeather(data.weather)
          return
        }

        // ✅ формат 2: страничный (OpenWeather-like) { current, forecast }
        // current.main.temp, current.wind.speed
        if (data?.current?.main?.temp != null) {
          const w: WidgetWeather = {
            temperature: Math.round(data.current.main.temp),
            humidity: data.current.main.humidity ?? null,
            // на странице ты показываешь m/s, а в виджете km/h — приводим:
            windSpeed: data.current.wind?.speed != null ? Math.round(data.current.wind.speed * 3.6) : null,
            precipitation: null,
            note: null,
          }
          setWeather(w)
          return
        }

        // если ничего не распознали
        setWeather(null)
      } catch (error) {
        console.error("Error fetching weather:", error)
        setWeather(null)
      } finally {
        setLoading(false)
      }
    }

    fetchWeather()
  }, [destinationId, lat, lng])

  if (loading) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
        <p className="text-gray-600">Loading weather...</p>
      </div>
    )
  }

  if (!weather) return null

  return (
    <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-md p-6">
      <h3 className="text-xl font-light mb-4 flex items-center gap-2">
        <Cloud className="h-5 w-5" />
        Weather
      </h3>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="flex items-center gap-2">
          <Thermometer className="h-5 w-5 text-red-500" />
          <div>
            <p className="text-sm text-gray-600">Temperature</p>
            <p className="text-2xl font-light">{weather.temperature}°C</p>
          </div>
        </div>

        {weather.humidity !== null && (
          <div className="flex items-center gap-2">
            <Droplet className="h-5 w-5 text-blue-500" />
            <div>
              <p className="text-sm text-gray-600">Humidity</p>
              <p className="text-2xl font-light">{weather.humidity}%</p>
            </div>
          </div>
        )}

        {weather.windSpeed !== null && (
          <div className="flex items-center gap-2">
            <Wind className="h-5 w-5 text-gray-500" />
            <div>
              <p className="text-sm text-gray-600">Wind</p>
              <p className="text-2xl font-light">{weather.windSpeed} km/h</p>
            </div>
          </div>
        )}

        {weather.precipitation !== null && weather.precipitation > 0 && (
          <div className="flex items-center gap-2">
            <Droplet className="h-5 w-5 text-blue-600" />
            <div>
              <p className="text-sm text-gray-600">Rain</p>
              <p className="text-2xl font-light">{weather.precipitation} mm</p>
            </div>
          </div>
        )}
      </div>

      {weather.note && <p className="text-xs text-gray-600 mt-4 italic">{weather.note}</p>}
    </div>
  )
}
