const { PrismaClient } = require("@prisma/client")
const fs = require("fs")
const path = require("path")

const prisma = new PrismaClient()

const REQUEST_DELAY_MS = 250
const WIKIMEDIA_API = "https://commons.wikimedia.org/w/api.php"
const WIKIPEDIA_API = "https://en.wikipedia.org/w/api.php"
const OVERRIDES_FILE = path.join(__dirname, "image-overrides.json")
const MISSING_FILE = path.join(__dirname, "image-missing.json")

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function fetchWikipediaThumbnail(query) {
  const encodedQuery = encodeURIComponent(query)
  const summaryUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodedQuery}`

  const response = await fetch(summaryUrl, {
    headers: {
      "User-Agent": "latvia-travel-image-bot/1.0",
      Accept: "application/json",
    },
  })

  if (!response.ok) return null

  const data = await response.json()
  const raw = data?.thumbnail?.source || data?.originalimage?.source || null
  if (!raw || typeof raw !== "string") return null

  const normalized = raw.trim()
  if (!normalized) return null
  if (normalized.startsWith("//")) return `https:${normalized}`
  if (normalized.startsWith("http://")) return normalized.replace("http://", "https://")
  return normalized
}

function normalizeUrl(raw) {
  if (!raw || typeof raw !== "string") return null
  const normalized = raw.trim()
  if (!normalized) return null
  if (normalized.startsWith("//")) return `https:${normalized}`
  if (normalized.startsWith("http://")) return normalized.replace("http://", "https://")
  return normalized
}

async function fetchWikipediaSearchThumbnail(query) {
  const encodedQuery = encodeURIComponent(query)
  const url = `${WIKIPEDIA_API}?action=query&format=json&origin=*&generator=search&gsrsearch=${encodedQuery}&gsrlimit=1&prop=pageimages|info&pithumbsize=1600&inprop=url`

  const response = await fetch(url, {
    headers: {
      "User-Agent": "latvia-travel-image-bot/1.0",
      Accept: "application/json",
    },
  })

  if (!response.ok) return null
  const data = await response.json()
  const page = data?.query?.pages ? Object.values(data.query.pages)[0] : null
  return normalizeUrl(page?.thumbnail?.source || null)
}

async function fetchWikimediaByCoordinates(lat, lng, radius = 8000) {
  if (typeof lat !== "number" || typeof lng !== "number") return null
  const params = new URLSearchParams({
    action: "query",
    format: "json",
    origin: "*",
    generator: "geosearch",
    ggslimit: "5",
    ggsradius: String(radius),
    ggscoord: `${lat}|${lng}`,
    prop: "pageimages|info",
    pithumbsize: "1600",
    inprop: "url",
  })

  const response = await fetch(`${WIKIMEDIA_API}?${params.toString()}`, {
    headers: {
      "User-Agent": "latvia-travel-image-bot/1.0",
      Accept: "application/json",
    },
  })
  if (!response.ok) return null

  const data = await response.json()
  const pages = data?.query?.pages ? Object.values(data.query.pages) : []
  for (const page of pages) {
    const image = normalizeUrl(page?.thumbnail?.source || null)
    if (image) return image
  }

  return null
}

async function fetchWikimediaSearchThumbnail(query) {
  const params = new URLSearchParams({
    action: "query",
    format: "json",
    origin: "*",
    generator: "search",
    gsrsearch: query,
    gsrlimit: "3",
    prop: "pageimages|info",
    pithumbsize: "1600",
    inprop: "url",
  })

  const response = await fetch(`${WIKIMEDIA_API}?${params.toString()}`, {
    headers: {
      "User-Agent": "latvia-travel-image-bot/1.0",
      Accept: "application/json",
    },
  })
  if (!response.ok) return null

  const data = await response.json()
  const pages = data?.query?.pages ? Object.values(data.query.pages) : []
  for (const page of pages) {
    const image = normalizeUrl(page?.thumbnail?.source || null)
    if (image) return image
  }
  return null
}

async function resolveImageUrl(destination) {
  if (destination.latitude && destination.longitude) {
    try {
      const byCoords = await fetchWikimediaByCoordinates(Number(destination.latitude), Number(destination.longitude))
      if (byCoords) return byCoords
    } catch (_error) {
      // fallback below
    }
    await sleep(REQUEST_DELAY_MS)
  }

  const variants = [
    destination.name,
    `${destination.name}, Latvia`,
    destination.city ? `${destination.name}, ${destination.city}` : null,
    destination.city ? `${destination.city}, Latvia` : null,
  ].filter(Boolean)

  for (const q of variants) {
    try {
      const imageUrl = await fetchWikipediaThumbnail(q)
      if (imageUrl) return imageUrl
      const searchImage = await fetchWikipediaSearchThumbnail(q)
      if (searchImage) return searchImage
      const commonsImage = await fetchWikimediaSearchThumbnail(`${q} Latvia`)
      if (commonsImage) return commonsImage
    } catch (_error) {
      // пробуем следующий вариант запроса
    }
    await sleep(REQUEST_DELAY_MS)
  }

  return null
}

async function main() {
  const force = process.argv.includes("--force")
  const overrides = loadOverrides()

  const where = force
    ? {}
    : {
        OR: [{ imageUrl: null }, { imageUrl: "" }],
      }

  const destinations = await prisma.destination.findMany({
    where,
    select: {
      id: true,
      name: true,
      city: true,
      latitude: true,
      longitude: true,
      imageUrl: true,
    },
    orderBy: { id: "asc" },
  })

  if (!destinations.length) {
    console.log("No destinations to update.")
    return
  }

  let updated = 0
  let skipped = 0
  const missing = []

  for (const destination of destinations) {
    const override =
      overrides.byId[String(destination.id)] ||
      overrides.byName[destination.name?.toLowerCase?.() || ""]
    const imageUrl = override || (await resolveImageUrl(destination))

    if (!imageUrl) {
      skipped += 1
      console.log(`⚠️  No image found for: ${destination.name}`)
      missing.push({
        id: destination.id,
        name: destination.name,
        city: destination.city,
        latitude: destination.latitude,
        longitude: destination.longitude,
      })
      continue
    }

    await prisma.destination.update({
      where: { id: destination.id },
      data: { imageUrl },
    })
    updated += 1
    console.log(`✅ Updated: ${destination.name}`)
  }

  console.log("\nDone.")
  console.log(`Updated: ${updated}`)
  console.log(`Skipped: ${skipped}`)

  fs.writeFileSync(MISSING_FILE, JSON.stringify(missing, null, 2))
  console.log(`Missing list saved: ${MISSING_FILE}`)
}

function loadOverrides() {
  if (!fs.existsSync(OVERRIDES_FILE)) {
    return { byId: {}, byName: {} }
  }

  try {
    const raw = fs.readFileSync(OVERRIDES_FILE, "utf8")
    const parsed = JSON.parse(raw)
    return {
      byId: parsed?.byId || {},
      byName: Object.fromEntries(
        Object.entries(parsed?.byName || {}).map(([name, url]) => [String(name).toLowerCase(), url])
      ),
    }
  } catch (error) {
    console.warn(`⚠️  Failed to parse ${OVERRIDES_FILE}:`, error)
    return { byId: {}, byName: {} }
  }
}

main()
  .catch((error) => {
    console.error("Script failed:", error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })