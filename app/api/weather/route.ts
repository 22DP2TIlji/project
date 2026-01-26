import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// API для получения погоды для направления
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const destinationId = searchParams.get('destinationId')
    const lat = searchParams.get('lat')
    const lng = searchParams.get('lng')

    if (!destinationId && (!lat || !lng)) {
      return NextResponse.json({ success: false, message: 'Destination ID or coordinates required' }, { status: 400 })
    }

    let latitude: number | null = null
    let longitude: number | null = null

    if (destinationId) {
      const destination = await prisma.destination.findUnique({
        where: { id: parseInt(destinationId) },
        select: { latitude: true, longitude: true },
      })

      if (!destination || !destination.latitude || !destination.longitude) {
        return NextResponse.json({ success: false, message: 'Destination not found or has no coordinates' }, { status: 404 })
      }

      latitude = Number(destination.latitude)
      longitude = Number(destination.longitude)
    } else {
      latitude = parseFloat(lat!)
      longitude = parseFloat(lng!)
    }

    // Получаем последние данные о погоде из БД
    const weatherData = await prisma.weatherData.findFirst({
      where: {
        location: {
          latitude: { equals: latitude },
          longitude: { equals: longitude },
        },
      },
      orderBy: { timestamp: 'desc' },
    })

    if (weatherData) {
      return NextResponse.json({
        success: true,
        weather: {
          temperature: Number(weatherData.temperature),
          humidity: weatherData.humidity ? Number(weatherData.humidity) : null,
          windSpeed: weatherData.windSpeed ? Number(weatherData.windSpeed) : null,
          windDirection: weatherData.windDirection,
          pressure: weatherData.pressure ? Number(weatherData.pressure) : null,
          precipitation: weatherData.precipitation ? Number(weatherData.precipitation) : null,
          timestamp: weatherData.timestamp,
        },
      })
    }

    // Если нет данных в БД, возвращаем примерные данные (для демонстрации)
    // В реальном приложении здесь был бы вызов внешнего API погоды
    return NextResponse.json({
      success: true,
      weather: {
        temperature: 15 + Math.round(Math.random() * 10), // 15-25°C
        humidity: 60 + Math.round(Math.random() * 20), // 60-80%
        windSpeed: 5 + Math.round(Math.random() * 10), // 5-15 km/h
        windDirection: Math.round(Math.random() * 360),
        pressure: 1013 + Math.round(Math.random() * 10), // 1013-1023 hPa
        precipitation: Math.random() > 0.7 ? Math.round(Math.random() * 5) : 0, // 0-5 mm
        timestamp: new Date(),
        note: 'Sample data - integrate with weather API for real-time data',
      },
    })
  } catch (error) {
    console.error('Error fetching weather:', error)
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}
