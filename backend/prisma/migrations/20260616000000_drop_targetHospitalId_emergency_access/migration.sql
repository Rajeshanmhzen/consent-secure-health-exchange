-- Drop stale targetHospitalId column from emergency_access
ALTER TABLE "emergency_access" DROP COLUMN IF EXISTS "targetHospitalId";
