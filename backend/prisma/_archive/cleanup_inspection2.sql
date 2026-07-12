-- First delete all inspection_setting data
DELETE FROM "inspection_setting";

-- Delete all inspection_schedule data
DELETE FROM "inspection_schedule" CASCADE;

-- Check what data exists
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name LIKE 'inspection%';