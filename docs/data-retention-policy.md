# Data Retention Policy — EduTrack

**Effective:** 2026-06-10

## Automated purges (scheduler runs daily)

| Data type | Retention period | Action |
|---|---|---|
| Notifications | 90 days | Auto-deleted by scheduler |
| AuditLog entries | 1 year (365 days) | Auto-deleted by scheduler |
| Messages | 1 year (365 days) | Auto-deleted by scheduler |

## Manual / request-based deletion

| Scenario | Who can act | How |
|---|---|---|
| User deletes own account | User (via settings) | Cascades to submissions, notifications, grades |
| Admin deletes a user | ADMIN role | Admin panel → Users → Delete |
| Teacher deletes a classroom | TEACHER role | Classroom settings → Archive / Delete |
| Student requests data erasure | User → admin | Admin deletes user record |

## Data held indefinitely

The following is retained until explicitly deleted:

- Active user accounts and academic records (assignments, submissions, grades)
- Classroom content created by teachers

## Third-party retention

- **Sentry**: error events retained per Sentry plan (default 90 days)
- **Railway**: deployment logs retained 7 days
- **Anthropic**: see [Anthropic Privacy Policy](https://www.anthropic.com/privacy) — API inputs are not used for training by default

## On account deletion

When a user is deleted, Prisma cascades remove:
- Enrollments
- Submissions + answers + feedback
- Notifications
- Grade goals
- Google OAuth tokens

Items NOT automatically removed on user delete (teacher-owned):
- Assignments, classrooms, rubrics — must be explicitly deleted

## Review schedule

This policy should be reviewed annually or when a significant feature change affects data collection.
