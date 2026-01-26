"use client"

import { useState, useEffect } from "react"
import { Cloud, Droplet, Wind, Thermometer } from "lucide-react"

interface WeatherWidgetProps {
  destinationId?: number
  lat?: number
  lng?: number
}

export default function WeatherWidget({ destinationId, lat, lng }: WeatherWidgetProps) {
  const [weather, setWeather] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchWeather = async () => {
      setLoading(true)
      try {
        let url = "/api/weather?"
        if (destinationId) {
          url += `destinationId=${destinationId}`
        } else if (lat && lng) {
          url += `lat=${lat}&lng=${lng}`
        } else {
          setLoading(false)
          return
        }

        const res = await fetch(url)
        const data = await res.json()

        if (data.success) {
          setWeather(data.weather)
        }
      } catch (error) {
        console.error("Error fetching weather:", error)
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

  if (!weather) {
    return null
  }

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
      {weather.note && (
        <p className="text-xs text-gray-600 mt-4 italic">{weather.note}</p>
      )}
    </div>
  )
}
