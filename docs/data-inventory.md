# Data Inventory — EduTrack

**Last updated:** 2026-06-10

## 1. User account data

| Field                | Description                  | Stored     | Purpose                             |
| -------------------- | ---------------------------- | ---------- | ----------------------------------- |
| `email`              | Email address                | DB (plain) | Login, notifications                |
| `passwordHash`       | bcrypt hash (12 rounds)      | DB         | Authentication                      |
| `name`               | Full name                    | DB         | Display                             |
| `role`               | TEACHER / STUDENT / ADMIN    | DB         | Access control                      |
| `lastLoginAt`        | Timestamp of last login      | DB         | Security audit                      |
| `tokenVersion`       | Int — incremented on logout  | DB         | Force-logout / session invalidation |
| `mfaSecret`          | TOTP secret (if MFA enabled) | DB         | Two-factor auth                     |
| `mfaEnabled`         | Boolean                      | DB         | MFA gate                            |
| `googleAccessToken`  | OAuth access token           | DB         | Google Calendar                     |
| `googleRefreshToken` | OAuth refresh token          | DB         | Google Calendar token refresh       |
| `suspended`          | Boolean                      | DB         | Admin enforcement                   |

## 2. Academic data

| Data                               | Description                           | Retention                |
| ---------------------------------- | ------------------------------------- | ------------------------ |
| Assignments + questions            | Teacher-created content               | Until classroom deleted  |
| Submissions + answers              | Student responses                     | Until user deleted       |
| Grades (totalScore, pointsAwarded) | Per-answer and per-submission scores  | Until submission deleted |
| AI feedback (aiSuggestion)         | LLM-generated feedback per submission | Until submission deleted |
| Teacher notes                      | Free-text grading notes               | Until submission deleted |
| External grades                    | Off-platform grade entries            | Until user deleted       |
| Unit grades                        | Aggregated unit scores                | Until user deleted       |

## 3. Communication data

| Data          | Description               | Retention                          |
| ------------- | ------------------------- | ---------------------------------- |
| Messages      | Classroom-scoped messages | 1 year (see data retention policy) |
| Notifications | In-app alerts             | 90 days (auto-purged)              |
| Announcements | Admin/teacher broadcasts  | Manual deletion                    |

## 4. Audit and security data

| Data                      | Description                             | Retention               |
| ------------------------- | --------------------------------------- | ----------------------- |
| AuditLog                  | Admin actions (action, target, details) | 1 year (auto-purged)    |
| Prompt injection attempts | Logged via pino (server log, not DB)    | Depends on log rotation |

## 5. Third-party services

| Service             | Data shared                                    | Purpose                     |
| ------------------- | ---------------------------------------------- | --------------------------- |
| Neon (PostgreSQL)   | All DB data                                    | Persistence                 |
| Railway             | Env vars (secrets), build logs                 | Hosting                     |
| Anthropic Claude    | Assignment title, score, weak tags, first name | AI feedback / class insight |
| Google Calendar API | Assignment title, due date                     | Calendar event creation     |
| Sentry              | Stack traces, user IDs, route paths            | Error monitoring            |

## 6. Data NOT collected

- Payment data
- IP addresses (not stored in DB — only logged transiently via pino-http)
- Browser fingerprints
- Location data
