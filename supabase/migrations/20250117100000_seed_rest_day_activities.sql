/*
  # Seed Rest Day Activities
  
  This migration populates the rest_day_activities table with initial
  recovery content covering all categories and difficulty levels.
*/

INSERT INTO rest_day_activities (
  activity_name,
  category,
  duration_minutes,
  difficulty_level,
  description,
  instructions,
  muscle_groups_targeted,
  equipment_needed,
  is_premium
) VALUES

-- Yoga Activities
(
  'Morning Sun Salutation',
  'yoga',
  10,
  'gentle',
  'A gentle morning yoga flow to wake up your body and mind',
  ARRAY[
    'Start standing with feet hip-width apart',
    'Inhale, sweep arms overhead',
    'Exhale, fold forward touching toes',
    'Inhale, step back into plank',
    'Lower down with control',
    'Cobra pose, opening chest',
    'Return to standing through reverse flow'
  ],
  ARRAY['full_body', 'spine', 'shoulders'],
  ARRAY['yoga_mat'],
  false
),

(
  'Restorative Evening Flow',
  'yoga',
  15,
  'gentle',
  'Calming yoga sequence perfect for winding down',
  ARRAY[
    'Begin in child''s pose, breathing deeply',
    'Transition to cat-cow stretches',
    'Move to downward facing dog',
    'Hold pigeon pose on each side',
    'Finish in savasana for 3 minutes'
  ],
  ARRAY['hips', 'back', 'shoulders'],
  ARRAY['yoga_mat', 'pillow'],
  false
),

(
  'Power Yoga Flow',
  'yoga',
  20,
  'intensive',
  'Dynamic yoga sequence for active recovery',
  ARRAY[
    'Warm up with 5 sun salutations',
    'Warrior sequence on both sides',
    'Balance poses - tree and dancer',
    'Core strengthening sequence',
    'Cool down with seated twists'
  ],
  ARRAY['full_body', 'core', 'legs'],
  ARRAY['yoga_mat'],
  true
),

-- Stretching Activities
(
  'Quick Full Body Stretch',
  'stretching',
  5,
  'gentle',
  'Essential stretches to relieve tension anywhere',
  ARRAY[
    'Neck rolls - 5 each direction',
    'Shoulder shrugs and rolls',
    'Forward fold for 30 seconds',
    'Hip circles - 5 each direction',
    'Calf raises and ankle rolls'
  ],
  ARRAY['neck', 'shoulders', 'back', 'hips', 'calves'],
  ARRAY['bodyweight'],
  false
),

(
  'Post-Workout Recovery Stretch',
  'stretching',
  12,
  'moderate',
  'Comprehensive stretching routine for after workouts',
  ARRAY[
    'Hamstring stretch - 1 minute each leg',
    'Quad stretch against wall',
    'Hip flexor lunge stretch',
    'Chest opener against doorway',
    'Spinal twist seated on floor',
    'Deep breathing to finish'
  ],
  ARRAY['hamstrings', 'quadriceps', 'hip_flexors', 'chest', 'spine'],
  ARRAY['wall', 'floor_space'],
  false
),

(
  'Deep Flexibility Session',
  'stretching',
  25,
  'intensive',
  'Advanced stretching for serious flexibility gains',
  ARRAY[
    'Dynamic warm-up movements',
    'Hold each stretch for 90 seconds',
    'PNF stretching techniques',
    'Focus on problem areas',
    'Progressive deepening of poses'
  ],
  ARRAY['full_body', 'targeted_areas'],
  ARRAY['yoga_mat', 'stretch_strap'],
  true
),

-- Mobility Activities
(
  'Joint Mobility Wake-Up',
  'mobility',
  8,
  'gentle',
  'Gentle joint movements to start your day',
  ARRAY[
    'Ankle circles and flexion',
    'Knee raises and circles',
    'Hip circles and figure-8s',
    'Shoulder rolls and arm swings',
    'Gentle neck movements'
  ],
  ARRAY['ankles', 'knees', 'hips', 'shoulders', 'neck'],
  ARRAY['bodyweight'],
  false
),

(
  'Hip Mobility Flow',
  'mobility',
  15,
  'moderate',
  'Targeted hip mobility for desk workers and athletes',
  ARRAY[
    '90/90 hip stretch position',
    'Hip flexor lunge with rotation',
    'Lateral leg swings',
    'Hip circles on hands and knees',
    'Figure-4 stretch progression'
  ],
  ARRAY['hips', 'hip_flexors', 'glutes'],
  ARRAY['floor_space'],
  false
),

(
  'Athletic Movement Prep',
  'mobility',
  18,
  'intensive',
  'Dynamic mobility for athletes and active individuals',
  ARRAY[
    'High knees and butt kicks',
    'Leg swings - front to back',
    'Lateral lunges with reach',
    'Arm circles and cross-body swings',
    'Thoracic spine rotations'
  ],
  ARRAY['full_body', 'thoracic_spine'],
  ARRAY['bodyweight', 'open_space'],
  false
),

-- Meditation Activities
(
  'Mindful Breathing',
  'meditation',
  5,
  'gentle',
  'Simple breathing meditation for beginners',
  ARRAY[
    'Sit comfortably with eyes closed',
    'Focus on natural breath rhythm',
    'Count breaths from 1 to 10',
    'When mind wanders, gently return focus',
    'End with three deep breaths'
  ],
  ARRAY['mind', 'nervous_system'],
  ARRAY['comfortable_seat'],
  false
),

(
  'Body Scan Meditation',
  'meditation',
  12,
  'moderate',
  'Progressive relaxation and body awareness',
  ARRAY[
    'Lie down in comfortable position',
    'Start awareness at top of head',
    'Slowly scan down through body',
    'Notice sensations without judgment',
    'Release tension as you find it'
  ],
  ARRAY['mind', 'full_body', 'nervous_system'],
  ARRAY['comfortable_surface'],
  false
),

(
  'Walking Meditation',
  'meditation',
  20,
  'moderate',
  'Mindful movement meditation outdoors or indoors',
  ARRAY[
    'Choose a quiet 10-20 foot path',
    'Walk very slowly and deliberately',
    'Focus on lifting, moving, placing feet',
    'When you reach the end, pause and turn',
    'Maintain awareness throughout'
  ],
  ARRAY['mind', 'legs', 'balance'],
  ARRAY['walking_space'],
  false
),

-- Breathing Activities
(
  'Box Breathing',
  'breathing',
  6,
  'gentle',
  '4-4-4-4 breathing pattern for calm and focus',
  ARRAY[
    'Inhale for 4 counts',
    'Hold breath for 4 counts',
    'Exhale for 4 counts',
    'Hold empty for 4 counts',
    'Repeat for 8-10 cycles'
  ],
  ARRAY['lungs', 'nervous_system'],
  ARRAY['comfortable_seat'],
  false
),

(
  'Energizing Breath Work',
  'breathing',
  8,
  'moderate',
  'Breathing techniques to boost energy naturally',
  ARRAY[
    'Bellows breath - quick in and out',
    'Alternate nostril breathing',
    'Three-part yogic breathing',
    'Breath of joy - arm movements',
    'End with normal breathing'
  ],
  ARRAY['lungs', 'nervous_system', 'mind'],
  ARRAY['comfortable_seat'],
  false
),

(
  'Advanced Pranayama',
  'breathing',
  15,
  'intensive',
  'Traditional yogic breathing practices',
  ARRAY[
    'Begin with basic breath awareness',
    'Ujjayi breathing technique',
    'Kapalabhati breathing',
    'Bhramari (bee breath)',
    'Long retention breathing'
  ],
  ARRAY['lungs', 'nervous_system', 'mind'],
  ARRAY['quiet_space'],
  true
),

-- Additional gentle options
(
  'Desk Worker Relief',
  'stretching',
  7,
  'gentle',
  'Quick relief for neck, shoulders, and back tension',
  ARRAY[
    'Neck side bends and rotations',
    'Shoulder blade squeezes',
    'Upper trap stretches',
    'Seated spinal twist',
    'Wrist and forearm stretches'
  ],
  ARRAY['neck', 'shoulders', 'upper_back', 'wrists'],
  ARRAY['chair', 'desk'],
  false
),

(
  'Evening Wind Down',
  'meditation',
  10,
  'gentle',
  'Relaxation routine for better sleep',
  ARRAY[
    'Progressive muscle relaxation',
    'Gratitude reflection',
    'Gentle visualization',
    'Deep belly breathing',
    'Set intention for rest'
  ],
  ARRAY['mind', 'nervous_system'],
  ARRAY['comfortable_position'],
  false
);

-- Update the updated_at timestamp function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql; 