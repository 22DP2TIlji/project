import prisma from '@/lib/prisma'

interface Accommodation {
  id: number
  name: string
  description: string | null
}

export default async function AccommodationsPage() {
  try {
    // загружаем данные из базы данных
    const accommodations = await prisma.accommodation.findMany() as Accommodation[]

    return (
      <div>
        {accommodations?.map((accommodation: Accommodation) => (
          <div key={accommodation.id}>
            <h3>{accommodation.name}</h3>
            <p>{accommodation.description || ''}</p>
          </div>
        ))}
      </div>
    )
  } catch (error: any) {
    return (
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-2xl font-semibold mb-4">Accommodations</h1>
        <div className="text-red-600">{error?.message || 'Error fetching accommodations.'}</div>
        <p className="mt-4 text-sm text-gray-600">To enable database access, create a <code>.env.local</code> file in the project root with:</p>
        <pre className="mt-2 rounded bg-gray-100 p-3 text-sm overflow-auto">{`DATABASE_URL="mysql://user:password@localhost:3306/database_name"`}</pre>
        <p className="mt-2 text-sm text-gray-600">Then restart the dev server.</p>
      </div>
    )
  }
}
