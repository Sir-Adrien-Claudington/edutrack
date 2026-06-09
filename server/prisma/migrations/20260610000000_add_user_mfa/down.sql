-- Rollback MFA fields
ALTER TABLE "User" DROP COLUMN IF EXISTS "mfaSecret";
ALTER TABLE "User" DROP COLUMN IF EXISTS "mfaEnabled";
