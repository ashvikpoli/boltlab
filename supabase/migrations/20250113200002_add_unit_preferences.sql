-- Add unit preference fields to onboarding_data table
ALTER TABLE onboarding_data ADD COLUMN IF NOT EXISTS preferred_units text DEFAULT 'imperial' CHECK (preferred_units IN ('metric', 'imperial'));
ALTER TABLE onboarding_data ADD COLUMN IF NOT EXISTS height_cm integer;
ALTER TABLE onboarding_data ADD COLUMN IF NOT EXISTS weight_kg numeric; 