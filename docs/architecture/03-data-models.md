# Data Models

## User

**Purpose:** Core user profile and authentication data
**Key Attributes:**

- id: UUID - Unique user identifier
- email: string - Primary login credential
- username: string - Display name for social features
- createdAt: timestamp - Account creation date
- profile: UserProfile - Extended profile information

```typescript
interface User {
  id: string;
  email: string;
  username: string;
  createdAt: Date;
  updatedAt: Date;
  profile: UserProfile;
  streakData: StreakData;
  gamificationData: GamificationData;
}

interface UserProfile {
  fitnessLevel: "beginner" | "intermediate" | "advanced";
  goals: string[];
  availableEquipment: Equipment[];
  preferredWorkoutDuration: number; // minutes
  timezone: string;
}
```

**Relationships:**

- One-to-many with WorkoutSessions
- Many-to-many with Friends
- One-to-many with Achievements

## WorkoutSession

**Purpose:** Individual workout tracking and history
**Key Attributes:**

- id: UUID - Session identifier
- userId: UUID - Foreign key to User
- type: string - Workout type (strength, cardio, recovery)
- duration: number - Session duration in minutes
- exercises: Exercise[] - List of exercises completed

```typescript
interface WorkoutSession {
  id: string;
  userId: string;
  type: "strength" | "cardio" | "recovery" | "hybrid";
  startedAt: Date;
  completedAt: Date;
  duration: number;
  exercises: ExerciseSet[];
  moodBefore?: MoodRating;
  moodAfter?: MoodRating;
  energyLevel: number; // 1-10 scale
  notes?: string;
  xpEarned: number;
}

interface ExerciseSet {
  exerciseId: string;
  sets: number;
  reps: number;
  weight?: number;
  duration?: number; // for time-based exercises
  restTime?: number;
  detectionMethod: "manual" | "camera" | "sensor";
}
```

**Relationships:**

- Belongs to User
- Contains multiple ExerciseSet records

## Exercise

**Purpose:** Exercise library and metadata
**Key Attributes:**

- id: UUID - Exercise identifier
- name: string - Exercise name
- category: string - Exercise category (strength, cardio, etc.)
- equipment: Equipment[] - Required equipment
- muscleGroups: string[] - Target muscle groups

```typescript
interface Exercise {
  id: string;
  name: string;
  category: "strength" | "cardio" | "flexibility" | "balance";
  equipment: Equipment[];
  muscleGroups: string[];
  difficultyLevel: 1 | 2 | 3 | 4 | 5;
  instructions: string;
  videoUrl?: string;
  aiDetectionSupported: boolean;
  bonusXpMultiplier: number; // for typically avoided exercises
}

interface Equipment {
  id: string;
  name: string;
  category: "bodyweight" | "weights" | "cardio" | "accessories";
  alternatives: string[]; // alternative equipment IDs
}
```

**Relationships:**

- Used in WorkoutSessions
- Referenced in WorkoutPlans

## StreakData

**Purpose:** Streak tracking and gamification core
**Key Attributes:**

- currentStreak: number - Current consecutive days
- longestStreak: number - Historical best streak
- lastActivityDate: Date - Last workout or recovery activity
- streakType: string - What constitutes streak maintenance

```typescript
interface StreakData {
  userId: string;
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: Date;
  streakStartDate: Date;
  streakResets: StreakReset[];
  milestones: StreakMilestone[];
}

interface StreakReset {
  date: Date;
  previousStreak: number;
  reason: "missed_day" | "manual_reset";
}

interface StreakMilestone {
  streakLength: number;
  achievedDate: Date;
  reward?: Achievement;
}
```
