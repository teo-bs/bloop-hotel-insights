-- Add missing columns to reviews table for CSV import compatibility
ALTER TABLE reviews 
ADD COLUMN IF NOT EXISTS external_review_id TEXT,
ADD COLUMN IF NOT EXISTS response_text TEXT,
ADD COLUMN IF NOT EXISTS responded_at TIMESTAMPTZ;

-- Create unique constraint for upserts (user_id, platform, external_review_id)
CREATE UNIQUE INDEX IF NOT EXISTS idx_reviews_unique_external 
ON reviews (user_id, platform, external_review_id) 
WHERE external_review_id IS NOT NULL;

-- Create backup unique constraint using content hash for rows without external_review_id
CREATE UNIQUE INDEX IF NOT EXISTS idx_reviews_unique_content 
ON reviews (user_id, platform, date, text) 
WHERE external_review_id IS NULL;