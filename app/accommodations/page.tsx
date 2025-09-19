
import { db } from '@/lib/db'

export default async function AccommodationsPage() {
  try {
    const accommodations = await db.getAccommodations()
    return (
      <div>
        {accommodations.map(accommodation => (
          <div key={accommodation.id}>
            <h3>{accommodation.name}</h3>
            <p>{accommodation.description}</p>
          </div>
        ))}
      </div>
    )
  } catch (error) {
    return <div>Error fetching accommodations: {error.message}</div>
  }
}