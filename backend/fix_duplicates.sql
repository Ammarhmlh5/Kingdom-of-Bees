-- Fix duplicate apiary names
WITH duplicates AS (
  SELECT id, name, owner_id, created_at,
    ROW_NUMBER() OVER (PARTITION BY name ORDER BY created_at) as rn
  FROM apiary
)
UPDATE apiary
SET name = apiary.name || ' #' || duplicates.rn
FROM duplicates
WHERE apiary.id = duplicates.id AND duplicates.rn > 1;

-- Fix duplicate hive names (per apiary)
WITH duplicates AS (
  SELECT id, name, apiary_id, created_at,
    ROW_NUMBER() OVER (PARTITION BY apiary_id, name ORDER BY created_at) as rn
  FROM hive
  WHERE name IS NOT NULL
)
UPDATE hive
SET name = hive.name || ' #' || duplicates.rn
FROM duplicates
WHERE hive.id = duplicates.id AND duplicates.rn > 1;

-- Fix duplicate queen numbers
WITH duplicates AS (
  SELECT id, queen_number, created_at,
    ROW_NUMBER() OVER (PARTITION BY queen_number ORDER BY created_at) as rn
  FROM queen
  WHERE queen_number IS NOT NULL
)
UPDATE queen
SET queen_number = queen.queen_number || '-' || duplicates.rn
FROM duplicates
WHERE queen.id = duplicates.id AND duplicates.rn > 1;
