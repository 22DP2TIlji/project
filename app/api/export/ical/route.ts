import { NextRequest, NextResponse } from 'next/server'

// API для экспорта маршрута в iCal формат
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { route, places, startDate } = body

    if (!route || !places || !Array.isArray(places)) {
      return NextResponse.json({ success: false, message: 'Invalid route data' }, { status: 400 })
    }

    const start = startDate ? new Date(startDate) : new Date()
    const end = new Date(start.getTime() + (route.time || 0) * 60 * 60 * 1000)

    // Генерируем iCal формат
    let ical = 'BEGIN:VCALENDAR\r\n'
    ical += 'VERSION:2.0\r\n'
    ical += 'PRODID:-//TravelLatvia//Route Planner//EN\r\n'
    ical += 'CALSCALE:GREGORIAN\r\n'
    ical += 'METHOD:PUBLISH\r\n'

    // Событие для всего маршрута
    ical += 'BEGIN:VEVENT\r\n'
    ical += `UID:route-${Date.now()}@travellatvia.com\r\n`
    ical += `DTSTAMP:${formatDate(new Date())}\r\n`
    ical += `DTSTART:${formatDate(start)}\r\n`
    ical += `DTEND:${formatDate(end)}\r\n`
    ical += `SUMMARY:Route: ${route.startPoint} to ${route.endPoint}\r\n`
    ical += `DESCRIPTION:Distance: ${route.distance} km\\nEstimated time: ${Math.floor(route.time || 0)} hours\r\n`
    ical += `LOCATION:${route.startPoint} to ${route.endPoint}\r\n`
    ical += 'END:VEVENT\r\n'

    // События для каждого места
    places.forEach((place: any, index: number) => {
      const placeStart = new Date(start.getTime() + index * 2 * 60 * 60 * 1000) // 2 часа на место
      const placeEnd = new Date(placeStart.getTime() + 2 * 60 * 60 * 1000)

      ical += 'BEGIN:VEVENT\r\n'
      ical += `UID:place-${place.id}-${Date.now()}@travellatvia.com\r\n`
      ical += `DTSTAMP:${formatDate(new Date())}\r\n`
      ical += `DTSTART:${formatDate(placeStart)}\r\n`
      ical += `DTEND:${formatDate(placeEnd)}\r\n`
      ical += `SUMMARY:Visit: ${place.name}\r\n`
      ical += `DESCRIPTION:${place.description || ''}\\nDistance: ${place.distance?.toFixed(1) || 0} km\r\n`
      if (place.latitude && place.longitude) {
        ical += `LOCATION:${Number(place.latitude)},${Number(place.longitude)}\r\n`
      }
      ical += 'END:VEVENT\r\n'
    })

    ical += 'END:VCALENDAR\r\n'

    return new NextResponse(ical, {
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': `attachment; filename="route-${route.startPoint}-${route.endPoint}.ics"`,
      },
    })
  } catch (error) {
    console.error('Error generating iCal:', error)
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}

function formatDate(date: Date): string {
  const year = date.getUTCFullYear()
  const month = String(date.getUTCMonth() + 1).padStart(2, '0')
  const day = String(date.getUTCDate()).padStart(2, '0')
  const hours = String(date.getUTCHours()).padStart(2, '0')
  const minutes = String(date.getUTCMinutes()).padStart(2, '0')
  const seconds = String(date.getUTCSeconds()).padStart(2, '0')
  return `${year}${month}${day}T${hours}${minutes}${seconds}Z`
}
