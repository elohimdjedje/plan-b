-- ============================================
-- Script d'ajout de coordonnées GPS
-- ============================================

-- ATTENTION : Vérifiez votre base de données avant d'exécuter !

-- ============================================
-- 1. AGBOVILLE
-- ============================================
UPDATE listing 
SET 
  latitude = 5.9333,
  longitude = -4.2167
WHERE city = 'Agboville' 
  AND (latitude IS NULL OR latitude = 0);

-- ============================================
-- 2. ABIDJAN (coordonnées aléatoires dans la ville)
-- ============================================
UPDATE listing 
SET 
  latitude = 5.3600 + (RAND() * 0.05 - 0.025),
  longitude = -4.0083 + (RAND() * 0.05 - 0.025)
WHERE city = 'Abidjan' 
  AND (latitude IS NULL OR latitude = 0);

-- ============================================
-- 3. BOUAKÉ
-- ============================================
UPDATE listing 
SET 
  latitude = 7.6900,
  longitude = -5.0300
WHERE city = 'Bouaké' 
  AND (latitude IS NULL OR latitude = 0);

-- ============================================
-- 4. YAMOUSSOUKRO
-- ============================================
UPDATE listing 
SET 
  latitude = 6.8276,
  longitude = -5.2893
WHERE city = 'Yamoussoukro' 
  AND (latitude IS NULL OR latitude = 0);

-- ============================================
-- 5. DALOA
-- ============================================
UPDATE listing 
SET 
  latitude = 6.8770,
  longitude = -6.4503
WHERE city = 'Daloa' 
  AND (latitude IS NULL OR latitude = 0);

-- ============================================
-- 6. SAN-PEDRO
-- ============================================
UPDATE listing 
SET 
  latitude = 4.7485,
  longitude = -6.6363
WHERE city = 'San-Pedro' 
  AND (latitude IS NULL OR latitude = 0);

-- ============================================
-- 7. KORHOGO
-- ============================================
UPDATE listing 
SET 
  latitude = 9.4580,
  longitude = -5.6297
WHERE city = 'Korhogo' 
  AND (latitude IS NULL OR latitude = 0);

-- ============================================
-- 8. MAN
-- ============================================
UPDATE listing 
SET 
  latitude = 7.4125,
  longitude = -7.5544
WHERE city = 'Man' 
  AND (latitude IS NULL OR latitude = 0);

-- ============================================
-- 9. GRAND-BASSAM
-- ============================================
UPDATE listing 
SET 
  latitude = 5.2111,
  longitude = -3.7385
WHERE city = 'Grand-Bassam' 
  AND (latitude IS NULL OR latitude = 0);

-- ============================================
-- 10. ASSINIE
-- ============================================
UPDATE listing 
SET 
  latitude = 5.1394,
  longitude = -3.3014
WHERE city = 'Assinie' 
  AND (latitude IS NULL OR latitude = 0);

-- ============================================
-- VÉRIFICATION : Compter les annonces avec GPS
-- ============================================
SELECT 
  city,
  COUNT(*) as total_annonces,
  SUM(CASE WHEN latitude IS NOT NULL AND latitude != 0 THEN 1 ELSE 0 END) as avec_gps,
  SUM(CASE WHEN latitude IS NULL OR latitude = 0 THEN 1 ELSE 0 END) as sans_gps
FROM listing
WHERE status = 'active'
GROUP BY city
ORDER BY total_annonces DESC;

-- ============================================
-- ALTERNATIVE : Coordonnées précises par commune d'Abidjan
-- ============================================

-- Cocody
UPDATE listing 
SET latitude = 5.3500, longitude = -3.9833
WHERE city = 'Abidjan' AND commune = 'Cocody' AND (latitude IS NULL OR latitude = 0);

-- Plateau
UPDATE listing 
SET latitude = 5.3200, longitude = -4.0200
WHERE city = 'Abidjan' AND commune = 'Plateau' AND (latitude IS NULL OR latitude = 0);

-- Marcory
UPDATE listing 
SET latitude = 5.3000, longitude = -4.0000
WHERE city = 'Abidjan' AND commune = 'Marcory' AND (latitude IS NULL OR latitude = 0);

-- Yopougon
UPDATE listing 
SET latitude = 5.3400, longitude = -4.0900
WHERE city = 'Abidjan' AND commune = 'Yopougon' AND (latitude IS NULL OR latitude = 0);

-- Adjamé
UPDATE listing 
SET latitude = 5.3500, longitude = -4.0300
WHERE city = 'Abidjan' AND commune = 'Adjamé' AND (latitude IS NULL OR latitude = 0);

-- Abobo
UPDATE listing 
SET latitude = 5.4200, longitude = -4.0200
WHERE city = 'Abidjan' AND commune = 'Abobo' AND (latitude IS NULL OR latitude = 0);

-- Treichville
UPDATE listing 
SET latitude = 5.3000, longitude = -4.0100
WHERE city = 'Abidjan' AND commune = 'Treichville' AND (latitude IS NULL OR latitude = 0);

-- Koumassi
UPDATE listing 
SET latitude = 5.2900, longitude = -3.9500
WHERE city = 'Abidjan' AND commune = 'Koumassi' AND (latitude IS NULL OR latitude = 0);

-- Port-Bouët
UPDATE listing 
SET latitude = 5.2600, longitude = -3.9200
WHERE city = 'Abidjan' AND commune = 'Port-Bouët' AND (latitude IS NULL OR latitude = 0);

-- Attécoubé
UPDATE listing 
SET latitude = 5.3300, longitude = -4.0500
WHERE city = 'Abidjan' AND commune = 'Attécoubé' AND (latitude IS NULL OR latitude = 0);
