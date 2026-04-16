import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

type CityConfig = { name: string; lat: number; lng: number }

const MAJOR_CITIES: Record<string, CityConfig> = {
  riga: { name: 'Rīga', lat: 56.9496, lng: 24.1052 },
  daugavpils: { name: 'Daugavpils', lat: 55.8747, lng: 26.5362 },
  liepaja: { name: 'Liepāja', lat: 56.5047, lng: 21.0108 },
  jelgava: { name: 'Jelgava', lat: 56.6511, lng: 23.7213 },
  ventspils: { name: 'Ventspils', lat: 57.3937, lng: 21.5647 },
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const destinationId = searchParams.get('destinationId')
    const lat = searchParams.get('lat')
    const lng = searchParams.get('lng')
    const city = searchParams.get('city')?.trim().toLowerCase()

    if (!destinationId && !city && (!lat || !lng)) {
      return NextResponse.json(
        { success: false, message: 'Nepieciešams destinationId, pilsēta vai koordinātes' },
        { status: 400 }
      )
    }

    let latitude: number | null = null
    let longitude: number | null = null
    let locationName: string | null = null

    if (city) {
      const cityConfig = MAJOR_CITIES[city]
      if (!cityConfig) {
        return NextResponse.json(
          { success: false, message: 'Neatbalstīta pilsēta. Izmanto: riga, daugavpils, liepaja, jelgava, ventspils' },
          { status: 400 }
        )
      }
      latitude = cityConfig.lat
      longitude = cityConfig.lng
      locationName = cityConfig.name
    }

    if (destinationId && latitude === null && longitude === null) {
      const destination = await prisma.destination.findUnique({
        where: { id: parseInt(destinationId) },
        select: { latitude: true, longitude: true, city: true, name: true },
      })

      if (!destination || !destination.latitude || !destination.longitude) {
        return NextResponse.json({ success: false, message: 'Galamērķis nav atrasts vai tam nav koordināšu' }, { status: 404 })
      }

      latitude = Number(destination.latitude)
      longitude = Number(destination.longitude)
      locationName = destination.city || destination.name
    } else if (latitude === null || longitude === null) {
      latitude = parseFloat(lat!)
      longitude = parseFloat(lng!)
    }

    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      return NextResponse.json({ success: false, message: 'Nederīgas koordinātes' }, { status: 400 })
    }

    const meteoRes = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,apparent_temperature,relative_humidity_2m,surface_pressure,wind_speed_10m,weather_code&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&timezone=auto&forecast_days=6`,
      { cache: 'no-store' }
    )

    if (!meteoRes.ok) throw new Error(`Open-Meteo error ${meteoRes.status}`)

    const meteoData = await meteoRes.json()
    const current = meteoData?.current
    const hourly = meteoData?.hourly
    if (!current || !hourly?.time) throw new Error('Invalid weather response')

    const weatherInfo = mapWeatherCode(Number(current.weather_code))
    const forecastList = buildForecastList(hourly)

    return NextResponse.json({
      success: true,
      location: {
        name: locationName || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
        lat: latitude,
        lng: longitude,
      },
      current: {
        main: {
          temp: Number(current.temperature_2m),
          feels_like: Number(current.apparent_temperature),
          humidity: Number(current.relative_humidity_2m),
          pressure: Number(current.surface_pressure),
        },
        weather: [weatherInfo],
        wind: {
          speed: Number((Number(current.wind_speed_10m) / 3.6).toFixed(1)),
        },
      },
      forecast: { list: forecastList },
      weather: {
        temperature: Number(current.temperature_2m),
        humidity: Number(current.relative_humidity_2m),
        windSpeed: Number(current.wind_speed_10m),
        windDirection: null,
        pressure: Number(current.surface_pressure),
        precipitation: null,
        timestamp: new Date(),
        note: `${weatherInfo.description} • Open-Meteo`,
      },
    })
  } catch (error) {
    console.error('Error fetching weather:', error)
    return NextResponse.json({ success: false, message: 'Iekšējā servera kļūda' }, { status: 500 })
  }
}

function buildForecastList(hourly: {
  time: string[]
  temperature_2m: number[]
  relative_humidity_2m: number[]
  wind_speed_10m: number[]
  weather_code: number[]
}) {
  const result: Array<{
    dt: number
    main: { temp: number; humidity: number }
    weather: Array<{ main: string; description: string; icon: string }>
    wind: { speed: number }
    dt_txt: string
  }> = []

  const seenDays = new Set<string>()
  for (let i = 0; i < hourly.time.length; i++) {
    const time = hourly.time[i]
    if (!time || !time.includes('12:00')) continue
    const dayKey = time.slice(0, 10)
    if (seenDays.has(dayKey)) continue
    seenDays.add(dayKey)

    result.push({
      dt: Math.floor(new Date(time).getTime() / 1000),
      main: {
        temp: Number(hourly.temperature_2m[i] ?? 0),
        humidity: Number(hourly.relative_humidity_2m[i] ?? 0),
      },
      weather: [mapWeatherCode(Number(hourly.weather_code[i] ?? 0))],
      wind: {
        speed: Number((Number(hourly.wind_speed_10m[i] ?? 0) / 3.6).toFixed(1)),
      },
      dt_txt: `${dayKey} 12:00:00`,
    })

    if (result.length === 5) break
  }

  return result
}

function mapWeatherCode(code: number): { main: string; description: string; icon: string } {
  if (code === 0) return { main: 'Skaidrs', description: 'skaidras debesis', icon: '01d' }
  if ([1, 2].includes(code)) return { main: 'Mākoņains', description: 'daļēji mākoņains', icon: '02d' }
  if (code === 3) return { main: 'Mākoņains', description: 'apmācies', icon: '04d' }
  if ([45, 48].includes(code)) return { main: 'Migla', description: 'migla', icon: '50d' }
  if ([51, 53, 55, 56, 57].includes(code)) return { main: 'Smidzina', description: 'smidzina', icon: '09d' }
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return { main: 'Lietus', description: 'lietus', icon: '10d' }
  if ([71, 73, 75, 77, 85, 86].includes(code)) return { main: 'Sniegs', description: 'sniegs', icon: '13d' }
  if ([95, 96, 99].includes(code)) return { main: 'Pērkona negaiss', description: 'pērkona negaiss', icon: '11d' }
  return { main: 'Laikapstākļi', description: 'nezināmi apstākļi', icon: '01d' }
}