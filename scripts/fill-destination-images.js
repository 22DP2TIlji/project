const { PrismaClient } = require("@prisma/client")

const prisma = new PrismaClient()

const REQUEST_DELAY_MS = 250

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

async function resolveImageUrl(destination) {
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
    } catch (_error) {
      // пробуем следующий вариант запроса
    }
    await sleep(REQUEST_DELAY_MS)
  }

  return null
}

async function main() {
  const force = process.argv.includes("--force")

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

  for (const destination of destinations) {
    const imageUrl = await resolveImageUrl(destination)

    if (!imageUrl) {
      skipped += 1
      console.log(`⚠️  No image found for: ${destination.name}`)
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
}

main()
  .catch((error) => {
    console.error("Script failed:", error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })