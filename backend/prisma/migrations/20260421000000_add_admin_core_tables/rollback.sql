-- Rollback script for admin_core_tables migration
-- This script removes the admin_role, admin_permission, and audit_log tables

-- Drop Foreign Keys first
ALTER TABLE "audit_log" DROP CONSTRAINT IF EXISTS "audit_log_user_id_fkey";
ALTER TABLE "admin_permission" DROP CONSTRAINT IF EXISTS "admin_permission_granted_by_fkey";
ALTER TABLE "admin_permission" DROP CONSTRAINT IF EXISTS "admin_permission_role_id_fkey";
ALTER TABLE "admin_permission" DROP CONSTRAINT IF EXISTS "admin_permission_user_id_fkey";
ALTER TABLE "admin_role" DROP CONSTRAINT IF EXISTS "admin_role_created_by_fkey";

-- Drop Check Constraints
ALTER TABLE "audit_log" DROP CONSTRAINT IF EXISTS "audit_log_status_code_check";
ALTER TABLE "admin_permission" DROP CONSTRAINT IF EXISTS "admin_permission_expires_at_check";
ALTER TABLE "admin_role" DROP CONSTRAINT IF EXISTS "admin_role_system_protection_check";

-- Drop Indexes
DROP INDEX IF EXISTS "audit_log_ip_address_idx";
DROP INDEX IF EXISTS "audit_log_created_at_idx";
DROP INDEX IF EXISTS "audit_log_action_idx";
DROP INDEX IF EXISTS "audit_log_resource_type_resource_id_idx";
DROP INDEX IF EXISTS "audit_log_user_id_created_at_idx";

DROP INDEX IF EXISTS "admin_permission_expires_at_idx";
DROP INDEX IF EXISTS "admin_permission_resource_action_idx";
DROP INDEX IF EXISTS "admin_permission_role_id_idx";
DROP INDEX IF EXISTS "admin_permission_user_id_idx";
DROP INDEX IF EXISTS "admin_permission_user_id_resource_action_key";

DROP INDEX IF EXISTS "admin_role_created_by_idx";
DROP INDEX IF EXISTS "admin_role_is_system_idx";
DROP INDEX IF EXISTS "admin_role_is_active_idx";
DROP INDEX IF EXISTS "admin_role_name_key";

-- Drop Tables
DROP TABLE IF EXISTS "audit_log";
DROP TABLE IF EXISTS "admin_permission";
DROP TABLE IF EXISTS "admin_role";
