import { createClient } from '@supabase/supabase-js'

// Environment variables - make sure these are set in your .env.local file
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables')
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseKey)

// Database connection test function
export async function testConnection() {
  try {
    const { data, error } = await supabase
      .from('destinations') // Replace with your actual table name
      .select('*')
      .limit(1)
    
    if (error) {
      console.error('Database connection error:', error)
      return false
    }
    
    console.log('Database connection successful')
    return true
  } catch (error) {
    console.error('Database connection failed:', error)
    return false
  }
}

// Helper functions for common database operations
export const db = {
  // Get all destinations
  async getDestinations() {
    const { data, error } = await supabase
      .from('destinations')
      .select('*')
    
    if (error) {
      throw new Error(`Error fetching destinations: ${error.message}`)
    }
    
    return data
  },

  // Get destination by ID
  async getDestinationById(id: string) {
    const { data, error } = await supabase
      .from('destinations')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) {
      throw new Error(`Error fetching destination: ${error.message}`)
    }
    
    return data
  },

  // Get accommodations
  async getAccommodations() {
    const { data, error } = await supabase
      .from('accommodations')
      .select('*')
    
    if (error) {
      throw new Error(`Error fetching accommodations: ${error.message}`)
    }
    
    return data
  },

  // User-related functions
  async getUserLikedDestinations(userId: string) {
    const { data, error } = await supabase
      .from('liked_destinations')
      .select(`
        *,
        destinations (*)
      `)
      .eq('user_id', userId)
    
    if (error) {
      throw new Error(`Error fetching liked destinations: ${error.message}`)
    }
    
    return data
  },

  async addLikedDestination(userId: string, destinationId: string) {
    const { data, error } = await supabase
      .from('liked_destinations')
      .insert([
        { user_id: userId, destination_id: destinationId }
      ])
    
    if (error) {
      throw new Error(`Error adding liked destination: ${error.message}`)
    }
    
    return data
  },

  async removeLikedDestination(userId: string, destinationId: string) {
    const { data, error } = await supabase
      .from('liked_destinations')
      .delete()
      .eq('user_id', userId)
      .eq('destination_id', destinationId)
    
    if (error) {
      throw new Error(`Error removing liked destination: ${error.message}`)
    }
    
    return data
  }
}

export default supabase