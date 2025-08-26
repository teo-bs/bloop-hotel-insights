-- Create tables without policies first
CREATE TABLE IF NOT EXISTS public.hotels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.hotel_members (
  hotel_id UUID REFERENCES public.hotels(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('owner','manager','viewer')) NOT NULL DEFAULT 'manager',
  created_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (hotel_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.review_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hotel_id UUID REFERENCES public.hotels(id) ON DELETE CASCADE,
  provider TEXT CHECK (provider IN ('google','tripadvisor','booking')) NOT NULL,
  external_location_id TEXT NOT NULL,
  connected_at TIMESTAMPTZ DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'connected',
  UNIQUE (hotel_id, provider)
);

-- Create the new reviews table with proper structure
CREATE TABLE IF NOT EXISTS public.reviews_new (
  id BIGSERIAL PRIMARY KEY,
  hotel_id UUID REFERENCES public.hotels(id) ON DELETE CASCADE,
  provider TEXT CHECK (provider IN ('google','tripadvisor','booking')) NOT NULL,
  external_review_id TEXT,
  author TEXT,
  rating INT CHECK (rating BETWEEN 1 AND 5),
  text TEXT,
  language TEXT,
  created_at TIMESTAMPTZ NOT NULL,
  response_text TEXT,
  responded_at TIMESTAMPTZ,
  inserted_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (hotel_id, provider, external_review_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_reviews_new_hotel_date
  ON public.reviews_new (hotel_id, created_at);
CREATE INDEX IF NOT EXISTS idx_reviews_new_hotel_provider_date
  ON public.reviews_new (hotel_id, provider, created_at);