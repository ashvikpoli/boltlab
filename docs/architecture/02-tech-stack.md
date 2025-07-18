# Tech Stack

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

## Key Technology Decisions Rationale

**Mobile Stack:** Expo + React Native provides the fastest development velocity while maintaining native performance for camera/sensor features critical to BoltFit's automatic rep counting.

**AI Integration:** Gemini API offers superior reasoning capabilities for workout personalization, while TensorFlow Lite keeps sensitive video data on-device for privacy.

**Backend Architecture:** Serverless Lambda functions provide cost-effective scaling that aligns perfectly with the freemium business model - pay only for active users.

**Database Strategy:** PostgreSQL for complex social relationships and ACID compliance, Redis for real-time leaderboards and streak data requiring sub-second latency.

**Authentication Choice:** AWS Cognito provides social login integration (Google, Apple) with built-in JWT management, reducing development overhead.
