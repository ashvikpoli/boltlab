#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Read the exercise data file
const exerciseDataPath = path.join(__dirname, '../data/exercises.ts');
const exerciseData = fs.readFileSync(exerciseDataPath, 'utf8');

// Extract exercise IDs from the data
const exerciseIdRegex = /id: '([^']+)'/g;
const exerciseIds = [];
let match;
while ((match = exerciseIdRegex.exec(exerciseData)) !== null) {
  exerciseIds.push(match[1]);
}

console.log(`Found ${exerciseIds.length} exercises in the database`);

// Check which exercises have images available
const exerciseImagesPath = path.join(__dirname, '../assets/images/exercises');
const availableFolders = fs
  .readdirSync(exerciseImagesPath)
  .filter((item) =>
    fs.statSync(path.join(exerciseImagesPath, item)).isDirectory()
  );

console.log(`Found ${availableFolders.length} exercise image folders`);

// Create a mapping from exercise IDs to folder names
const folderMap = {
  '34-situp': '3_4_Sit-Up',
  '9090-hamstring': '90_90_Hamstring',
  'ab-crunch-machine': 'Ab_Crunch_Machine',
  'ab-roller': 'Ab_Roller',
  adductor: 'Adductor',
  'adductor-groin': 'Adductor_Groin',
  'advanced-kettlebell-windmill': 'Advanced_Kettlebell_Windmill',
  'air-bike': 'Air_Bike',
  'all-fours-quad-stretch': 'All_Fours_Quad_Stretch',
  'alternate-hammer-curl': 'Alternate_Hammer_Curl',
  'alternate-heel-touchers': 'Alternate_Heel_Touchers',
  'alternate-incline-dumbbell-curl': 'Alternate_Incline_Dumbbell_Curl',
  'alternate-leg-diagonal-bound': 'Alternate_Leg_Diagonal_Bound',
  'alternating-cable-shoulder-press': 'Alternating_Cable_Shoulder_Press',
  'alternating-deltoid-raise': 'Alternating_Deltoid_Raise',
  'alternating-floor-press': 'Alternating_Floor_Press',
  'alternating-hang-clean': 'Alternating_Hang_Clean',
  'alternating-kettlebell-press': 'Alternating_Kettlebell_Press',
  'alternating-kettlebell-row': 'Alternating_Kettlebell_Row',
  'alternating-renegade-row': 'Alternating_Renegade_Row',
  'ankle-circles': 'Ankle_Circles',
  'ankle-on-the-knee': 'Ankle_On_The_Knee',
  'anterior-tibialis-smr': 'Anterior_Tibialis-SMR',
  'anti-gravity-press': 'Anti-Gravity_Press',
  'arm-circles': 'Arm_Circles',
  'arnold-dumbbell-press': 'Arnold_Dumbbell_Press',
  'around-the-worlds': 'Around_The_Worlds',
  'atlas-stone-trainer': 'Atlas_Stone_Trainer',
  'atlas-stones': 'Atlas_Stones',
  'axle-deadlift': 'Axle_Deadlift',
  'back-flyes-with-bands': 'Back_Flyes_-_With_Bands',
  'backward-drag': 'Backward_Drag',
  'backward-medicine-ball-throw': 'Backward_Medicine_Ball_Throw',
  'balance-board': 'Balance_Board',
  'ball-leg-curl': 'Ball_Leg_Curl',
  'band-assisted-pull-up': 'Band_Assisted_Pull-Up',
  'band-good-morning': 'Band_Good_Morning',
  'band-good-morning-pull-through': 'Band_Good_Morning_(Pull_Through)',
  'band-hip-adductions': 'Band_Hip_Adductions',
  'band-pull-apart': 'Band_Pull_Apart',
  'band-skull-crusher': 'Band_Skull_Crusher',
  'barbell-ab-rollout': 'Barbell_Ab_Rollout',
  'barbell-ab-rollout-on-knees': 'Barbell_Ab_Rollout_-_On_Knees',
  'barbell-bench-press': 'Barbell_Bench_Press_-_Medium_Grip',
  'barbell-bench-press-medium-grip': 'Barbell_Bench_Press_-_Medium_Grip',
  'barbell-curl': 'Barbell_Curl',
  'barbell-curls-lying-against-an-incline':
    'Barbell_Curls_Lying_Against_An_Incline',
  'barbell-deadlift': 'Barbell_Deadlift',
  'barbell-full-squat': 'Barbell_Full_Squat',
  'barbell-glute-bridge': 'Barbell_Glute_Bridge',
  'barbell-guillotine-bench-press': 'Barbell_Guillotine_Bench_Press',
  'barbell-hack-squat': 'Barbell_Hack_Squat',
  'barbell-hip-thrust': 'Barbell_Hip_Thrust',
  'barbell-incline-bench-press-medium-grip':
    'Barbell_Incline_Bench_Press_-_Medium_Grip',
  'barbell-incline-shoulder-raise': 'Barbell_Incline_Shoulder_Raise',
  'barbell-lunge': 'Barbell_Lunge',
  'barbell-rear-delt-row': 'Barbell_Rear_Delt_Row',
  'barbell-rollout-from-bench': 'Barbell_Rollout_from_Bench',
  'barbell-seated-calf-raise': 'Barbell_Seated_Calf_Raise',
  'barbell-shoulder-press': 'Barbell_Shoulder_Press',
  'barbell-shrug': 'Barbell_Shrug',
  'barbell-shrug-behind-the-back': 'Barbell_Shrug_Behind_The_Back',
  'barbell-side-bend': 'Barbell_Side_Bend',
  'barbell-side-split-squat': 'Barbell_Side_Split_Squat',
  'barbell-squat': 'Barbell_Squat',
  'barbell-squat-to-a-bench': 'Barbell_Squat_To_A_Bench',
  'barbell-step-ups': 'Barbell_Step_Ups',
  'barbell-walking-lunge': 'Barbell_Walking_Lunge',
  'battling-ropes': 'Battling_Ropes',
  'bear-crawl-sled-drags': 'Bear_Crawl_Sled_Drags',
  'behind-head-chest-stretch': 'Behind_Head_Chest_Stretch',
  'bench-dips': 'Bench_Dips',
  'bench-jump': 'Bench_Jump',
  'bench-press-powerlifting': 'Bench_Press_-_Powerlifting',
  'bench-press-with-bands': 'Bench_Press_-_With_Bands',
  'bench-press-with-chains': 'Bench_Press_with_Chains',
  'bench-sprint': 'Bench_Sprint',
  'bent-arm-barbell-pullover': 'Bent-Arm_Barbell_Pullover',
  'bent-arm-dumbbell-pullover': 'Bent-Arm_Dumbbell_Pullover',
  'bent-knee-hip-raise': 'Bent-Knee_Hip_Raise',
  'bent-over-barbell-row': 'Bent_Over_Barbell_Row',
  'bent-over-dumbbell-rear-delt-raise-with-head-on-bench':
    'Bent_Over_Dumbbell_Rear_Delt_Raise_With_Head_On_Bench',
  'bent-over-low-pulley-side-lateral': 'Bent_Over_Low-Pulley_Side_Lateral',
  'bent-over-one-arm-long-bar-row': 'Bent_Over_One-Arm_Long_Bar_Row',
  'bent-over-two-arm-long-bar-row': 'Bent_Over_Two-Arm_Long_Bar_Row',
  'bent-over-two-dumbbell-row': 'Bent_Over_Two-Dumbbell_Row',
  'bent-over-two-dumbbell-row-with-palms-in':
    'Bent_Over_Two-Dumbbell_Row_With_Palms_In',
  'bent-press': 'Bent_Press',
  bicycling: 'Bicycling',
  'bicycling-stationary': 'Bicycling,_Stationary',
  'board-press': 'Board_Press',
  'body-up': 'Body-Up',
  bodyup: 'Body-Up',
  'body-tricep-press': 'Body_Tricep_Press',
  'bodyweight-flyes': 'Bodyweight_Flyes',
  'bodyweight-mid-row': 'Bodyweight_Mid_Row',
  'bodyweight-squat': 'Bodyweight_Squat',
  'bodyweight-walking-lunge': 'Bodyweight_Walking_Lunge',
  'bosu-ball-cable-crunch-with-side-bends':
    'Bosu_Ball_Cable_Crunch_With_Side_Bends',
  'bottoms-up-clean-from-the-hang-position':
    'Bottoms-Up_Clean_From_The_Hang_Position',
  // Add more mappings as needed
};

// Check image availability
const exercisesWithImages = [];
const exercisesWithoutImages = [];

exerciseIds.forEach((exerciseId) => {
  const folderName = folderMap[exerciseId] || exerciseId;
  const imagePath = path.join(
    exerciseImagesPath,
    folderName,
    'images',
    '0.jpg'
  );

  if (
    fs.existsSync(path.join(exerciseImagesPath, folderName)) &&
    fs.existsSync(imagePath)
  ) {
    exercisesWithImages.push(exerciseId);
  } else {
    exercisesWithoutImages.push(exerciseId);
  }
});

console.log(`\n✅ Exercises with images: ${exercisesWithImages.length}`);
console.log(`❌ Exercises without images: ${exercisesWithoutImages.length}`);

if (exercisesWithoutImages.length > 0) {
  console.log(`\n❌ Missing images for:`);
  exercisesWithoutImages.forEach((id) => {
    console.log(`  - ${id}`);
  });
}

// Check for unused image folders
const usedFolders = new Set();
exerciseIds.forEach((exerciseId) => {
  const folderName = folderMap[exerciseId] || exerciseId;
  usedFolders.add(folderName);
});

const unusedFolders = availableFolders.filter(
  (folder) => !usedFolders.has(folder)
);
console.log(`\n📁 Unused image folders: ${unusedFolders.length}`);
if (unusedFolders.length > 0) {
  console.log(`Unused folders (first 10):`);
  unusedFolders.slice(0, 10).forEach((folder) => {
    console.log(`  - ${folder}`);
  });
}

// Summary
console.log(`\n📊 Summary:`);
console.log(`  Total exercises: ${exerciseIds.length}`);
console.log(
  `  With images: ${exercisesWithImages.length} (${Math.round(
    (exercisesWithImages.length / exerciseIds.length) * 100
  )}%)`
);
console.log(
  `  Without images: ${exercisesWithoutImages.length} (${Math.round(
    (exercisesWithoutImages.length / exerciseIds.length) * 100
  )}%)`
);
console.log(`  Available folders: ${availableFolders.length}`);
console.log(`  Unused folders: ${unusedFolders.length}`);
