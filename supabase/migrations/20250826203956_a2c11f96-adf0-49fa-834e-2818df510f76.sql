-- Enable RLS on all new tables
ALTER TABLE public.hotels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hotel_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews_new ENABLE ROW LEVEL SECURITY;

-- RLS Policies for hotels
CREATE POLICY "members read hotels"
ON public.hotels FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.hotel_members WHERE hotel_id = hotels.id AND user_id = auth.uid())
);

CREATE POLICY "authenticated users can create hotels"
ON public.hotels FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- RLS Policies for hotel_members
CREATE POLICY "users can read their own hotel memberships"
ON public.hotel_members FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "users can insert themselves as hotel members"
ON public.hotel_members FOR INSERT WITH CHECK (user_id = auth.uid());

-- RLS Policies for review_sources
CREATE POLICY "members read review_sources"
ON public.review_sources FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.hotel_members WHERE hotel_id = review_sources.hotel_id AND user_id = auth.uid())
);

CREATE POLICY "members manage review_sources"
ON public.review_sources FOR ALL USING (
  EXISTS (SELECT 1 FROM public.hotel_members WHERE hotel_id = review_sources.hotel_id AND user_id = auth.uid())
);

-- RLS Policies for reviews_new
CREATE POLICY "members read reviews"
ON public.reviews_new FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.hotel_members WHERE hotel_id = reviews_new.hotel_id AND user_id = auth.uid())
);

CREATE POLICY "members insert reviews for their hotel"
ON public.reviews_new FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.hotel_members WHERE hotel_id = reviews_new.hotel_id AND user_id = auth.uid())
);

CREATE POLICY "members update reviews for their hotel"
ON public.reviews_new FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.hotel_members WHERE hotel_id = reviews_new.hotel_id AND user_id = auth.uid())
);

CREATE POLICY "members delete reviews for their hotel"
ON public.reviews_new FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.hotel_members WHERE hotel_id = reviews_new.hotel_id AND user_id = auth.uid())
);