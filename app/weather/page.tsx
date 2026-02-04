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
  dt_txt?: string
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

        // ✅ всегда запрашиваем Ригу (иначе твой /api/weather может вернуть другой формат или ошибку)
        const lat = 56.9496
        const lng = 24.1052
        const res = await fetch(`/api/weather?lat=${lat}&lng=${lng}`, { cache: "no-store" })
        const data = await res.json()

        if (!res.ok) {
          throw new Error(data?.body || data?.error || "Neparedzēta kļūda, ielādējot laika prognozi")
        }

        // ✅ формат 1: OpenWeather-like { current, forecast }
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

          const daily = forecastData.list.filter((item: any) => String(item.dt_txt || "").includes("12:00:00"))
          setForecast(daily)
          return
        }

        // ✅ формат 2: виджетовый { success, weather }
        // В нём нет прогноза и иконок, поэтому показываем только "Current"
        if (data?.success && data?.weather) {
          const w = data.weather
          setCurrent({
            temp: w.temperature,
            feels_like: w.temperature,
            humidity: w.humidity ?? 0,
            pressure: 0,
            weather: [
              {
                main: "Weather",
                description: w.note || "Current conditions",
                icon: "01d", // fallback
              },
            ],
            // виджет хранит km/h, а страница показывает m/s -> переводим обратно:
            wind_speed: w.windSpeed != null ? +(w.windSpeed / 3.6).toFixed(1) : 0,
          })
          setForecast([])
          return
        }

        throw new Error("Unknown /api/weather response format")
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
    return <div className="min-h-screen flex items-center justify-center">Iekraušana...</div>
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-medium text-gray-900 dark:text-white mb-4">
            Laika informācija nav pieejama
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
          Laika apstākļi Rīgā
        </h1>

        {current && (
          <div className="max-w-3xl mx-auto mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-medium text-gray-900 dark:text-white mb-2">
                    Pašreizējais laiks
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300">
                    {new Date().toLocaleDateString("lv", {
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
                    <p className="text-sm text-gray-600 dark:text-gray-400">Temperatūra</p>
                    <p className="text-2xl font-medium text-gray-900 dark:text-white">
                      {Math.round(current.temp)}°C
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Wind className="w-6 h-6 text-blue-500" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Vēja ātrums</p>
                    <p className="text-2xl font-medium text-gray-900 dark:text-white">
                      {current.wind_speed} m/s
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Droplets className="w-6 h-6 text-blue-500" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Mitrums</p>
                    <p className="text-2xl font-medium text-gray-900 dark:text-white">
                      {current.humidity}%
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Cloud className="w-6 h-6 text-blue-500" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Nosacījumi</p>
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
              5 dienu prognoze
            </h2>

            {forecast.length === 0 ? (
              <p className="text-gray-600 dark:text-gray-300">Prognoze šim datu avotam nav pieejama.</p>
            ) : (
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
                        Temperatūra: {Math.round(day.main.temp)}°C
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-300 capitalize">
                        {day.weather[0].description}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Vējš: {day.wind.speed} m/s
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  )
}
