-- Migration script to add monitoring_enabled column to Entities table
-- This script adds the monitoring_enabled field to control access to monitoring features

-- Add monitoring_enabled column if it doesn't exist
-- Default value is TRUE (1) to maintain backward compatibility
ALTER TABLE Entities 
ADD COLUMN monitoring_enabled BOOLEAN NOT NULL DEFAULT TRUE;

-- Update existing entities to have monitoring enabled by default (if needed)
-- This is already handled by the DEFAULT value above, but included for clarity
UPDATE Entities 
SET monitoring_enabled = TRUE 
WHERE monitoring_enabled IS NULL;

