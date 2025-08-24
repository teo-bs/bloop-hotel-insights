-- Add missing columns to reviews table first
ALTER TABLE reviews 
ADD COLUMN IF NOT EXISTS external_review_id TEXT,
ADD COLUMN IF NOT EXISTS response_text TEXT,
ADD COLUMN IF NOT EXISTS responded_at TIMESTAMPTZ;

-- Remove duplicate rows keeping only the most recent ones
WITH duplicates AS (
  SELECT id, 
         ROW_NUMBER() OVER (
           PARTITION BY user_id, platform, date, text 
           ORDER BY created_at DESC
         ) as rn
  FROM reviews
)
DELETE FROM reviews 
WHERE id IN (
  SELECT id FROM duplicates WHERE rn > 1
);

-- Create unique constraint for upserts (user_id, platform, external_review_id)
CREATE UNIQUE INDEX IF NOT EXISTS idx_reviews_unique_external 
ON reviews (user_id, platform, external_review_id) 
WHERE external_review_id IS NOT NULL;

-- Create backup unique constraint using content hash for rows without external_review_id
CREATE UNIQUE INDEX IF NOT EXISTS idx_reviews_unique_content 
ON reviews (user_id, platform, date, text) 
WHERE external_review_id IS NULL;