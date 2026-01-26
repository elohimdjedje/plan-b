-- ============================================
-- MIGRATION VISITE VIRTUELLE - COPIEZ-COLLEZ CE FICHIER
-- ============================================

ALTER TABLE listings 
ADD COLUMN IF NOT EXISTS virtual_tour_type VARCHAR(20) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS virtual_tour_url TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS virtual_tour_thumbnail TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS virtual_tour_data JSONB DEFAULT NULL;

CREATE INDEX IF NOT EXISTS idx_listing_virtual_tour ON listings(virtual_tour_type) 
WHERE virtual_tour_type IS NOT NULL;

-- Vérification
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'listings' 
AND column_name LIKE 'virtual_tour%'
ORDER BY column_name;
