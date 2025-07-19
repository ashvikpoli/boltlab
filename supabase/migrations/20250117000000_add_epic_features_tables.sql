/*
  # Add Epic Features Database Schema
  
  This migration adds all missing tables needed for Epic 2-5 features:
  - Epic 2: Challenges, advanced leaderboards
  - Epic 3: AI workout plans, equipment profiles, performance analytics  
  - Epic 4: Advanced social features, workout buddies, synchronized workouts
  - Epic 5: Mood tracking, rest day activities, premium features

  1. New Tables for Epic 2 (Advanced Gamification)
    - `challenges` - User-created fitness challenges
    - `challenge_participants` - Users participating in challenges
    - `challenge_progress` - Progress tracking for challenges
    
  2. New Tables for Epic 3 (AI-Powered Intelligence)
    - `workout_plans` - AI-generated workout plans
    - `equipment_profiles` - User equipment availability by location
    - `performance_analytics` - Advanced performance tracking
    - `plateau_detection` - Plateau detection and recommendations
    
  3. New Tables for Epic 4 (Advanced Social)
    - `workout_buddies` - Workout partner matching
    - `synchronized_workouts` - Real-time shared workout sessions
    - `social_shares` - Achievement and workout sharing
    - `workout_rooms` - Virtual workout rooms
    
  4. New Tables for Epic 5 (Rest Day & Premium)
    - `mood_tracking` - Daily mood and wellness tracking
    - `rest_day_activities` - Active recovery content and completion
    - `recovery_sessions` - Rest day session tracking
    - `premium_subscriptions` - Premium tier management
    - `advanced_analytics` - Premium analytics data

  5. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Epic 2: Advanced Gamification Features

-- Challenges table
CREATE TABLE IF NOT EXISTS challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  challenge_type text NOT NULL CHECK (challenge_type IN ('streak', 'workout_count', 'exercise_variety', 'duration', 'collaborative')),
  target_value integer NOT NULL,
  start_date timestamptz DEFAULT now(),
  end_date timestamptz,
  is_public boolean DEFAULT false,
  max_participants integer,
  badge_reward text,
  xp_reward integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Challenge participants
CREATE TABLE IF NOT EXISTS challenge_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id uuid REFERENCES challenges(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  joined_at timestamptz DEFAULT now(),
  progress integer DEFAULT 0,
  completed boolean DEFAULT false,
  completed_at timestamptz,
  UNIQUE(challenge_id, user_id)
);

-- Challenge progress tracking
CREATE TABLE IF NOT EXISTS challenge_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id uuid REFERENCES challenge_participants(id) ON DELETE CASCADE,
  progress_value integer NOT NULL,
  recorded_at timestamptz DEFAULT now()
);

-- Epic 3: AI-Powered Workout Intelligence

-- AI-generated workout plans
CREATE TABLE IF NOT EXISTS workout_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  plan_name text NOT NULL,
  generated_by text DEFAULT 'gemini',
  difficulty_level text CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  estimated_duration integer, -- minutes
  target_muscle_groups text[],
  equipment_required text[],
  exercises jsonb NOT NULL,
  ai_rationale text,
  is_favorite boolean DEFAULT false,
  usage_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- User equipment profiles by location
CREATE TABLE IF NOT EXISTS equipment_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  location_name text NOT NULL, -- 'home', 'gym', 'travel', etc.
  available_equipment text[] NOT NULL,
  is_default boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, location_name)
);

-- Performance analytics for plateau detection
CREATE TABLE IF NOT EXISTS performance_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  metric_type text NOT NULL, -- 'strength', 'endurance', 'volume', 'frequency'
  exercise_id text,
  exercise_name text,
  metric_value decimal NOT NULL,
  measurement_date date DEFAULT CURRENT_DATE,
  trend_direction text CHECK (trend_direction IN ('increasing', 'stable', 'decreasing')),
  plateau_detected boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Plateau detection and recommendations
CREATE TABLE IF NOT EXISTS plateau_detection (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  exercise_category text NOT NULL,
  plateau_start_date date NOT NULL,
  plateau_duration_days integer,
  recommended_action text,
  action_taken boolean DEFAULT false,
  resolved_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Epic 4: Advanced Social Features

-- Workout buddy matching
CREATE TABLE IF NOT EXISTS workout_buddies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  buddy_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  match_score decimal, -- compatibility score 0-1
  preferences jsonb, -- workout preferences, schedule, etc.
  status text DEFAULT 'matched' CHECK (status IN ('matched', 'connected', 'blocked')),
  last_workout_together timestamptz,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, buddy_id)
);

-- Virtual workout rooms for synchronized sessions
CREATE TABLE IF NOT EXISTS workout_rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  room_name text NOT NULL,
  workout_plan_id uuid REFERENCES workout_plans(id),
  is_active boolean DEFAULT true,
  max_participants integer DEFAULT 10,
  current_participants integer DEFAULT 1,
  scheduled_start timestamptz,
  actual_start timestamptz,
  ended_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Workout room participants
CREATE TABLE IF NOT EXISTS workout_room_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid REFERENCES workout_rooms(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  joined_at timestamptz DEFAULT now(),
  current_exercise_index integer DEFAULT 0,
  current_set integer DEFAULT 1,
  is_active boolean DEFAULT true,
  UNIQUE(room_id, user_id)
);

-- Social sharing for achievements and workouts
CREATE TABLE IF NOT EXISTS social_shares (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  share_type text NOT NULL CHECK (share_type IN ('achievement', 'workout', 'streak_milestone', 'personal_record')),
  content_data jsonb NOT NULL,
  platform text, -- 'instagram', 'twitter', 'facebook', 'internal'
  visibility text DEFAULT 'friends' CHECK (visibility IN ('public', 'friends', 'private')),
  likes_count integer DEFAULT 0,
  comments_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Epic 5: Rest Day Innovation & Premium Features

-- Daily mood and wellness tracking
CREATE TABLE IF NOT EXISTS mood_tracking (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  date date DEFAULT CURRENT_DATE,
  mood_emoji text NOT NULL, -- '💪', '😅', '😤', '💀', '🌟'
  energy_level integer CHECK (energy_level >= 1 AND energy_level <= 10),
  confidence_level integer CHECK (confidence_level >= 1 AND confidence_level <= 10),
  sleep_quality integer CHECK (sleep_quality >= 1 AND sleep_quality <= 10),
  stress_level integer CHECK (stress_level >= 1 AND stress_level <= 10),
  notes text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, date)
);

-- Rest day and active recovery activities
CREATE TABLE IF NOT EXISTS rest_day_activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_name text NOT NULL,
  category text NOT NULL CHECK (category IN ('yoga', 'stretching', 'mobility', 'meditation', 'breathing')),
  duration_minutes integer NOT NULL,
  difficulty_level text CHECK (difficulty_level IN ('gentle', 'moderate', 'intensive')),
  description text,
  instructions text[],
  video_url text,
  muscle_groups_targeted text[],
  equipment_needed text[],
  is_premium boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- User rest day session tracking
CREATE TABLE IF NOT EXISTS recovery_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  activity_id uuid REFERENCES rest_day_activities(id),
  date date DEFAULT CURRENT_DATE,
  duration_completed integer, -- actual minutes completed
  completion_percentage integer DEFAULT 100,
  maintains_streak boolean DEFAULT true,
  mood_before text, -- emoji
  mood_after text, -- emoji
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Premium subscriptions
CREATE TABLE IF NOT EXISTS premium_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  subscription_tier text DEFAULT 'premium' CHECK (subscription_tier IN ('premium', 'premium_plus')),
  start_date timestamptz DEFAULT now(),
  end_date timestamptz,
  is_active boolean DEFAULT true,
  payment_provider text, -- 'stripe', 'apple', 'google'
  subscription_id text, -- external subscription ID
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Advanced analytics for premium users
CREATE TABLE IF NOT EXISTS advanced_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  analytics_type text NOT NULL, -- 'weekly_summary', 'monthly_wrapped', 'habit_analysis'
  data jsonb NOT NULL,
  generated_date date DEFAULT CURRENT_DATE,
  is_premium_only boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security on all new tables
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE plateau_detection ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_buddies ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_room_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE mood_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE rest_day_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE recovery_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE premium_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE advanced_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Epic 2 (Challenges)

-- Challenges policies
CREATE POLICY "Users can view public challenges and their own"
  ON challenges FOR SELECT TO authenticated
  USING (is_public = true OR creator_id = auth.uid());

CREATE POLICY "Users can create challenges"
  ON challenges FOR INSERT TO authenticated
  WITH CHECK (creator_id = auth.uid());

CREATE POLICY "Challenge creators can update their challenges"
  ON challenges FOR UPDATE TO authenticated
  USING (creator_id = auth.uid());

-- Challenge participants policies
CREATE POLICY "Users can view challenge participants"
  ON challenge_participants FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Users can join challenges"
  ON challenge_participants FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own participation"
  ON challenge_participants FOR UPDATE TO authenticated
  USING (user_id = auth.uid());

-- Challenge progress policies
CREATE POLICY "Users can view challenge progress"
  ON challenge_progress FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Participants can record their progress"
  ON challenge_progress FOR INSERT TO authenticated
  WITH CHECK (
    participant_id IN (
      SELECT id FROM challenge_participants WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for Epic 3 (AI Features)

-- Workout plans policies
CREATE POLICY "Users can manage their workout plans"
  ON workout_plans FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Equipment profiles policies
CREATE POLICY "Users can manage their equipment profiles"
  ON equipment_profiles FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Performance analytics policies
CREATE POLICY "Users can manage their performance data"
  ON performance_analytics FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Plateau detection policies
CREATE POLICY "Users can view their plateau detection data"
  ON plateau_detection FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- RLS Policies for Epic 4 (Advanced Social)

-- Workout buddies policies
CREATE POLICY "Users can manage their workout buddy connections"
  ON workout_buddies FOR ALL TO authenticated
  USING (user_id = auth.uid() OR buddy_id = auth.uid())
  WITH CHECK (user_id = auth.uid() OR buddy_id = auth.uid());

-- Workout rooms policies
CREATE POLICY "Users can view active workout rooms"
  ON workout_rooms FOR SELECT TO authenticated
  USING (is_active = true);

CREATE POLICY "Users can create workout rooms"
  ON workout_rooms FOR INSERT TO authenticated
  WITH CHECK (creator_id = auth.uid());

CREATE POLICY "Creators can update their workout rooms"
  ON workout_rooms FOR UPDATE TO authenticated
  USING (creator_id = auth.uid());

-- Workout room participants policies
CREATE POLICY "Users can view room participants"
  ON workout_room_participants FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Users can join workout rooms"
  ON workout_room_participants FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their participation"
  ON workout_room_participants FOR UPDATE TO authenticated
  USING (user_id = auth.uid());

-- Social shares policies
CREATE POLICY "Users can view shares based on visibility"
  ON social_shares FOR SELECT TO authenticated
  USING (
    visibility = 'public' OR
    (visibility = 'friends' AND user_id IN (
      SELECT CASE 
        WHEN requester_id = auth.uid() THEN addressee_id 
        ELSE requester_id 
      END
      FROM friendships 
      WHERE status = 'accepted' 
      AND (requester_id = auth.uid() OR addressee_id = auth.uid())
    )) OR
    user_id = auth.uid()
  );

CREATE POLICY "Users can create their shares"
  ON social_shares FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their shares"
  ON social_shares FOR UPDATE TO authenticated
  USING (user_id = auth.uid());

-- RLS Policies for Epic 5 (Rest Day & Premium)

-- Mood tracking policies
CREATE POLICY "Users can manage their mood data"
  ON mood_tracking FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Rest day activities policies (public read, admin write)
CREATE POLICY "Anyone can view rest day activities"
  ON rest_day_activities FOR SELECT TO authenticated
  USING (true);

-- Recovery sessions policies
CREATE POLICY "Users can manage their recovery sessions"
  ON recovery_sessions FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Premium subscriptions policies
CREATE POLICY "Users can view their subscription data"
  ON premium_subscriptions FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update their subscription"
  ON premium_subscriptions FOR UPDATE TO authenticated
  USING (user_id = auth.uid());

-- Advanced analytics policies
CREATE POLICY "Users can view their analytics"
  ON advanced_analytics FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- Create indexes for performance
CREATE INDEX idx_challenges_creator ON challenges(creator_id);
CREATE INDEX idx_challenges_public ON challenges(is_public) WHERE is_public = true;
CREATE INDEX idx_challenge_participants_user ON challenge_participants(user_id);
CREATE INDEX idx_challenge_participants_challenge ON challenge_participants(challenge_id);
CREATE INDEX idx_workout_plans_user ON workout_plans(user_id);
CREATE INDEX idx_equipment_profiles_user ON equipment_profiles(user_id);
CREATE INDEX idx_performance_analytics_user_date ON performance_analytics(user_id, measurement_date);
CREATE INDEX idx_mood_tracking_user_date ON mood_tracking(user_id, date);
CREATE INDEX idx_recovery_sessions_user_date ON recovery_sessions(user_id, date);
CREATE INDEX idx_social_shares_user ON social_shares(user_id);
CREATE INDEX idx_social_shares_visibility ON social_shares(visibility);

-- Update triggers for updated_at fields
CREATE TRIGGER update_equipment_profiles_updated_at
  BEFORE UPDATE ON equipment_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_premium_subscriptions_updated_at
  BEFORE UPDATE ON premium_subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 