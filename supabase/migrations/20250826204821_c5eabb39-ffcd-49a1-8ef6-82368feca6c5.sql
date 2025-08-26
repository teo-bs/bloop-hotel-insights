-- Enable RLS on tables that are missing it
ALTER TABLE public.hotels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hotel_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews_new ENABLE ROW LEVEL SECURITY;

-- Ensure proper RLS policies for hotels table
DROP POLICY IF EXISTS "members read hotels" ON public.hotels;
DROP POLICY IF EXISTS "authenticated users can create hotels" ON public.hotels;

CREATE POLICY "members read hotels"
ON public.hotels FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.hotel_members WHERE hotel_id = hotels.id AND user_id = auth.uid())
);

CREATE POLICY "authenticated users can create hotels"
ON public.hotels FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Ensure proper RLS policies for hotel_members table
DROP POLICY IF EXISTS "users can read their own hotel memberships" ON public.hotel_members;
DROP POLICY IF EXISTS "users can insert themselves as hotel members" ON public.hotel_members;

CREATE POLICY "users can read their own hotel memberships"
ON public.hotel_members FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "users can insert themselves as hotel members"
ON public.hotel_members FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "users can update hotel memberships for hotels they manage"
ON public.hotel_members FOR UPDATE USING (
  user_id = auth.uid() OR 
  EXISTS (SELECT 1 FROM public.hotel_members WHERE hotel_id = hotel_members.hotel_id AND user_id = auth.uid() AND role IN ('owner', 'manager'))
);

CREATE POLICY "users can delete hotel memberships for hotels they manage"
ON public.hotel_members FOR DELETE USING (
  user_id = auth.uid() OR 
  EXISTS (SELECT 1 FROM public.hotel_members WHERE hotel_id = hotel_members.hotel_id AND user_id = auth.uid() AND role IN ('owner', 'manager'))
);

-- Ensure proper RLS policies for reviews_new table
DROP POLICY IF EXISTS "members read reviews" ON public.reviews_new;
DROP POLICY IF EXISTS "members insert reviews for their hotel" ON public.reviews_new;
DROP POLICY IF EXISTS "members update reviews for their hotel" ON public.reviews_new;
DROP POLICY IF EXISTS "members delete reviews for their hotel" ON public.reviews_new;

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