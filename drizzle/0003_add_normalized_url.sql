-- Add normalized_url column for efficient duplicate detection
ALTER TABLE recipe ADD COLUMN normalized_url TEXT;

-- Populate normalized_url for existing records
-- YouTube URLs: normalize to canonical format
UPDATE recipe SET normalized_url = 
  CASE 
    WHEN source_type = 'youtube' AND youtube_video_id IS NOT NULL 
    THEN 'https://www.youtube.com/watch?v=' || youtube_video_id
    ELSE lower(replace(replace(source_url, 'https://www.', 'https://'), 'https://m.', 'https://'))
  END
WHERE normalized_url IS NULL;

-- Make column NOT NULL after populating
-- SQLite doesn't support ALTER COLUMN, so we use a workaround via pragma
-- For D1/SQLite, we rely on the application to always provide this value

-- Create index for efficient lookups
CREATE INDEX idx_recipe_user_normalized_url ON recipe(created_by_id, normalized_url);
