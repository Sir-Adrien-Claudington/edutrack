-- Rollback: drops all tables and enums for the full current schema.
-- Run this to completely tear down the EduTrack database.
-- CASCADE handles all foreign key dependencies automatically.

DROP TABLE IF EXISTS "SeatingChart" CASCADE;
DROP TABLE IF EXISTS "TeacherAnnouncement" CASCADE;
DROP TABLE IF EXISTS "Intervention" CASCADE;
DROP TABLE IF EXISTS "ParentContact" CASCADE;
DROP TABLE IF EXISTS "LessonPlan" CASCADE;
DROP TABLE IF EXISTS "TemplateQuestion" CASCADE;
DROP TABLE IF EXISTS "AssignmentTemplate" CASCADE;
DROP TABLE IF EXISTS "RubricCriteria" CASCADE;
DROP TABLE IF EXISTS "Rubric" CASCADE;
DROP TABLE IF EXISTS "GradeGoal" CASCADE;
DROP TABLE IF EXISTS "Notification" CASCADE;
DROP TABLE IF EXISTS "AuditLog" CASCADE;
DROP TABLE IF EXISTS "Announcement" CASCADE;
DROP TABLE IF EXISTS "PlatformSetting" CASCADE;
DROP TABLE IF EXISTS "UnitAssessment" CASCADE;
DROP TABLE IF EXISTS "LessonUnderstanding" CASCADE;
DROP TABLE IF EXISTS "UnderstandingLevel" CASCADE;
DROP TABLE IF EXISTS "Lesson" CASCADE;
DROP TABLE IF EXISTS "Unit" CASCADE;
DROP TABLE IF EXISTS "ExternalGrade" CASCADE;
DROP TABLE IF EXISTS "ExternalAssignment" CASCADE;
DROP TABLE IF EXISTS "Term" CASCADE;
DROP TABLE IF EXISTS "StudentComment" CASCADE;
DROP TABLE IF EXISTS "UnitGrade" CASCADE;
DROP TABLE IF EXISTS "GradeBoundary" CASCADE;
DROP TABLE IF EXISTS "Message" CASCADE;
DROP TABLE IF EXISTS "Feedback" CASCADE;
DROP TABLE IF EXISTS "Answer" CASCADE;
DROP TABLE IF EXISTS "Submission" CASCADE;
DROP TABLE IF EXISTS "Question" CASCADE;
DROP TABLE IF EXISTS "Assignment" CASCADE;
DROP TABLE IF EXISTS "Enrollment" CASCADE;
DROP TABLE IF EXISTS "Classroom" CASCADE;
DROP TABLE IF EXISTS "User" CASCADE;

-- Remove _prisma_migrations table (full teardown only)
-- DROP TABLE IF EXISTS "_prisma_migrations" CASCADE;

DROP TYPE IF EXISTS "UnderstandingCategory";
DROP TYPE IF EXISTS "QuestionType";
DROP TYPE IF EXISTS "SubmissionStatus";
DROP TYPE IF EXISTS "AssignmentStatus";
DROP TYPE IF EXISTS "AssignmentType";
DROP TYPE IF EXISTS "Role";
