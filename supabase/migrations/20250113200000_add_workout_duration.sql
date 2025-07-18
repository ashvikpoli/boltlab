-- Add workout_duration field to onboarding_data table
ALTER TABLE onboarding_data ADD COLUMN IF NOT EXISTS workout_duration text; 