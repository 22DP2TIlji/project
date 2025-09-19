-- Enable Row Level Security
ALTER DATABASE postgres SET timezone TO 'Europe/Riga';

-- Create destinations table
CREATE TABLE IF NOT EXISTS destinations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    location VARCHAR(255),
    image_url TEXT,
    category VARCHAR(100),
    rating DECIMAL(3,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create accommodations table
CREATE TABLE IF NOT EXISTS accommodations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    location VARCHAR(255),
    image_url TEXT,
    price_per_night DECIMAL(10,2),
    rating DECIMAL(3,2),
    amenities JSONB,
    destination_id INTEGER REFERENCES destinations(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create users table (if using custom auth, otherwise Supabase handles this)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create liked_destinations table (many-to-many relationship)
CREATE TABLE IF NOT EXISTS liked_destinations (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    destination_id INTEGER REFERENCES destinations(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, destination_id)
);

-- Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    destination_id INTEGER REFERENCES destinations(id) ON DELETE CASCADE,
    accommodation_id INTEGER REFERENCES accommodations(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert sample destinations data
INSERT INTO destinations (name, description, location, image_url, category, rating) VALUES
('Rīgas Vecrīga', 'UNESCO pasaules mantojuma vieta ar viduslaiku arhitektūru', 'Rīga, Latvija', '/images/vecriga.jpg', 'Vēsturiska vieta', 4.8),
('Rundāles pils', 'Barokas stila pils ar krāšņiem dārziem', 'Rundāle, Latvija', '/images/rundale.jpg', 'Pils', 4.7),
('Siguldas pilsdrupas', 'Viduslaiku pilsdrupas Gaujas krastā', 'Sigulda, Latvija', '/images/sigulda.jpg', 'Vēsturiska vieta', 4.5),
('Jūrmala', 'Kūrorta pilsēta ar skaistām pludmalēm', 'Jūrmala, Latvija', '/images/jurmala.jpg', 'Pludmales kūrorts', 4.6),
('Cēsu pilsēta', 'Viduslaiku pilsēta ar saglabātu vēsturisko centru', 'Cēsis, Latvija', '/images/cesis.jpg', 'Vēsturiska vieta', 4.4);

-- Insert sample accommodations data
INSERT INTO accommodations (name, description, location, price_per_night, rating, destination_id) VALUES
('Hotel Bergs', 'Luksusa viesnīca Rīgas centrā', 'Rīga', 150.00, 4.8, 1),
('Rundāles Manor Hotel', 'Butiku viesnīca pie Rundāles pils', 'Rundāle', 120.00, 4.6, 2),
('Sigulda Resort', 'Kūrorta viesnīca ar SPA', 'Sigulda', 90.00, 4.5, 3),
('Jūrmala SPA Hotel', 'SPA viesnīca pie jūras', 'Jūrmala', 110.00, 4.7, 4),
('Cēsu Castle Hotel', 'Vēsturiska viesnīca pilsētas centrā', 'Cēsis', 80.00, 4.3, 5);

-- Enable Row Level Security
ALTER TABLE destinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE accommodations ENABLE ROW LEVEL SECURITY;
ALTER TABLE liked_destinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Public destinations" ON destinations FOR SELECT USING (true);
CREATE POLICY "Public accommodations" ON accommodations FOR SELECT USING (true);

-- Create policies for user-specific data
CREATE POLICY "Users can view own liked destinations" ON liked_destinations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own liked destinations" ON liked_destinations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own liked destinations" ON liked_destinations FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own reviews" ON reviews FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own reviews" ON reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own reviews" ON reviews FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own reviews" ON reviews FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_accommodations_destination_id ON accommodations(destination_id);
CREATE INDEX idx_liked_destinations_user_id ON liked_destinations(user_id);
CREATE INDEX idx_liked_destinations_destination_id ON liked_destinations(destination_id);
CREATE INDEX idx_reviews_user_id ON reviews(user_id);
CREATE INDEX idx_reviews_destination_id ON reviews(destination_id);
CREATE INDEX idx_reviews_accommodation_id ON reviews(accommodation_id);