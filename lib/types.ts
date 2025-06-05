export interface Destination {
  id: number; // Based on the database schema
  name: string;
  description?: string; // Made nullable in database
  category?: string; // Made nullable in database
  region?: string; // Made nullable in database
  latitude?: number; // Made nullable in database
  longitude?: number; // Made nullable in database
  image?: string; // Added based on usage in Home page
  // Add other fields as needed based on your database schema
} 