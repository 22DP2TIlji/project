"use client"

import { useState, useEffect } from "react"
import { Cloud, Wind, Thermometer, Droplets, Calendar } from "lucide-react"

interface CurrentWeather {
  temp: number
  feels_like: number
  humidity: number
  pressure: number
  weather: Array<{
    main: string
    description: string
    icon: string
  }>
  wind_speed: number
}

interface ForecastDay {
  dt: number
  main: {
    temp: number
    humidity: number
  }
  weather: Array<{
    main: string
    description: string
    icon: string
  }>
  wind: {
    speed: number
  }
}

export default function WeatherPage() {
  const [current, setCurrent] = useState<CurrentWeather | null>(null)
  const [forecast, setForecast] = useState<ForecastDay[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        setLoading(true)
        setError(null)

        const res = await fetch("/api/weather", { cache: "no-store" })
        const data = await res.json()

        if (!res.ok) {
          // /api/weather отдаёт body со строкой ответа OpenWeather — покажем её,
          // чтобы точно видеть причину (401, лимит, etc.)
          throw new Error(data?.body || data?.error || "Failed to load weather")
        }

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

        // Get one forecast per day (at 12:00)
        const daily = forecastData.list.filter((item: any) =>
          item.dt_txt.includes("12:00:00")
        )
        setForecast(daily)
      } catch (err: any) {
        setError(err?.message || "Failed to load weather data.")
      } finally {
        setLoading(false)
      }
    }

    fetchWeather()
  }, [])

  const getDayName = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString("en-US", { weekday: "long" })
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-medium text-gray-900 dark:text-white mb-4">
            Weather Information Unavailable
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-4">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-light text-center mb-8 text-gray-900 dark:text-white">
          Weather in Riga
        </h1>

        {current && (
          <div className="max-w-3xl mx-auto mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-medium text-gray-900 dark:text-white mb-2">
                    Current Weather
                  </h2>
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
                    <p className="text-2xl font-medium text-gray-900 dark:text-white">
                      {Math.round(current.temp)}°C
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Wind className="w-6 h-6 text-blue-500" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Wind Speed</p>
                    <p className="text-2xl font-medium text-gray-900 dark:text-white">
                      {current.wind_speed} m/s
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Droplets className="w-6 h-6 text-blue-500" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Humidity</p>
                    <p className="text-2xl font-medium text-gray-900 dark:text-white">
                      {current.humidity}%
                    </p>
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

        {/* 5-Day Forecast */}
        <div className="max-w-5xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-medium text-gray-900 dark:text-white mb-6 flex items-center">
              <Calendar className="w-6 h-6 mr-2" />
              5-Day Forecast
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              {forecast.map((day) => (
                <div
                  key={day.dt}
                  className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      {getDayName(day.dt)}
                    </h3>
                    <img
                      src={`https://openweathermap.org/img/wn/${day.weather[0].icon}.png`}
                      alt={day.weather[0].description}
                      className="w-10 h-10"
                    />
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Temp: {Math.round(day.main.temp)}°C
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300 capitalize">
                      {day.weather[0].description}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Wind: {day.wind.speed} m/s
                    </p>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
