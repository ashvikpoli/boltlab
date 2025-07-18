-- Add personal information fields to onboarding_data table
ALTER TABLE onboarding_data ADD COLUMN IF NOT EXISTS gender text;
ALTER TABLE onboarding_data ADD COLUMN IF NOT EXISTS height_feet integer;
ALTER TABLE onboarding_data ADD COLUMN IF NOT EXISTS height_inches integer;
ALTER TABLE onboarding_data ADD COLUMN IF NOT EXISTS weight_pounds integer;
ALTER TABLE onboarding_data ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_onboarding_data_user_id ON onboarding_data(user_id); 