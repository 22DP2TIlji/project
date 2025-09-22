// lib/auth-utils.ts
import { supabase } from './db'

export async function getUserFromId(userId: string) {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, name, email, role')
      .eq('id', userId)
      .single()

    if (error || !data) {
      return null
    }

    return data
  } catch (error) {
    console.error('Error fetching user:', error)
    return null
  }
}