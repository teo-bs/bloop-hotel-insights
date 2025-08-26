-- Core tables
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

CREATE TABLE IF NOT EXISTS public.reviews (
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

-- Indexes for fast filters/aggregates
CREATE INDEX IF NOT EXISTS idx_reviews_hotel_date
  ON public.reviews (hotel_id, created_at);
CREATE INDEX IF NOT EXISTS idx_reviews_hotel_provider_date
  ON public.reviews (hotel_id, provider, created_at);
CREATE UNIQUE INDEX IF NOT EXISTS uq_reviews_hotel_provider_extid
  ON public.reviews (hotel_id, provider, external_review_id);

-- Enable RLS
ALTER TABLE public.hotels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hotel_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies (read limited to hotel membership)
CREATE POLICY "members read hotels"
ON public.hotels FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.hotel_members m WHERE m.hotel_id = hotels.id AND m.user_id = auth.uid())
);

CREATE POLICY "members read review_sources"
ON public.review_sources FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.hotel_members m WHERE m.hotel_id = review_sources.hotel_id AND m.user_id = auth.uid())
);

CREATE POLICY "members read reviews"
ON public.reviews FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.hotel_members m WHERE m.hotel_id = reviews.hotel_id AND m.user_id = auth.uid())
);

-- Write policies for CSV upserts (scoped)
CREATE POLICY "members insert reviews for their hotel"
ON public.reviews FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.hotel_members m WHERE m.hotel_id = reviews.hotel_id AND m.user_id = auth.uid())
);

CREATE POLICY "members update reviews for their hotel"
ON public.reviews FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.hotel_members m WHERE m.hotel_id = reviews.hotel_id AND m.user_id = auth.uid())
);

-- Insert policies for hotel management
CREATE POLICY "authenticated users can create hotels"
ON public.hotels FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "users can manage hotel members for their hotels"
ON public.hotel_members FOR ALL USING (
  EXISTS (SELECT 1 FROM public.hotel_members m WHERE m.hotel_id = hotel_members.hotel_id AND m.user_id = auth.uid() AND m.role IN ('owner', 'manager'))
);

CREATE POLICY "users can insert themselves as hotel members"
ON public.hotel_members FOR INSERT WITH CHECK (user_id = auth.uid());

-- Review sources policies
CREATE POLICY "members manage review sources"
ON public.review_sources FOR ALL USING (
  EXISTS (SELECT 1 FROM public.hotel_members m WHERE m.hotel_id = review_sources.hotel_id AND m.user_id = auth.uid() AND m.role IN ('owner', 'manager'))
);