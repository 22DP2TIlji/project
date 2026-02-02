/**
 * Загрузка мест Латвии (смотровые вышки, парки, природа) в таблицу destinations.
 * Использует данные из latvia-places-data.js.
 *
 * Запуск:
 *   node scripts/seed-latvia-places.js
 *   pnpm db:seed
 *   npx prisma db seed
 *
 * Повторный запуск создаст дубликаты. Чтобы загрузить заново — сначала удалите
 * нужные записи в БД (например через Prisma Studio: pnpm db:studio).
 */

require('dotenv').config({ path: '.env' })
const { PrismaClient } = require('@prisma/client')
const latviaPlaces = require('./latvia-places-data.js')

const prisma = new PrismaClient()

function mapPlaceToDestination(place) {
  return {
    name: place.name,
    latitude: place.latitude,
    longitude: place.longitude,
    country: place.country ?? 'Latvia',
    city: place.city ?? null,
    description: place.description ?? '',
    category: place.category ?? null,
    region: place.region ?? null,
  }
}

async function main() {
  console.log('Seeding Latvia places into destinations...')
  const data = latviaPlaces.map(mapPlaceToDestination)

  const result = await prisma.destination.createMany({
    data,
  })

  console.log(`Done. Inserted ${result.count} destinations.`)
}

main()
  .catch((e) => {
    console.error('Seed failed:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
