-- ============================================================================
-- Frame Management System - Dual Sides Support
-- Migration SQL for Kingdom of Bees
-- Date: January 8, 2026
-- ============================================================================

-- Step 1: Add dual-side tracking fields to hive_frame table
-- These fields track content on both sides of each frame

ALTER TABLE hive_frame 
ADD COLUMN IF NOT EXISTS side_a_honey_percentage INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS side_a_brood_percentage INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS side_a_pollen_percentage INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS side_a_brood_type brood_type,
ADD COLUMN IF NOT EXISTS side_a_brood_age brood_age,
ADD COLUMN IF NOT EXISTS side_b_honey_percentage INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS side_b_brood_percentage INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS side_b_pollen_percentage INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS side_b_brood_type brood_type,
ADD COLUMN IF NOT EXISTS side_b_brood_age brood_age;

-- Step 2: Create frame_snapshot table for historical tracking
-- This table stores snapshots of frame state at different points in time

CREATE TABLE IF NOT EXISTS frame_snapshot (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    frame_id UUID NOT NULL,
    
    -- Side A Content at this point in time (0-100)
    side_a_honey_percentage INTEGER NOT NULL,
    side_a_brood_percentage INTEGER NOT NULL,
    side_a_pollen_percentage INTEGER NOT NULL,
    side_a_brood_type brood_type,
    side_a_brood_age brood_age,
    
    -- Side B Content at this point in time (0-100)
    side_b_honey_percentage INTEGER NOT NULL,
    side_b_brood_percentage INTEGER NOT NULL,
    side_b_pollen_percentage INTEGER NOT NULL,
    side_b_brood_type brood_type,
    side_b_brood_age brood_age,
    
    -- Context
    inspection_id UUID,
    user_id UUID NOT NULL,
    notes TEXT,
    
    -- Timestamp
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Foreign Keys
    CONSTRAINT fk_frame_snapshot_frame FOREIGN KEY (frame_id) 
        REFERENCES hive_frame(id) ON DELETE CASCADE,
    CONSTRAINT fk_frame_snapshot_inspection FOREIGN KEY (inspection_id) 
        REFERENCES inspection(id) ON DELETE SET NULL,
    CONSTRAINT fk_frame_snapshot_user FOREIGN KEY (user_id) 
        REFERENCES user_profile(id) ON DELETE CASCADE
);

-- Step 3: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_frame_snapshot_frame_id ON frame_snapshot(frame_id);
CREATE INDEX IF NOT EXISTS idx_frame_snapshot_frame_recorded ON frame_snapshot(frame_id, recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_frame_snapshot_inspection ON frame_snapshot(inspection_id);

-- Step 4: Add comments for documentation
COMMENT ON TABLE frame_snapshot IS 'Historical snapshots of frame state for tracking changes over time';
COMMENT ON COLUMN frame_snapshot.side_a_honey_percentage IS 'Percentage of honey on side A (0-100)';
COMMENT ON COLUMN frame_snapshot.side_a_brood_percentage IS 'Percentage of brood on side A (0-100)';
COMMENT ON COLUMN frame_snapshot.side_a_pollen_percentage IS 'Percentage of pollen on side A (0-100)';
COMMENT ON COLUMN frame_snapshot.side_b_honey_percentage IS 'Percentage of honey on side B (0-100)';
COMMENT ON COLUMN frame_snapshot.side_b_brood_percentage IS 'Percentage of brood on side B (0-100)';
COMMENT ON COLUMN frame_snapshot.side_b_pollen_percentage IS 'Percentage of pollen on side B (0-100)';

-- ============================================================================
-- End of Migration
-- ============================================================================
