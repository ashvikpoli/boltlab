# Technical Assumptions

## Repository Structure: Monorepo

A single repository using a tool like Turborepo or Nx to manage the mobile app, potential web companion, and shared packages for consistent UI components and business logic across platforms.

## Service Architecture

Mobile-first hybrid architecture with React Native for cross-platform development, backed by serverless functions for AI processing and real-time social features. This approach balances development efficiency with the performance needed for workout tracking.

## Testing Requirements

Unit testing for business logic, integration testing for AI workout generation algorithms, and automated UI testing for critical user flows (streak tracking, workout completion). Manual testing focus on camera-based rep counting accuracy and social feature interactions.

## Additional Technical Assumptions and Requests

**Mobile Framework:** React Native with Expo for rapid development and easy deployment across iOS/Android platforms while maintaining near-native performance for workout tracking.

**AI/ML Services:**

- **Google Gemini API** for intelligent workout plan generation, personalization algorithms, and natural language processing for voice commands
- **TensorFlow Lite** for on-device rep counting and pose detection to ensure real-time performance without API latency

**Real-time Features:** WebSocket connections for live friend activity feeds and challenge updates, with offline-first architecture using Redux Persist for workout data.

**Camera/Sensor Integration:** Native module integration for camera-based rep counting, accelerometer data for movement detection, and HealthKit/Google Fit integration for comprehensive health data.

**Backend Services:** Serverless architecture using AWS Lambda or Vercel Functions for scalable AI processing, user management, and social features without infrastructure overhead.

**Database Strategy:** PostgreSQL for structured user data, relationships, and leaderboards, with Redis for real-time features like live workout sessions and streak notifications.

**Authentication:** Social login options (Google, Apple) with JWT token management, considering fitness app users prefer quick signup processes.

**Push Notifications:** Intelligent notification system for streak reminders, friend achievements, and personalized workout suggestions without becoming spam.

**Analytics & Monitoring:** Mixpanel or Amplitude for user behavior tracking, Sentry for error monitoring, and custom dashboards for tracking engagement metrics crucial to freemium conversion.
