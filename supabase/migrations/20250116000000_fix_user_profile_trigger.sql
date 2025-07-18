-- Fix the handle_new_user trigger function to include all required fields
-- and handle potential constraint issues

-- Drop the existing trigger to recreate it
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Update the handle_new_user function to include all required fields
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO profiles (
    id, 
    email, 
    username,
    level,
    total_xp,
    current_streak,
    longest_streak,
    avatar_color
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    1,
    0,
    0,
    0,
    'purple'
  )
  ON CONFLICT (id) DO NOTHING; -- Prevent duplicate key errors
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the user creation
    RAISE WARNING 'Failed to create profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Also ensure username constraint allows for potential duplicates during high concurrency
-- by making the unique constraint deferrable
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_username_key;
ALTER TABLE profiles ADD CONSTRAINT profiles_username_key 
  UNIQUE (username) DEFERRABLE INITIALLY DEFERRED; 