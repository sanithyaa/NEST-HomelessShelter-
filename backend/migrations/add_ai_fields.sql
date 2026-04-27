-- Migration: Add AI-required fields to existing tables
-- Run this to enable full AI functionality

-- ============================================
-- CRITICAL: Add GPS coordinates
-- ============================================

-- Add GPS to HomelessProfiles (REQUIRED for location-based matching)
ALTER TABLE "HomelessProfiles" 
ADD COLUMN IF NOT EXISTS geo_lat FLOAT,
ADD COLUMN IF NOT EXISTS geo_lng FLOAT;

-- Add GPS to Jobs (REQUIRED for job recommendations)
ALTER TABLE "Jobs"
ADD COLUMN IF NOT EXISTS geo_lat FLOAT,
ADD COLUMN IF NOT EXISTS geo_lng FLOAT;

-- Add GPS to Users (REQUIRED for volunteer route optimization)
ALTER TABLE "Users"
ADD COLUMN IF NOT EXISTS geo_lat FLOAT,
ADD COLUMN IF NOT EXISTS geo_lng FLOAT;

-- ============================================
-- IMPORTANT: Add risk prediction fields
-- ============================================

-- These improve risk prediction accuracy
ALTER TABLE "HomelessProfiles"
ADD COLUMN IF NOT EXISTS duration_homeless VARCHAR(50),
ADD COLUMN IF NOT EXISTS current_situation VARCHAR(50) DEFAULT 'Unknown',
ADD COLUMN IF NOT EXISTS employment_status VARCHAR(50) DEFAULT 'Unemployed',
ADD COLUMN IF NOT EXISTS work_experience_years INTEGER DEFAULT 0;

-- ============================================
-- HELPFUL: Add resource access flags
-- ============================================

-- These improve job placement predictions
ALTER TABLE "HomelessProfiles"
ADD COLUMN IF NOT EXISTS has_transportation BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS has_phone BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS has_id BOOLEAN DEFAULT false;

-- ============================================
-- OPTIONAL: Add health flags
-- ============================================

-- These improve risk assessment
ALTER TABLE "HomelessProfiles"
ADD COLUMN IF NOT EXISTS substance_abuse BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS mental_health_issues BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS chronic_health_conditions BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS family_support BOOLEAN DEFAULT false;

-- ============================================
-- OPTIONAL: Add shelter amenities
-- ============================================

-- Improves shelter matching
ALTER TABLE "Shelters"
ADD COLUMN IF NOT EXISTS amenities TEXT;

-- ============================================
-- OPTIONAL: Add volunteer capacity fields
-- ============================================

-- Improves route optimization
ALTER TABLE "Users"
ADD COLUMN IF NOT EXISTS capacity INTEGER DEFAULT 10,
ADD COLUMN IF NOT EXISTS available_hours INTEGER DEFAULT 8,
ADD COLUMN IF NOT EXISTS transport_mode VARCHAR(50) DEFAULT 'driving';

-- ============================================
-- Create indexes for better performance
-- ============================================

-- Index for location-based queries
CREATE INDEX IF NOT EXISTS idx_homeless_location ON "HomelessProfiles"(geo_lat, geo_lng);
CREATE INDEX IF NOT EXISTS idx_shelter_location ON "Shelters"(geo_lat, geo_lng);
CREATE INDEX IF NOT EXISTS idx_job_location ON "Jobs"(geo_lat, geo_lng);
CREATE INDEX IF NOT EXISTS idx_user_location ON "Users"(geo_lat, geo_lng);

-- Index for filtering
CREATE INDEX IF NOT EXISTS idx_shelter_available ON "Shelters"(available_beds);
CREATE INDEX IF NOT EXISTS idx_profile_employment ON "HomelessProfiles"(employment_status);

-- ============================================
-- Verification queries
-- ============================================

-- Check if columns were added successfully
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'HomelessProfiles'
ORDER BY ordinal_position;

SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'Shelters'
ORDER BY ordinal_position;

SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'Jobs'
ORDER BY ordinal_position;

SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'Users'
ORDER BY ordinal_position;
