-- Create hospitals table
CREATE TABLE IF NOT EXISTS public.hospitals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  distance_km DECIMAL(5,2) NOT NULL,
  icu_beds_available INTEGER NOT NULL DEFAULT 0,
  general_beds_available INTEGER NOT NULL DEFAULT 0,
  emergency_beds_available INTEGER NOT NULL DEFAULT 0,
  location TEXT,
  last_updated TIMESTAMPTZ DEFAULT NOW()
);

-- Create emergencies table
CREATE TABLE IF NOT EXISTS public.emergencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('medical', 'fire', 'police')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  location TEXT,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'assigned', 'en_route', 'at_hospital', 'resolved')),
  selected_hospital_id UUID REFERENCES public.hospitals(id),
  timeline JSONB DEFAULT '[]'::jsonb
);

-- Insert sample hospitals
INSERT INTO public.hospitals (name, distance_km, icu_beds_available, general_beds_available, emergency_beds_available, location) VALUES
  ('City General Hospital', 2.5, 5, 15, 8, 'Downtown Area'),
  ('Memorial Medical Center', 3.2, 0, 20, 5, 'North District'),
  ('St. Mary''s Hospital', 1.8, 3, 10, 12, 'East Side'),
  ('Valley Hospital', 4.1, 8, 25, 10, 'West End'),
  ('Community Health Center', 5.5, 2, 18, 6, 'South Quarter');

-- Enable RLS (optional for demo, disabled for simplicity)
-- For production, you'd enable RLS with proper policies
-- ALTER TABLE public.hospitals ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.emergencies ENABLE ROW LEVEL SECURITY;
