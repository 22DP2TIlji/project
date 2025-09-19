import { supabase } from '@/lib/supabaseClient'

export default async function AccommodationsPage() {
  try {
    // загружаем данные из Supabase
    const { data: accommodations, error } = await supabase
      .from('accommodations')
      .select('*')

    if (error) {
      throw error
    }

    return (
      <div>
        {accommodations?.map((accommodation) => (
          <div key={accommodation.id}>
            <h3>{accommodation.name}</h3>
            <p>{accommodation.description}</p>
          </div>
        ))}
      </div>
    )
  } catch (error: any) {
    return <div>Error fetching accommodations: {error.message}</div>
  }
}
