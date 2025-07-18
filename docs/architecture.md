## High Level Architecture

### Technical Summary

BoltFit employs a mobile-first serverless architecture optimized for real-time engagement and offline reliability. The system combines React Native with Expo for cross-platform mobile development, integrates Google Gemini API for intelligent workout generation, and uses TensorFlow Lite for on-device rep counting to ensure privacy and performance. The backend leverages serverless functions for cost-effective scaling, supporting the freemium model with real-time social features through WebSocket connections and Redis caching.

### Platform and Infrastructure Choice

**Platform:** AWS with Vercel for frontend deployment
**Key Services:**

- AWS Lambda (serverless functions)
- AWS RDS PostgreSQL (user data, social features)
- AWS ElastiCache Redis (real-time features, session management)
- AWS S3 (media storage, workout content)
- Vercel (frontend deployment and edge functions)
  **Deployment Host and Regions:** Primary: US-East-1, Secondary: EU-West-1 for global user base

### Repository Structure

**Structure:** Monorepo using Turborepo
**Monorepo Tool:** Turborepo for optimal build caching and task orchestration
**Package Organization:** Apps (mobile), packages (shared UI, business logic, types), tools (build scripts, configs)

### High Level Architecture Diagram

```mermaid
graph TD
    A[BoltFit Mobile App] --> B[Vercel Edge Functions]
    A --> C[AWS API Gateway]
    B --> D[Gemini API]
    C --> E[Lambda Functions]
    E --> F[RDS PostgreSQL]
    E --> G[ElastiCache Redis]
    E --> H[S3 Storage]
    A --> I[TensorFlow Lite]
    A --> J[HealthKit/Google Fit]
    E --> K[WebSocket Connections]
    L[Push Notifications] --> A
    M[External APIs] --> E

    style A fill:#6B46C1,color:#fff
    style D fill:#4285f4,color:#fff
    style F fill:#336791,color:#fff
    style G fill:#dc382d,color:#fff
```

### Architectural Patterns

- **Jamstack Architecture:** Static mobile app with serverless APIs - _Rationale:_ Optimal performance and scalability for mobile-first applications with real-time social features
- **Offline-First Pattern:** Local-first data with sync capabilities - _Rationale:_ Ensures reliability in gym environments with poor connectivity
- **Event-Driven Social Features:** Real-time updates through WebSocket and Redis pub/sub - _Rationale:_ Creates engaging social competition and immediate feedback
- **API Gateway Pattern:** Single entry point for all backend services - _Rationale:_ Centralized auth, rate limiting, and monitoring for freemium model
- **Repository Pattern:** Abstract data access logic - _Rationale:_ Enables testing and future database optimizations

## Tech Stack

This is the DEFINITIVE technology selection for the entire BoltFit project. These exact versions and technologies must be used across all development.

| Category                    | Technology                          | Version            | Purpose                           | Rationale                                                 |
| --------------------------- | ----------------------------------- | ------------------ | --------------------------------- | --------------------------------------------------------- |
| **Frontend Language**       | TypeScript                          | 5.3.3              | Primary development language      | Strong typing prevents runtime errors in fitness tracking |
| **Frontend Framework**      | React Native                        | 0.73.2             | Cross-platform mobile development | Single codebase for iOS/Android with native performance   |
| **UI Component Library**    | NativeBase                          | 3.4.28             | Consistent UI components          | Dark theme support, accessibility built-in                |
| **State Management**        | Zustand                             | 4.4.7              | Global state management           | Lightweight, TypeScript-friendly, perfect for mobile      |
| **Backend Language**        | TypeScript                          | 5.3.3              | Server-side development           | Shared types between frontend/backend                     |
| **Backend Framework**       | AWS Lambda                          | Runtime Node.js 20 | Serverless functions              | Cost-effective scaling for freemium model                 |
| **API Style**               | REST + WebSocket                    | OpenAPI 3.0        | API communication                 | REST for CRUD, WebSocket for real-time social features    |
| **Database**                | PostgreSQL                          | 15.4               | Primary data store                | ACID compliance for user data, social features            |
| **Cache**                   | Redis                               | 7.2                | Session and real-time data        | Sub-millisecond latency for streaks, leaderboards         |
| **File Storage**            | AWS S3                              | Latest             | Media and workout content         | Scalable storage for user avatars, exercise media         |
| **Authentication**          | AWS Cognito                         | Latest             | User authentication               | Social login, JWT tokens, scalable                        |
| **AI/ML Service**           | Google Gemini API                   | 1.0                | Workout generation                | Superior reasoning for personalized fitness plans         |
| **On-Device ML**            | TensorFlow Lite                     | 2.14.0             | Rep counting, pose detection      | Privacy-first, real-time performance                      |
| **Frontend Testing**        | Jest + React Native Testing Library | 29.7.0 / 12.4.0    | Component and integration testing | Standard React Native testing stack                       |
| **Backend Testing**         | Jest + Supertest                    | 29.7.0 / 6.3.3     | API testing                       | HTTP endpoint testing for Lambda functions                |
| **E2E Testing**             | Detox                               | 20.13.5            | End-to-end mobile testing         | React Native specific E2E testing                         |
| **Build Tool**              | Turborepo                           | 1.11.2             | Monorepo build orchestration      | Optimal caching and parallel builds                       |
| **Bundler**                 | Metro (React Native)                | 0.80.3             | JavaScript bundling               | Built-in React Native bundler                             |
| **Mobile Development**      | Expo                                | 50.0.0             | Development platform              | Rapid development, OTA updates, native APIs               |
| **IaC Tool**                | AWS CDK                             | 2.108.0            | Infrastructure as Code            | TypeScript-based infrastructure definition                |
| **CI/CD**                   | GitHub Actions                      | Latest             | Continuous integration            | Free for open source, excellent React Native support      |
| **Monitoring**              | Sentry                              | 7.81.1             | Error tracking and performance    | React Native and Lambda integration                       |
| **Logging**                 | Winston + AWS CloudWatch            | 3.11.0             | Application logging               | Structured logging with cloud aggregation                 |
| **CSS Framework**           | NativeWind                          | 4.0.0              | Utility-first styling             | Tailwind CSS for React Native                             |
| **Navigation**              | React Navigation                    | 6.1.9              | Mobile app navigation             | Standard React Native navigation                          |
| **Real-time Communication** | Socket.IO                           | 4.7.4              | WebSocket connections             | Real-time social features, challenges                     |

**Key Technology Decisions Rationale:**

**Mobile Stack:** Expo + React Native provides the fastest development velocity while maintaining native performance for camera/sensor features critical to BoltFit's automatic rep counting.

**AI Integration:** Gemini API offers superior reasoning capabilities for workout personalization, while TensorFlow Lite keeps sensitive video data on-device for privacy.

**Backend Architecture:** Serverless Lambda functions provide cost-effective scaling that aligns perfectly with the freemium business model - pay only for active users.

**Database Strategy:** PostgreSQL for complex social relationships and ACID compliance, Redis for real-time leaderboards and streak data requiring sub-second latency.

**Authentication Choice:** AWS Cognito provides social login integration (Google, Apple) with built-in JWT management, reducing development overhead.

## Data Models

### User

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

### WorkoutSession

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

### Exercise

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

### StreakData

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
  achievedAt: Date;
  badgeAwarded?: string;
}
```

**Relationships:**

- One-to-one with User
- Drives Badge and Achievement systems

### GamificationData

**Purpose:** XP, levels, and progression tracking
**Key Attributes:**

- totalXP: number - Lifetime experience points
- currentLevel: number - User level based on XP
- xpToNextLevel: number - XP needed for next level
- badges: Badge[] - Earned achievements

```typescript
interface GamificationData {
  userId: string;
  totalXP: number;
  currentLevel: number;
  xpToNextLevel: number;
  badges: Badge[];
  achievements: Achievement[];
  weeklyXP: number;
  monthlyXP: number;
}

interface Badge {
  id: string;
  name: string;
  description: string;
  iconUrl: string;
  rarity: "common" | "uncommon" | "rare" | "legendary";
  earnedAt: Date;
  category: "consistency" | "variety" | "milestone" | "social" | "special";
}

interface Achievement {
  id: string;
  badgeId: string;
  progress: number;
  target: number;
  completed: boolean;
  completedAt?: Date;
}
```

**Relationships:**

- One-to-one with User
- Connected to Badge definitions
- Drives social leaderboards

### SocialConnection

**Purpose:** Friend relationships and social features
**Key Attributes:**

- userId: UUID - User requesting connection
- friendId: UUID - User being connected to
- status: string - Connection status
- connectedAt: Date - When friendship was established

```typescript
interface SocialConnection {
  id: string;
  userId: string;
  friendId: string;
  status: "pending" | "accepted" | "blocked";
  connectedAt: Date;
  requestedAt: Date;
}

interface SocialActivity {
  id: string;
  userId: string;
  type: "workout_completed" | "streak_milestone" | "badge_earned" | "level_up";
  data: Record<string, any>;
  createdAt: Date;
  visibility: "public" | "friends" | "private";
}
```

**Relationships:**

- Many-to-many between Users
- Drives friend leaderboards and social feeds

## API Specification

### REST API Specification

```yaml
openapi: 3.0.0
info:
  title: BoltFit API
  version: 1.0.0
  description: BoltFit mobile fitness app backend API supporting gamified workout tracking, AI-powered planning, and social features
servers:
  - url: https://api.boltfit.app/v1
    description: Production API
  - url: https://staging-api.boltfit.app/v1
    description: Staging API

paths:
  # Authentication Endpoints
  /auth/login:
    post:
      summary: User authentication
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                email:
                  type: string
                  format: email
                password:
                  type: string
                provider:
                  type: string
                  enum: [email, google, apple]
      responses:
        200:
          description: Authentication successful
          content:
            application/json:
              schema:
                type: object
                properties:
                  token:
                    type: string
                  user:
                    $ref: "#/components/schemas/User"
                  expiresIn:
                    type: number

  # User Profile Endpoints
  /users/profile:
    get:
      summary: Get current user profile
      security:
        - bearerAuth: []
      responses:
        200:
          description: User profile data
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/User"

    put:
      summary: Update user profile
      security:
        - bearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/UserProfile"
      responses:
        200:
          description: Profile updated successfully

  # Workout Endpoints
  /workouts:
    post:
      summary: Create new workout session
      security:
        - bearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/WorkoutSession"
      responses:
        201:
          description: Workout session created
          content:
            application/json:
              schema:
                type: object
                properties:
                  sessionId:
                    type: string
                  xpEarned:
                    type: number
                  badgesUnlocked:
                    type: array
                    items:
                      $ref: "#/components/schemas/Badge"

    get:
      summary: Get workout history
      security:
        - bearerAuth: []
      parameters:
        - name: limit
          in: query
          schema:
            type: integer
            default: 20
        - name: offset
          in: query
          schema:
            type: integer
            default: 0
      responses:
        200:
          description: Workout history
          content:
            application/json:
              schema:
                type: object
                properties:
                  workouts:
                    type: array
                    items:
                      $ref: "#/components/schemas/WorkoutSession"
                  total:
                    type: integer

  # AI Workout Generation
  /workouts/generate:
    post:
      summary: Generate AI-powered workout plan
      security:
        - bearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                goals:
                  type: array
                  items:
                    type: string
                duration:
                  type: integer
                equipment:
                  type: array
                  items:
                    type: string
                workoutType:
                  type: string
                  enum: [strength, cardio, hybrid, recovery]
                previousWorkouts:
                  type: array
                  items:
                    type: string
      responses:
        200:
          description: Generated workout plan
          content:
            application/json:
              schema:
                type: object
                properties:
                  exercises:
                    type: array
                    items:
                      $ref: "#/components/schemas/Exercise"
                  estimatedDuration:
                    type: integer
                  difficultyLevel:
                    type: integer
                  rationale:
                    type: string

  # Streak Endpoints
  /streaks/current:
    get:
      summary: Get current streak data
      security:
        - bearerAuth: []
      responses:
        200:
          description: Current streak information
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/StreakData"

  /streaks/activity:
    post:
      summary: Record streak activity (workout or recovery)
      security:
        - bearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                activityType:
                  type: string
                  enum: [workout, recovery]
                sessionId:
                  type: string
      responses:
        200:
          description: Streak updated
          content:
            application/json:
              schema:
                type: object
                properties:
                  newStreakCount:
                    type: integer
                  milestoneReached:
                    type: boolean
                  badgeEarned:
                    $ref: "#/components/schemas/Badge"

  # Social Features
  /social/friends:
    get:
      summary: Get friends list
      security:
        - bearerAuth: []
      responses:
        200:
          description: Friends list
          content:
            application/json:
              schema:
                type: array
                items:
                  type: object
                  properties:
                    friend:
                      $ref: "#/components/schemas/User"
                    connection:
                      $ref: "#/components/schemas/SocialConnection"

    post:
      summary: Send friend request
      security:
        - bearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                friendId:
                  type: string
                username:
                  type: string
      responses:
        201:
          description: Friend request sent

  /social/leaderboard:
    get:
      summary: Get friends leaderboard
      security:
        - bearerAuth: []
      parameters:
        - name: metric
          in: query
          schema:
            type: string
            enum: [streak, xp, workouts, consistency]
            default: streak
        - name: timeframe
          in: query
          schema:
            type: string
            enum: [week, month, all_time]
            default: all_time
      responses:
        200:
          description: Leaderboard data
          content:
            application/json:
              schema:
                type: array
                items:
                  type: object
                  properties:
                    user:
                      $ref: "#/components/schemas/User"
                    rank:
                      type: integer
                    value:
                      type: number

  # Exercise Library
  /exercises:
    get:
      summary: Get exercise library
      parameters:
        - name: category
          in: query
          schema:
            type: string
        - name: equipment
          in: query
          schema:
            type: array
            items:
              type: string
        - name: muscleGroup
          in: query
          schema:
            type: string
      responses:
        200:
          description: Exercise library
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: "#/components/schemas/Exercise"

components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT

  schemas:
    User:
      type: object
      properties:
        id:
          type: string
        email:
          type: string
        username:
          type: string
        createdAt:
          type: string
          format: date-time
        profile:
          $ref: "#/components/schemas/UserProfile"
        streakData:
          $ref: "#/components/schemas/StreakData"
        gamificationData:
          $ref: "#/components/schemas/GamificationData"

    UserProfile:
      type: object
      properties:
        fitnessLevel:
          type: string
          enum: [beginner, intermediate, advanced]
        goals:
          type: array
          items:
            type: string
        availableEquipment:
          type: array
          items:
            type: string
        preferredWorkoutDuration:
          type: integer
        timezone:
          type: string

    WorkoutSession:
      type: object
      properties:
        id:
          type: string
        userId:
          type: string
        type:
          type: string
          enum: [strength, cardio, recovery, hybrid]
        startedAt:
          type: string
          format: date-time
        completedAt:
          type: string
          format: date-time
        duration:
          type: integer
        exercises:
          type: array
          items:
            $ref: "#/components/schemas/ExerciseSet"
        xpEarned:
          type: integer

    Exercise:
      type: object
      properties:
        id:
          type: string
        name:
          type: string
        category:
          type: string
        equipment:
          type: array
          items:
            type: string
        muscleGroups:
          type: array
          items:
            type: string
        difficultyLevel:
          type: integer
          minimum: 1
          maximum: 5
        bonusXpMultiplier:
          type: number

    StreakData:
      type: object
      properties:
        currentStreak:
          type: integer
        longestStreak:
          type: integer
        lastActivityDate:
          type: string
          format: date
        streakStartDate:
          type: string
          format: date

    GamificationData:
      type: object
      properties:
        totalXP:
          type: integer
        currentLevel:
          type: integer
        xpToNextLevel:
          type: integer
        badges:
          type: array
          items:
            $ref: "#/components/schemas/Badge"

    Badge:
      type: object
      properties:
        id:
          type: string
        name:
          type: string
        description:
          type: string
        rarity:
          type: string
          enum: [common, uncommon, rare, legendary]
        earnedAt:
          type: string
          format: date-time

    ExerciseSet:
      type: object
      properties:
        exerciseId:
          type: string
        sets:
          type: integer
        reps:
          type: integer
        weight:
          type: number
        duration:
          type: integer
        detectionMethod:
          type: string
          enum: [manual, camera, sensor]

    SocialConnection:
      type: object
      properties:
        id:
          type: string
        userId:
          type: string
        friendId:
          type: string
        status:
          type: string
          enum: [pending, accepted, blocked]
        connectedAt:
          type: string
          format: date-time
```

This API specification covers all the core BoltFit features including authentication, workout tracking, AI generation, streak management, and social features. The design is RESTful with clear resource-based endpoints and comprehensive error handling.

## Components

### BoltFit Mobile App (React Native + Expo)

**Responsibility:** Primary user interface, workout tracking, camera-based rep counting, offline data management, and real-time social interactions

**Key Interfaces:**

- REST API communication for user data, workouts, social features
- WebSocket connections for real-time leaderboards and friend activity
- TensorFlow Lite integration for on-device rep counting
- HealthKit/Google Fit integration for comprehensive health data

**Dependencies:**

- Backend API Gateway for all server communication
- Local SQLite database for offline functionality
- Camera and sensor APIs for automatic tracking
- Push notification services for engagement

**Technology Stack:** React Native 0.73.2, Expo 50.0.0, TypeScript, Zustand state management, NativeBase UI components

### API Gateway Layer (AWS API Gateway + Lambda)

**Responsibility:** Request routing, authentication verification, rate limiting for freemium model, and centralized logging/monitoring

**Key Interfaces:**

- REST endpoints for CRUD operations
- WebSocket API for real-time features
- Integration with AWS Cognito for authentication
- Lambda function invocation for business logic

**Dependencies:**

- AWS Cognito for user authentication
- Lambda functions for business logic execution
- CloudWatch for monitoring and logging

**Technology Stack:** AWS API Gateway, AWS Lambda (Node.js 20), TypeScript

### Workout Intelligence Service (Lambda Functions)

**Responsibility:** AI-powered workout generation using Gemini API, performance analysis, plateau detection, and personalized recommendations

**Key Interfaces:**

- Gemini API integration for workout plan generation
- PostgreSQL database for user history and preferences
- Redis cache for frequently requested workout templates

**Dependencies:**

- Google Gemini API for AI reasoning
- User workout history from PostgreSQL
- Exercise library and equipment database

**Technology Stack:** AWS Lambda, Google Gemini API 1.0, TypeScript

### Gamification Engine (Lambda Functions)

**Responsibility:** Streak tracking, XP calculation, badge management, level progression, and achievement unlocking

**Key Interfaces:**

- PostgreSQL for persistent gamification data
- Redis for real-time streak and leaderboard updates
- WebSocket notifications for achievement celebrations

**Dependencies:**

- User activity data from workout sessions
- Badge and achievement rule definitions
- Social connection data for competitive features

**Technology Stack:** AWS Lambda, PostgreSQL, Redis, TypeScript

### Social Features Service (Lambda Functions + WebSocket)

**Responsibility:** Friend connections, leaderboards, challenge management, activity feeds, and real-time social updates

**Key Interfaces:**

- WebSocket API for real-time friend activity updates
- PostgreSQL for social relationships and challenge data
- Redis pub/sub for real-time leaderboard updates

**Dependencies:**

- User profile and gamification data
- Workout session data for social sharing
- Push notification service for social interactions

**Technology Stack:** AWS Lambda, Socket.IO, PostgreSQL, Redis, AWS SNS

### Data Persistence Layer (PostgreSQL + Redis)

**Responsibility:** Primary data storage, user relationships, workout history, social features, and high-performance caching

**Key Interfaces:**

- PostgreSQL for structured data (users, workouts, social connections)
- Redis for real-time data (streaks, leaderboards, session management)
- Automated backup and disaster recovery

**Dependencies:**

- All application services for data persistence
- AWS RDS for managed PostgreSQL
- AWS ElastiCache for managed Redis

**Technology Stack:** PostgreSQL 15.4, Redis 7.2, AWS RDS, AWS ElastiCache

## Component Diagrams

```mermaid
graph TB
    subgraph "Mobile App"
        A[React Native UI]
        B[TensorFlow Lite]
        C[Local SQLite]
        D[State Management]
    end

    subgraph "API Layer"
        E[API Gateway]
        F[WebSocket API]
        G[Authentication]
    end

    subgraph "Business Logic"
        H[Workout Service]
        I[Gamification Engine]
        J[Social Service]
        K[AI Integration]
    end

    subgraph "Data Layer"
        L[PostgreSQL]
        M[Redis Cache]
        N[S3 Storage]
    end

    subgraph "External Services"
        O[Gemini API]
        P[Push Notifications]
        Q[Health Platforms]
    end

    A --> E
    A --> F
    B --> A
    C --> A
    D --> A

    E --> H
    E --> I
    E --> J
    F --> I
    F --> J
    G --> E

    H --> L
    H --> O
    I --> L
    I --> M
    J --> L
    J --> M
    K --> O

    A --> Q
    J --> P

    style A fill:#6B46C1,color:#fff
    style O fill:#4285f4,color:#fff
    style L fill:#336791,color:#fff
    style M fill:#dc382d,color:#fff
```

## Core Workflows

### User Workout Session Flow

```mermaid
sequenceDiagram
    participant U as User
    participant M as Mobile App
    participant A as API Gateway
    participant W as Workout Service
    participant G as Gamification Engine
    participant D as Database
    participant R as Redis Cache

    U->>M: Start Workout Session
    M->>A: POST /workouts (session start)
    A->>W: Create workout session
    W->>D: Store session data
    W-->>M: Session ID created

    loop Exercise Execution
        U->>M: Perform Exercise
        M->>M: TensorFlow Lite rep counting
        M->>M: Update local session data
    end

    U->>M: Complete Workout
    M->>A: PUT /workouts/{id} (session complete)
    A->>W: Update workout session
    W->>D: Store final workout data

    W->>G: Trigger XP/badge calculation
    G->>D: Update user gamification data
    G->>R: Update real-time leaderboards
    G-->>M: XP earned, badges unlocked

    G->>A: WebSocket notification (if badges earned)
    A-->>M: Real-time achievement notification
    M->>U: Celebration animation
```

This workflow demonstrates the offline-first approach with TensorFlow Lite rep counting, followed by comprehensive gamification updates and real-time social notifications.

## Unified Project Structure

```plaintext
boltfit/
├── .github/                    # CI/CD workflows
│   └── workflows/
│       ├── ci.yml             # Tests and validation
│       ├── deploy-mobile.yml  # Mobile app deployment
│       └── deploy-backend.yml # Backend deployment
├── apps/                      # Application packages
│   ├── mobile/                # React Native mobile app
│   │   ├── src/
│   │   │   ├── components/    # Reusable UI components
│   │   │   │   ├── common/    # Button, Card, Input, etc.
│   │   │   │   ├── workout/   # WorkoutTimer, ExerciseCard, RepCounter
│   │   │   │   ├── social/    # FriendsList, Leaderboard, ActivityFeed
│   │   │   │   └── gamification/ # StreakFlame, BadgeDisplay, XPBar
│   │   │   ├── screens/       # Main app screens
│   │   │   │   ├── auth/      # Login, Register, Onboarding
│   │   │   │   ├── workout/   # WorkoutPlan, ActiveWorkout, History
│   │   │   │   ├── social/    # Friends, Leaderboards, Challenges
│   │   │   │   ├── profile/   # UserProfile, Settings, Achievements
│   │   │   │   └── recovery/  # RestDay, ActiveRecovery, Meditation
│   │   │   ├── hooks/         # Custom React hooks
│   │   │   │   ├── useAuth.ts
│   │   │   │   ├── useWorkout.ts
│   │   │   │   ├── useStreak.ts
│   │   │   │   └── useCamera.ts
│   │   │   ├── services/      # API client services
│   │   │   │   ├── api.ts     # Base API configuration
│   │   │   │   ├── auth.ts    # Authentication service
│   │   │   │   ├── workout.ts # Workout API calls
│   │   │   │   ├── social.ts  # Social features API
│   │   │   │   └── gemini.ts  # AI workout generation
│   │   │   ├── stores/        # Zustand state management
│   │   │   │   ├── authStore.ts
│   │   │   │   ├── workoutStore.ts
│   │   │   │   ├── socialStore.ts
│   │   │   │   └── gamificationStore.ts
│   │   │   ├── utils/         # Utility functions
│   │   │   │   ├── database.ts    # SQLite local storage
│   │   │   │   ├── camera.ts      # TensorFlow Lite integration
│   │   │   │   ├── health.ts      # HealthKit/Google Fit
│   │   │   │   ├── notifications.ts # Push notifications
│   │   │   │   └── analytics.ts   # Event tracking
│   │   │   ├── types/         # TypeScript type definitions
│   │   │   │   ├── api.ts     # API response types
│   │   │   │   ├── workout.ts # Workout-related types
│   │   │   │   ├── social.ts  # Social feature types
│   │   │   │   └── gamification.ts # Badges, streaks, XP types
│   │   │   └── constants/     # App constants
│   │   │       ├── theme.ts   # Dark UI theme with purple accents
│   │   │       ├── exercises.ts # Exercise library
│   │   │       └── config.ts  # App configuration
│   │   ├── assets/            # Static assets
│   │   │   ├── images/        # App icons, badges, exercise demos
│   │   │   ├── fonts/         # Custom typography
│   │   │   └── sounds/        # Achievement sounds, workout cues
│   │   ├── __tests__/         # Mobile app tests
│   │   │   ├── components/    # Component tests
│   │   │   ├── screens/       # Screen integration tests
│   │   │   ├── hooks/         # Hook tests
│   │   │   └── utils/         # Utility function tests
│   │   ├── app.json           # Expo configuration
│   │   ├── package.json       # Mobile dependencies
│   │   ├── tsconfig.json      # TypeScript config
│   │   └── babel.config.js    # Babel configuration
│   └── backend/               # Serverless backend
│       ├── src/
│       │   ├── handlers/      # Lambda function handlers
│       │   │   ├── auth/      # Authentication endpoints
│       │   │   │   ├── login.ts
│       │   │   │   ├── register.ts
│       │   │   │   └── refresh.ts
│       │   │   ├── workout/   # Workout management
│       │   │   │   ├── create.ts
│       │   │   │   ├── complete.ts
│       │   │   │   ├── history.ts
│       │   │   │   └── generate.ts # AI workout generation
│       │   │   ├── social/    # Social features
│       │   │   │   ├── friends.ts
│       │   │   │   ├── leaderboard.ts
│       │   │   │   ├── challenges.ts
│       │   │   │   └── activity.ts
│       │   │   ├── gamification/ # Streaks, XP, badges
│       │   │   │   ├── streak.ts
│       │   │   │   ├── xp.ts
│       │   │   │   └── badges.ts
│       │   │   └── websocket/ # Real-time features
│       │   │       ├── connect.ts
│       │   │       ├── disconnect.ts
│       │   │       └── message.ts
│       │   ├── services/      # Business logic services
│       │   │   ├── authService.ts
│       │   │   ├── workoutService.ts
│       │   │   ├── socialService.ts
│       │   │   ├── gamificationService.ts
│       │   │   └── aiService.ts # Gemini API integration
│       │   ├── models/        # Data access layer
│       │   │   ├── User.ts
│       │   │   ├── Workout.ts
│       │   │   ├── Exercise.ts
│       │   │   ├── Streak.ts
│       │   │   └── Social.ts
│       │   ├── utils/         # Backend utilities
│       │   │   ├── database.ts    # PostgreSQL connection
│       │   │   ├── redis.ts       # Redis client
│       │   │   ├── auth.ts        # JWT utilities
│       │   │   ├── validation.ts  # Input validation
│       │   │   └── errors.ts      # Error handling
│       │   ├── middleware/    # Express/Lambda middleware
│       │   │   ├── auth.ts        # Authentication middleware
│       │   │   ├── validation.ts  # Request validation
│       │   │   ├── rateLimit.ts   # Rate limiting for freemium
│       │   │   └── cors.ts        # CORS configuration
│       │   └── types/         # Shared type definitions
│       │       ├── api.ts
│       │       ├── database.ts
│       │       └── external.ts
│       ├── tests/             # Backend tests
│       │   ├── unit/          # Unit tests for services
│       │   ├── integration/   # API integration tests
│       │   └── fixtures/      # Test data
│       ├── infrastructure/    # AWS CDK infrastructure
│       │   ├── stacks/
│       │   │   ├── database.ts    # RDS PostgreSQL + ElastiCache Redis
│       │   │   ├── api.ts         # API Gateway + Lambda functions
│       │   │   ├── auth.ts        # Cognito configuration
│       │   │   └── monitoring.ts  # CloudWatch + Sentry
│       │   ├── app.ts         # CDK app entry point
│       │   └── cdk.json       # CDK configuration
│       ├── package.json       # Backend dependencies
│       ├── tsconfig.json      # TypeScript configuration
│       └── serverless.yml     # Serverless framework config (alternative to CDK)
├── packages/                  # Shared packages
│   ├── shared/                # Shared types and utilities
│   │   ├── src/
│   │   │   ├── types/         # Cross-platform TypeScript types
│   │   │   │   ├── user.ts
│   │   │   │   ├── workout.ts
│   │   │   │   ├── social.ts
│   │   │   │   └── gamification.ts
│   │   │   ├── constants/     # Shared constants
│   │   │   │   ├── exercises.ts   # Exercise library definitions
│   │   │   │   ├── badges.ts      # Badge definitions and rules
│   │   │   │   └── config.ts      # Shared configuration
│   │   │   ├── utils/         # Cross-platform utilities
│   │   │   │   ├── validation.ts  # Input validation schemas
│   │   │   │   ├── formatting.ts  # Date, number formatting
│   │   │   │   └── calculations.ts # XP, level calculations
│   │   │   └── schemas/       # JSON schemas for validation
│   │   │       ├── workout.json
│   │   │       ├── user.json
│   │   │       └── social.json
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── ui/                    # Shared UI components (future web app)
│   │   ├── src/
│   │   │   ├── components/    # Reusable React components
│   │   │   ├── hooks/         # Shared React hooks
│   │   │   └── themes/        # Design system definitions
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── config/                # Shared configuration
│       ├── eslint/            # ESLint configurations
│       │   ├── base.js
│       │   ├── react-native.js
│       │   └── node.js
│       ├── typescript/        # TypeScript configurations
│       │   ├── base.json
│       │   ├── react-native.json
│       │   └── node.json
│       └── jest/              # Jest configurations
│           ├── base.js
│           ├── react-native.js
│           └── node.js
├── scripts/                   # Build and deployment scripts
│   ├── build.sh              # Build all packages
│   ├── deploy-mobile.sh      # Deploy mobile app to app stores
│   ├── deploy-backend.sh     # Deploy backend infrastructure
│   ├── seed-database.sh      # Database seeding
│   └── generate-types.sh     # Generate types from database
├── docs/                     # Project documentation
│   ├── prd.md                # Product Requirements Document
│   ├── fullstack-architecture.md # This document
│   ├── api/                  # API documentation
│   │   ├── openapi.yml       # OpenAPI specification
│   │   └── postman.json      # Postman collection
│   ├── deployment/           # Deployment guides
│   │   ├── mobile.md
│   │   ├── backend.md
│   │   └── database.md
│   └── development/          # Development guides
│       ├── getting-started.md
│       ├── testing.md
│       └── troubleshooting.md
├── .env.example              # Environment variables template
├── .gitignore                # Git ignore rules
├── package.json              # Root package.json with workspace configuration
├── turbo.json                # Turborepo configuration
├── README.md                 # Project overview and setup
└── LICENSE                   # License file
```

This structure supports:

- **Monorepo Benefits:** Shared types, utilities, and configuration across mobile and backend
- **Clear Separation:** Apps vs packages vs shared tooling
- **Scalability:** Easy to add web app or additional mobile platforms
- **Developer Experience:** Consistent tooling, fast builds with Turborepo caching
- **Type Safety:** Shared TypeScript types prevent API mismatches
- **Testing:** Comprehensive test organization for all components

## Development Workflow

### Local Development Setup

#### Prerequisites

```bash
# Install Node.js (required for React Native and backend)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.5/install.sh | bash
nvm install 20.11.0
nvm use 20.11.0

# Install Expo CLI for React Native development
npm install -g @expo/cli@latest

# Install Turborepo for monorepo management
npm install -g turbo@latest

# Install AWS CDK for infrastructure
npm install -g aws-cdk@latest

# Install Docker for local database development
# macOS: brew install docker
# Ubuntu: apt-get install docker.io
```

#### Initial Setup

```bash
# Clone repository and install dependencies
git clone https://github.com/your-org/boltfit.git
cd boltfit
npm install

# Setup environment variables
cp .env.example .env.local
# Edit .env.local with your API keys:
# - GEMINI_API_KEY=your_gemini_key
# - AWS_REGION=us-east-1
# - DATABASE_URL=postgresql://localhost:5432/boltfit_dev

# Start local PostgreSQL and Redis
docker-compose up -d database redis

# Run database migrations
npm run db:migrate

# Seed initial data (exercises, badges)
npm run db:seed
```

#### Development Commands

```bash
# Start all services in development mode
npm run dev

# Start individual services
npm run dev:mobile          # Expo development server
npm run dev:backend         # Local Lambda functions with Serverless Offline
npm run dev:web             # Future web companion (if implemented)

# Run tests across all packages
npm run test

# Run tests for specific packages
npm run test:mobile         # React Native tests with Jest
npm run test:backend        # Backend API tests
npm run test:shared         # Shared utility tests

# Type checking
npm run type-check          # TypeScript validation across all packages

# Linting and formatting
npm run lint               # ESLint across all packages
npm run format             # Prettier formatting
```

### Environment Configuration

#### Frontend (.env.local)

```bash
# API Configuration
EXPO_PUBLIC_API_URL=http://localhost:3000/dev
EXPO_PUBLIC_WS_URL=ws://localhost:3001
EXPO_PUBLIC_ENVIRONMENT=development

# External Services
EXPO_PUBLIC_SENTRY_DSN=your_sentry_dsn
EXPO_PUBLIC_ANALYTICS_KEY=your_analytics_key

# Feature Flags
EXPO_PUBLIC_ENABLE_AI_WORKOUTS=true
EXPO_PUBLIC_ENABLE_CAMERA_DETECTION=true
EXPO_PUBLIC_ENABLE_SOCIAL_FEATURES=true
```

#### Backend (.env)

```bash
# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/boltfit_dev
REDIS_URL=redis://localhost:6379

# External APIs
GEMINI_API_KEY=your_gemini_api_key
AWS_REGION=us-east-1

# Authentication
JWT_SECRET=your_jwt_secret_key
COGNITO_USER_POOL_ID=your_cognito_pool_id
COGNITO_CLIENT_ID=your_cognito_client_id

# Monitoring
SENTRY_DSN=your_backend_sentry_dsn
LOG_LEVEL=debug

# Feature Configuration
ENABLE_RATE_LIMITING=false
MAX_WORKOUT_GENERATION_REQUESTS=100
```

#### Shared

```bash
# Common Configuration
NODE_ENV=development
APP_VERSION=1.0.0
SUPPORT_EMAIL=support@boltfit.app
```

## Deployment Architecture

### Deployment Strategy

**Frontend Deployment:**

- **Platform:** Expo Application Services (EAS) for mobile app builds and distribution
- **Build Command:** `eas build --platform all`
- **Output:** Native iOS/Android apps for App Store and Google Play Store
- **OTA Updates:** Expo Updates for JavaScript-only changes

**Backend Deployment:**

- **Platform:** AWS using CDK (Infrastructure as Code)
- **Build Command:** `npm run build:backend && cdk deploy`
- **Deployment Method:** Blue-green deployment with Lambda versioning and aliases

### CI/CD Pipeline

#### GitHub Actions Workflow

```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: boltfit_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
      redis:
        image: redis:7
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "20.11.0"
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Run type checking
        run: npm run type-check

      - name: Run linting
        run: npm run lint

      - name: Run tests
        run: npm run test
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/boltfit_test
          REDIS_URL: redis://localhost:6379

  build-mobile:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'

    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "20.11.0"

      - name: Setup Expo
        uses: expo/expo-github-action@v8
        with:
          expo-version: latest
          token: ${{ secrets.EXPO_TOKEN }}

      - name: Install dependencies
        run: npm ci

      - name: Build mobile app
        run: |
          cd apps/mobile
          eas build --platform all --non-interactive

  deploy-backend:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'

    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "20.11.0"

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1

      - name: Install dependencies
        run: npm ci

      - name: Deploy infrastructure
        run: |
          cd apps/backend
          npm run build
          cdk deploy --all --require-approval never
```

### Environments

| Environment | Frontend URL                | Backend URL                     | Purpose                       |
| ----------- | --------------------------- | ------------------------------- | ----------------------------- |
| Development | Expo Dev Client             | http://localhost:3000           | Local development and testing |
| Staging     | TestFlight/Internal Testing | https://staging-api.boltfit.app | Pre-production testing and QA |
| Production  | App Store/Google Play       | https://api.boltfit.app         | Live user-facing environment  |

## Security and Performance

### Security Requirements

**Frontend Security:**

- **CSP Headers:** Content Security Policy preventing XSS attacks through secure Expo configuration
- **XSS Prevention:** Input sanitization and React Native's built-in protections against script injection
- **Secure Storage:** Expo SecureStore for sensitive data (JWT tokens, user credentials)

**Backend Security:**

- **Input Validation:** Joi schemas for all API inputs with strict type checking and sanitization
- **Rate Limiting:** API Gateway throttling with freemium tier limits (100 requests/hour free, unlimited premium)
- **CORS Policy:** Restricted to mobile app origins only, no wildcard access

**Authentication Security:**

- **Token Storage:** JWT tokens in Expo SecureStore with automatic refresh rotation
- **Session Management:** AWS Cognito with secure session handling and automatic token expiration
- **Password Policy:** Minimum 8 characters, complexity requirements enforced by Cognito

### Performance Optimization

**Frontend Performance:**

- **Bundle Size Target:** <50MB total app size for mobile app stores
- **Loading Strategy:** Lazy loading for non-critical screens, preloading for workout flows
- **Caching Strategy:** React Query for API caching, SQLite for offline workout data

**Backend Performance:**

- **Response Time Target:** <500ms for API endpoints, <100ms for real-time features
- **Database Optimization:** Indexed queries for leaderboards, connection pooling for concurrent users
- **Caching Strategy:** Redis for real-time leaderboards, CloudFront CDN for static assets

This deployment architecture ensures reliable, scalable delivery of BoltFit across mobile platforms while maintaining security and performance standards for a freemium fitness application.

## Testing Strategy

### Testing Pyramid

```text
                  E2E Tests
                 /        \
            Integration Tests
               /            \
          Frontend Unit  Backend Unit
```

### Test Organization

#### Frontend Tests

```text
apps/mobile/__tests__/
├── components/
│   ├── common/
│   │   ├── Button.test.tsx
│   │   ├── Card.test.tsx
│   │   └── Input.test.tsx
│   ├── workout/
│   │   ├── WorkoutTimer.test.tsx
│   │   ├── ExerciseCard.test.tsx
│   │   └── RepCounter.test.tsx
│   ├── social/
│   │   ├── FriendsList.test.tsx
│   │   ├── Leaderboard.test.tsx
│   │   └── ActivityFeed.test.tsx
│   └── gamification/
│       ├── StreakFlame.test.tsx
│       ├── BadgeDisplay.test.tsx
│       └── XPBar.test.tsx
├── screens/
│   ├── workout/
│   │   ├── WorkoutPlan.test.tsx
│   │   ├── ActiveWorkout.test.tsx
│   │   └── WorkoutHistory.test.tsx
│   ├── social/
│   │   ├── Friends.test.tsx
│   │   └── Leaderboards.test.tsx
│   └── profile/
│       ├── UserProfile.test.tsx
│       └── Settings.test.tsx
├── hooks/
│   ├── useAuth.test.ts
│   ├── useWorkout.test.ts
│   ├── useStreak.test.ts
│   └── useCamera.test.ts
├── services/
│   ├── api.test.ts
│   ├── auth.test.ts
│   ├── workout.test.ts
│   └── social.test.ts
├── utils/
│   ├── database.test.ts
│   ├── camera.test.ts
│   ├── health.test.ts
│   └── calculations.test.ts
└── integration/
    ├── workout-flow.test.tsx
    ├── social-features.test.tsx
    └── offline-sync.test.tsx
```

#### Backend Tests

```text
apps/backend/tests/
├── unit/
│   ├── services/
│   │   ├── authService.test.ts
│   │   ├── workoutService.test.ts
│   │   ├── socialService.test.ts
│   │   ├── gamificationService.test.ts
│   │   └── aiService.test.ts
│   ├── models/
│   │   ├── User.test.ts
│   │   ├── Workout.test.ts
│   │   ├── Exercise.test.ts
│   │   ├── Streak.test.ts
│   │   └── Social.test.ts
│   └── utils/
│       ├── database.test.ts
│       ├── redis.test.ts
│       ├── auth.test.ts
│       ├── validation.test.ts
│       └── errors.test.ts
├── integration/
│   ├── api/
│   │   ├── auth.test.ts
│   │   ├── workout.test.ts
│   │   ├── social.test.ts
│   │   └── gamification.test.ts
│   ├── websocket/
│   │   ├── realtime-updates.test.ts
│   │   └── social-notifications.test.ts
│   └── external/
│       ├── gemini-api.test.ts
│       ├── cognito.test.ts
│       └── health-platforms.test.ts
└── e2e/
    ├── user-journey.test.ts
    ├── workout-completion.test.ts
    ├── social-interaction.test.ts
    └── streak-maintenance.test.ts
```

#### E2E Tests

```text
e2e/
├── specs/
│   ├── onboarding.spec.ts
│   ├── workout-flow.spec.ts
│   ├── social-features.spec.ts
│   ├── gamification.spec.ts
│   └── offline-functionality.spec.ts
├── fixtures/
│   ├── users.json
│   ├── workouts.json
│   └── exercises.json
└── support/
    ├── commands.ts
    └── helpers.ts
```

### Test Examples

#### Frontend Component Test

```typescript
// apps/mobile/__tests__/components/workout/RepCounter.test.tsx
import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { RepCounter } from "../../../src/components/workout/RepCounter";

describe("RepCounter", () => {
  const mockProps = {
    exerciseId: "test-exercise-1",
    targetReps: 10,
    onRepCountUpdate: jest.fn(),
    cameraEnabled: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render with initial rep count of 0", () => {
    const { getByText } = render(<RepCounter {...mockProps} />);
    expect(getByText("0 / 10")).toBeTruthy();
  });

  it("should increment rep count when manual button pressed", () => {
    const { getByTestId, getByText } = render(<RepCounter {...mockProps} />);

    fireEvent.press(getByTestId("manual-rep-button"));

    expect(getByText("1 / 10")).toBeTruthy();
    expect(mockProps.onRepCountUpdate).toHaveBeenCalledWith(1);
  });

  it("should show completion celebration when target reached", async () => {
    const { getByTestId, getByText } = render(<RepCounter {...mockProps} />);

    // Simulate reaching target reps
    for (let i = 0; i < 10; i++) {
      fireEvent.press(getByTestId("manual-rep-button"));
    }

    await waitFor(() => {
      expect(getByText("Set Complete! 🎉")).toBeTruthy();
    });
  });

  it("should handle camera detection updates", () => {
    const { rerender } = render(<RepCounter {...mockProps} />);

    // Simulate camera detection update
    rerender(<RepCounter {...mockProps} detectedReps={5} />);

    expect(mockProps.onRepCountUpdate).toHaveBeenCalledWith(5);
  });
});
```

#### Backend API Test

```typescript
// apps/backend/tests/integration/api/workout.test.ts
import request from "supertest";
import { app } from "../../../src/app";
import { User, WorkoutSession } from "../../../src/models";
import { generateAuthToken } from "../../../src/utils/auth";

describe("Workout API", () => {
  let authToken: string;
  let userId: string;

  beforeEach(async () => {
    // Create test user
    const user = await User.create({
      email: "test@example.com",
      username: "testuser",
    });
    userId = user.id;
    authToken = generateAuthToken(userId);
  });

  afterEach(async () => {
    await WorkoutSession.destroy({ where: { userId } });
    await User.destroy({ where: { id: userId } });
  });

  describe("POST /workouts", () => {
    it("should create a new workout session", async () => {
      const workoutData = {
        type: "strength",
        exercises: [
          {
            exerciseId: "exercise-1",
            sets: 3,
            reps: 10,
            weight: 135,
          },
        ],
        duration: 45,
        energyLevel: 8,
      };

      const response = await request(app)
        .post("/api/v1/workouts")
        .set("Authorization", `Bearer ${authToken}`)
        .send(workoutData)
        .expect(201);

      expect(response.body).toMatchObject({
        sessionId: expect.any(String),
        xpEarned: expect.any(Number),
        badgesUnlocked: expect.any(Array),
      });

      // Verify workout was saved to database
      const savedWorkout = await WorkoutSession.findOne({
        where: { userId, id: response.body.sessionId },
      });
      expect(savedWorkout).toBeTruthy();
      expect(savedWorkout.type).toBe("strength");
      expect(savedWorkout.duration).toBe(45);
    });

    it("should update streak data after workout completion", async () => {
      const workoutData = {
        type: "cardio",
        exercises: [],
        duration: 30,
        energyLevel: 7,
      };

      await request(app)
        .post("/api/v1/workouts")
        .set("Authorization", `Bearer ${authToken}`)
        .send(workoutData)
        .expect(201);

      // Check streak was updated
      const response = await request(app)
        .get("/api/v1/streaks/current")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.currentStreak).toBe(1);
      expect(response.body.lastActivityDate).toBe(
        new Date().toISOString().split("T")[0]
      );
    });

    it("should return validation error for invalid workout data", async () => {
      const invalidData = {
        type: "invalid-type",
        duration: -10,
      };

      const response = await request(app)
        .post("/api/v1/workouts")
        .set("Authorization", `Bearer ${authToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body.error).toMatchObject({
        code: "VALIDATION_ERROR",
        message: expect.any(String),
        details: expect.any(Object),
      });
    });
  });
});
```

#### E2E Test

```typescript
// e2e/specs/workout-flow.spec.ts
import { expect, device, element, by, waitFor } from "detox";

describe("Complete Workout Flow", () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();

    // Login with test user
    await element(by.id("email-input")).typeText("test@example.com");
    await element(by.id("password-input")).typeText("password123");
    await element(by.id("login-button")).tap();

    await waitFor(element(by.id("dashboard-screen")))
      .toBeVisible()
      .withTimeout(5000);
  });

  it("should complete a full workout session", async () => {
    // Navigate to workout generation
    await element(by.id("start-workout-button")).tap();
    await element(by.id("generate-workout-button")).tap();

    // Select workout preferences
    await element(by.id("strength-workout-option")).tap();
    await element(by.id("30-minute-option")).tap();
    await element(by.id("generate-button")).tap();

    await waitFor(element(by.id("workout-plan-screen")))
      .toBeVisible()
      .withTimeout(10000);

    // Start the workout
    await element(by.id("start-workout-button")).tap();

    // Complete first exercise
    await element(by.id("exercise-0")).tap();

    // Manual rep counting
    for (let i = 0; i < 10; i++) {
      await element(by.id("manual-rep-button")).tap();
    }

    await element(by.id("complete-set-button")).tap();
    await element(by.id("next-exercise-button")).tap();

    // Complete workout
    await element(by.id("finish-workout-button")).tap();

    // Verify completion screen
    await waitFor(element(by.id("workout-complete-screen")))
      .toBeVisible()
      .withTimeout(3000);

    await expect(element(by.text("Workout Complete! 🎉"))).toBeVisible();
    await expect(element(by.id("xp-earned-display"))).toBeVisible();

    // Check if streak was updated
    await element(by.id("dashboard-tab")).tap();
    await waitFor(element(by.id("streak-counter")))
      .toBeVisible()
      .withTimeout(3000);

    const streakElement = element(by.id("current-streak-number"));
    await expect(streakElement).toBeVisible();
  });

  it("should handle camera-based rep counting", async () => {
    // Navigate to workout with camera exercise
    await element(by.id("start-workout-button")).tap();
    await element(by.id("bodyweight-workout-option")).tap();
    await element(by.id("generate-button")).tap();

    await waitFor(element(by.id("workout-plan-screen")))
      .toBeVisible()
      .withTimeout(10000);

    await element(by.id("start-workout-button")).tap();

    // Find exercise that supports camera detection
    await element(by.id("push-ups-exercise")).tap();

    // Enable camera mode
    await element(by.id("camera-mode-toggle")).tap();

    await waitFor(element(by.id("camera-view")))
      .toBeVisible()
      .withTimeout(5000);

    // Simulate camera detection (in real test, this would be actual movement)
    await element(by.id("simulate-detection-button")).tap();

    await waitFor(element(by.text("1 / 10")))
      .toBeVisible()
      .withTimeout(2000);

    await expect(element(by.id("detection-feedback"))).toBeVisible();
  });
});
```

## Error Handling Strategy

### Error Flow

```mermaid
sequenceDiagram
    participant U as User
    participant M as Mobile App
    participant A as API Gateway
    participant L as Lambda Function
    participant D as Database
    participant S as Sentry

    U->>M: Perform Action
    M->>A: API Request
    A->>L: Forward Request
    L->>D: Database Query
    D-->>L: Database Error
    L->>S: Log Error with Context
    L-->>A: Structured Error Response
    A-->>M: HTTP Error with Details
    M->>M: Error Boundary Catches Error
    M->>U: User-Friendly Error Message
    M->>M: Offline Fallback (if applicable)
```

### Error Response Format

```typescript
interface ApiError {
  error: {
    code: string;
    message: string;
    details?: Record<string, any>;
    timestamp: string;
    requestId: string;
    retryable?: boolean;
  };
}
```

### Frontend Error Handling

```typescript
// apps/mobile/src/utils/errorHandler.ts
import { AxiosError } from "axios";
import { Alert } from "react-native";
import * as Sentry from "@sentry/react-native";

export class ErrorHandler {
  static handle(error: Error | AxiosError, context?: string) {
    // Log to Sentry with context
    Sentry.addBreadcrumb({
      message: context || "Unknown error occurred",
      level: "error",
      data: { error: error.message },
    });

    Sentry.captureException(error);

    if (this.isNetworkError(error)) {
      return this.handleNetworkError(error);
    }

    if (this.isValidationError(error)) {
      return this.handleValidationError(error);
    }

    if (this.isAuthError(error)) {
      return this.handleAuthError(error);
    }

    // Generic error handling
    return this.handleGenericError(error);
  }

  private static isNetworkError(error: any): boolean {
    return !error.response || error.code === "NETWORK_ERROR";
  }

  private static handleNetworkError(error: AxiosError) {
    Alert.alert(
      "Connection Issue",
      "Please check your internet connection and try again. Your workout data is saved locally.",
      [
        { text: "Retry", onPress: () => this.retryLastRequest() },
        { text: "Continue Offline", style: "cancel" },
      ]
    );
  }

  private static handleValidationError(error: AxiosError) {
    const details = error.response?.data?.error?.details;
    let message = "Please check your input and try again.";

    if (details) {
      message = Object.values(details).join("\n");
    }

    Alert.alert("Input Error", message);
  }

  private static handleAuthError(error: AxiosError) {
    // Redirect to login
    Alert.alert("Session Expired", "Please log in again to continue.", [
      { text: "Login", onPress: () => this.navigateToLogin() },
    ]);
  }
}

// React Error Boundary for component errors
export class WorkoutErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    Sentry.captureException(error, {
      contexts: { react: errorInfo },
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <ErrorFallback
          error={this.state.error}
          onRetry={() => this.setState({ hasError: false, error: null })}
        />
      );
    }

    return this.props.children;
  }
}
```

### Backend Error Handling

```typescript
// apps/backend/src/utils/errors.ts
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly isOperational: boolean;
  public readonly retryable: boolean;

  constructor(
    message: string,
    statusCode: number = 500,
    code: string = "INTERNAL_ERROR",
    isOperational: boolean = true,
    retryable: boolean = false
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = isOperational;
    this.retryable = retryable;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: Record<string, any>) {
    super(message, 400, "VALIDATION_ERROR", true, false);
    this.details = details;
  }
}

export class NetworkError extends AppError {
  constructor(message: string, service?: string) {
    super(message, 503, "NETWORK_ERROR", true, true);
    this.service = service;
  }
}

// Global error handler middleware
export const errorHandler = (error: Error, req: any, res: any, next: any) => {
  // Log error with context
  logger.error("Unhandled error:", {
    error: error.message,
    stack: error.stack,
    requestId: req.id,
    userId: req.user?.id,
    path: req.path,
    method: req.method,
  });

  // Send to Sentry
  Sentry.captureException(error, {
    tags: {
      component: "api",
      path: req.path,
    },
    user: {
      id: req.user?.id,
      email: req.user?.email,
    },
  });

  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      error: {
        code: error.code,
        message: error.message,
        details: error.details,
        timestamp: new Date().toISOString(),
        requestId: req.id,
        retryable: error.retryable,
      },
    });
  }

  // Generic error response
  res.status(500).json({
    error: {
      code: "INTERNAL_ERROR",
      message: "An unexpected error occurred",
      timestamp: new Date().toISOString(),
      requestId: req.id,
      retryable: false,
    },
  });
};
```

This comprehensive testing and error handling strategy ensures BoltFit maintains high quality and reliability across all user interactions, with graceful degradation during network issues and comprehensive error tracking for rapid issue resolution.

## Coding Standards

### Critical Fullstack Rules

- **Type Safety Enforcement:** Always define types in packages/shared and import from there - NEVER use `any` type for data that crosses frontend/backend boundaries
- **API Response Consistency:** All API endpoints must use the standardized ApiResponse wrapper type defined in shared/types/api.ts
- **Error Handling Protocol:** All async operations must use try/catch blocks with standardized error handling - use ErrorHandler.handle() for all caught errors
- **State Management Pattern:** Never mutate state directly in React components - always use Zustand actions or setState patterns
- **Database Query Safety:** All database queries must use parameterized queries through the repository pattern - NEVER use string concatenation for SQL
- **Authentication Required:** All protected routes must verify authentication through the auth middleware - no direct JWT verification in handlers
- **Offline Data Sync:** Mobile app must store all user actions locally first, then sync when connectivity is restored - implement optimistic updates

### Naming Conventions

| Element         | Frontend                    | Backend          | Example                                                |
| --------------- | --------------------------- | ---------------- | ------------------------------------------------------ |
| Components      | PascalCase                  | -                | `WorkoutTimer.tsx`, `StreakFlame.tsx`                  |
| Hooks           | camelCase with 'use' prefix | -                | `useAuth.ts`, `useWorkoutGeneration.ts`                |
| API Routes      | -                           | kebab-case       | `/api/workout-sessions`, `/api/social/friend-requests` |
| Database Tables | -                           | snake_case       | `workout_sessions`, `social_connections`               |
| Functions       | camelCase                   | camelCase        | `calculateXPReward()`, `generateWorkoutPlan()`         |
| Constants       | UPPER_SNAKE_CASE            | UPPER_SNAKE_CASE | `MAX_WORKOUT_DURATION`, `DEFAULT_XP_MULTIPLIER`        |

## Monitoring and Observability

### Monitoring Stack

- **Frontend Monitoring:** Sentry React Native SDK for crash reporting and performance monitoring
- **Backend Monitoring:** Sentry Node.js SDK with AWS CloudWatch for Lambda function monitoring
- **Error Tracking:** Centralized error tracking with contextual user data and session replay
- **Performance Monitoring:** Real-time performance metrics for workout tracking and social features

### Key Metrics

**Frontend Metrics:**

- **App Launch Time:** Target <3 seconds cold start, <1 second warm start
- **Screen Transition Time:** Target <300ms for all screen navigation
- **Camera Detection Accuracy:** Target >90% accuracy for rep counting
- **Offline Sync Success Rate:** Target >99% successful sync when connectivity restored
- **Crash-Free Session Rate:** Target >99.9% crash-free sessions

**Backend Metrics:**

- **API Response Time:** Target <500ms for all endpoints (P95)
- **Database Query Performance:** Target <100ms for individual queries (P95)
- **Gemini API Success Rate:** Target >99% successful workout generation requests
- **WebSocket Connection Stability:** Target >99% uptime for real-time features
- **Lambda Cold Start Time:** Target <1 second for function initialization

**Business Metrics:**

- **Daily Active Users (DAU):** Track user engagement and retention
- **Streak Completion Rate:** Percentage of users maintaining 7+ day streaks
- **Workout Completion Rate:** Percentage of started workouts that are finished
- **Social Engagement Rate:** Friend connections, challenge participation
- **Premium Conversion Rate:** Free-to-paid subscription conversion percentage

### Monitoring Implementation

#### Frontend Monitoring Setup

```typescript
// apps/mobile/src/utils/monitoring.ts
import * as Sentry from "@sentry/react-native";
import { Performance } from "@react-native-async-storage/async-storage";

export const initializeMonitoring = () => {
  Sentry.init({
    dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
    tracesSampleRate: 0.1,
    profilesSampleRate: 0.1,
    attachStacktrace: true,
    beforeSend: (event) => {
      // Filter out non-actionable errors
      if (event.exception?.values?.[0]?.value?.includes("Network Error")) {
        return null; // Don't report network errors to reduce noise
      }
      return event;
    },
  });
};

export const trackWorkoutEvent = (
  eventName: string,
  properties: Record<string, any>
) => {
  Sentry.addBreadcrumb({
    message: eventName,
    level: "info",
    data: properties,
  });

  // Also send to analytics platform
  Analytics.track(eventName, {
    ...properties,
    timestamp: new Date().toISOString(),
    userId: properties.userId,
  });
};

export const measurePerformance = async <T>(
  operation: string,
  fn: () => Promise<T>
): Promise<T> => {
  const startTime = Performance.now();

  try {
    const result = await fn();
    const duration = Performance.now() - startTime;

    Sentry.addBreadcrumb({
      message: `Performance: ${operation}`,
      level: "info",
      data: { duration: `${duration}ms` },
    });

    return result;
  } catch (error) {
    const duration = Performance.now() - startTime;

    Sentry.captureException(error, {
      tags: { operation },
      extra: { duration: `${duration}ms` },
    });

    throw error;
  }
};
```

#### Backend Monitoring Setup

```typescript
// apps/backend/src/utils/monitoring.ts
import * as Sentry from "@sentry/node";
import { CloudWatch } from "aws-sdk";

const cloudwatch = new CloudWatch({ region: process.env.AWS_REGION });

export const initializeBackendMonitoring = () => {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 0.1,
    environment: process.env.NODE_ENV,
  });
};

export const trackCustomMetric = async (
  metricName: string,
  value: number,
  unit: string = "Count",
  dimensions?: Array<{ Name: string; Value: string }>
) => {
  try {
    await cloudwatch
      .putMetricData({
        Namespace: "BoltFit/Application",
        MetricData: [
          {
            MetricName: metricName,
            Value: value,
            Unit: unit,
            Dimensions: dimensions,
            Timestamp: new Date(),
          },
        ],
      })
      .promise();
  } catch (error) {
    console.error("Failed to send custom metric:", error);
  }
};

export const monitorDatabaseQuery = async <T>(
  queryName: string,
  query: () => Promise<T>
): Promise<T> => {
  const startTime = Date.now();

  try {
    const result = await query();
    const duration = Date.now() - startTime;

    await trackCustomMetric("DatabaseQueryDuration", duration, "Milliseconds", [
      { Name: "QueryName", Value: queryName },
      { Name: "Status", Value: "Success" },
    ]);

    return result;
  } catch (error) {
    const duration = Date.now() - startTime;

    await trackCustomMetric("DatabaseQueryDuration", duration, "Milliseconds", [
      { Name: "QueryName", Value: queryName },
      { Name: "Status", Value: "Error" },
    ]);

    Sentry.captureException(error, {
      tags: { queryName },
      extra: { duration },
    });

    throw error;
  }
};

export const createWorkoutMetrics = (workoutData: any) => {
  // Track workout completion metrics
  trackCustomMetric("WorkoutCompleted", 1, "Count", [
    { Name: "WorkoutType", Value: workoutData.type },
    { Name: "Duration", Value: workoutData.duration.toString() },
  ]);

  // Track XP earned for gamification analytics
  trackCustomMetric("XPEarned", workoutData.xpEarned, "Count");

  // Track user engagement
  if (workoutData.detectionMethod === "camera") {
    trackCustomMetric("CameraDetectionUsage", 1, "Count");
  }
};
```

#### Dashboard Configuration

```yaml
# CloudWatch Dashboard for BoltFit
BoltFitDashboard:
  Type: AWS::CloudWatch::Dashboard
  Properties:
    DashboardName: BoltFit-Production-Metrics
    DashboardBody: |
      {
        "widgets": [
          {
            "type": "metric",
            "properties": {
              "metrics": [
                ["BoltFit/Application", "WorkoutCompleted"],
                [".", "XPEarned"],
                [".", "CameraDetectionUsage"]
              ],
              "period": 300,
              "stat": "Sum",
              "region": "us-east-1",
              "title": "User Engagement Metrics"
            }
          },
          {
            "type": "metric",
            "properties": {
              "metrics": [
                ["AWS/Lambda", "Duration", "FunctionName", "boltfit-workout-create"],
                [".", "Errors", ".", "."],
                [".", "Throttles", ".", "."]
              ],
              "period": 300,
              "stat": "Average",
              "region": "us-east-1",
              "title": "Lambda Performance"
            }
          },
          {
            "type": "metric",
            "properties": {
              "metrics": [
                ["AWS/RDS", "DatabaseConnections", "DBInstanceIdentifier", "boltfit-production"],
                [".", "ReadLatency", ".", "."],
                [".", "WriteLatency", ".", "."]
              ],
              "period": 300,
              "stat": "Average",
              "region": "us-east-1",
              "title": "Database Performance"
            }
          }
        ]
      }
```
