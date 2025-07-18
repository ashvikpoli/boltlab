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

// Get available folders
const exerciseImagesPath = path.join(__dirname, '../assets/images/exercises');
const availableFolders = fs
  .readdirSync(exerciseImagesPath)
  .filter((item) =>
    fs.statSync(path.join(exerciseImagesPath, item)).isDirectory()
  );

console.log(`Found ${exerciseIds.length} exercises in database`);
console.log(`Found ${availableFolders.length} image folders`);

// Function to convert exercise ID to possible folder names
function generatePossibleFolderNames(exerciseId) {
  const possibilities = [];

  // Direct match
  possibilities.push(exerciseId);

  // Replace hyphens with underscores
  possibilities.push(exerciseId.replace(/-/g, '_'));

  // Title case with underscores
  const titleCase = exerciseId
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join('_');
  possibilities.push(titleCase);

  // Handle special cases
  if (exerciseId.includes('34-situp')) {
    possibilities.push('3_4_Sit-Up');
  }
  if (exerciseId.includes('9090-hamstring')) {
    possibilities.push('90_90_Hamstring');
  }

  return possibilities;
}

// Generate mappings
const mappings = {};
const unmappedExercises = [];

exerciseIds.forEach((exerciseId) => {
  const possibilities = generatePossibleFolderNames(exerciseId);
  let found = false;

  for (const possibility of possibilities) {
    if (availableFolders.includes(possibility)) {
      mappings[exerciseId] = possibility;
      found = true;
      break;
    }
  }

  if (!found) {
    // Try fuzzy matching
    const fuzzyMatches = availableFolders.filter((folder) => {
      const folderLower = folder.toLowerCase();
      const idLower = exerciseId.toLowerCase();

      // Remove common words and characters for comparison
      const cleanFolder = folderLower.replace(/[_\-\s]/g, '');
      const cleanId = idLower.replace(/[_\-\s]/g, '');

      return cleanFolder.includes(cleanId) || cleanId.includes(cleanFolder);
    });

    if (fuzzyMatches.length === 1) {
      mappings[exerciseId] = fuzzyMatches[0];
      found = true;
    } else if (fuzzyMatches.length > 1) {
      // Take the closest match
      const closest = fuzzyMatches.reduce((prev, curr) => {
        const prevScore = computeSimilarity(exerciseId, prev);
        const currScore = computeSimilarity(exerciseId, curr);
        return currScore > prevScore ? curr : prev;
      });
      mappings[exerciseId] = closest;
      found = true;
    }
  }

  if (!found) {
    unmappedExercises.push(exerciseId);
  }
});

// Simple similarity function
function computeSimilarity(str1, str2) {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;

  if (longer.length === 0) return 1.0;

  const distance = levenshteinDistance(longer, shorter);
  return (longer.length - distance) / longer.length;
}

function levenshteinDistance(str1, str2) {
  const matrix = [];

  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[str2.length][str1.length];
}

// Generate the mapping code
console.log(`\n✅ Generated ${Object.keys(mappings).length} mappings`);
console.log(`❌ Could not map ${unmappedExercises.length} exercises`);

// Output the folderMap object
console.log(
  '\n// Generated folderMap for ExerciseCard.tsx and ExerciseInstructions.tsx'
);
console.log('const folderMap: { [key: string]: string } = {');

// Sort by key for better readability
const sortedKeys = Object.keys(mappings).sort();
sortedKeys.forEach((key) => {
  console.log(`  '${key}': '${mappings[key]}',`);
});

console.log('};');

// Output unmapped exercises
if (unmappedExercises.length > 0) {
  console.log('\n// Unmapped exercises (need manual mapping):');
  unmappedExercises.forEach((id) => {
    console.log(`// '${id}': 'FOLDER_NAME',`);
  });
}

// Generate the imageModules object for ExerciseCard.tsx
console.log('\n\n// Generated imageModules for ExerciseCard.tsx');
console.log('const imageModules: { [key: string]: any } = {');

Object.values(mappings).forEach((folderName) => {
  console.log(
    `  '${folderName}': require('@/assets/images/exercises/${folderName}/images/0.jpg'),`
  );
});

console.log('};');

// Generate the imageModules object for ExerciseInstructions.tsx
console.log('\n\n// Generated imageModules for ExerciseInstructions.tsx');
console.log(
  'const imageModules: { [key: string]: { [key: string]: any } } = {'
);

Object.values(mappings).forEach((folderName) => {
  console.log(`  '${folderName}': {`);
  console.log(
    `    start: require('@/assets/images/exercises/${folderName}/images/0.jpg'),`
  );
  console.log(
    `    end: require('@/assets/images/exercises/${folderName}/images/1.jpg'),`
  );
  console.log(
    `    demonstration: require('@/assets/images/exercises/${folderName}/images/0.jpg'),`
  );
  console.log(`  },`);
});

console.log('};');
