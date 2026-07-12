-- CreateTable: admin_role
CREATE TABLE IF NOT EXISTS "admin_role" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "name_ar" TEXT NOT NULL,
    "description" TEXT,
    "permissions" JSONB NOT NULL DEFAULT '{}',
    "is_system" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_by" UUID,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "admin_role_pkey" PRIMARY KEY ("id")
);

-- CreateTable: admin_permission
CREATE TABLE IF NOT EXISTS "admin_permission" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "role_id" UUID,
    "resource" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "granted" BOOLEAN NOT NULL DEFAULT true,
    "scope" JSONB,
    "expires_at" TIMESTAMPTZ,
    "granted_by" UUID,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "admin_permission_pkey" PRIMARY KEY ("id")
);

-- CreateTable: audit_log
CREATE TABLE IF NOT EXISTS "audit_log" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID,
    "user_name" TEXT,
    "user_email" TEXT,
    "action" TEXT NOT NULL,
    "resource_type" TEXT NOT NULL,
    "resource_id" UUID,
    "details" JSONB,
    "method" TEXT,
    "endpoint" TEXT,
    "status_code" INTEGER,
    "ip_address" INET,
    "user_agent" TEXT,
    "success" BOOLEAN NOT NULL DEFAULT true,
    "error_message" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_log_pkey" PRIMARY KEY ("id")
);

-- CreateIndex: admin_role
CREATE UNIQUE INDEX IF NOT EXISTS "admin_role_name_key" ON "admin_role"("name");
CREATE INDEX IF NOT EXISTS "admin_role_is_active_idx" ON "admin_role"("is_active");
CREATE INDEX IF NOT EXISTS "admin_role_is_system_idx" ON "admin_role"("is_system");
CREATE INDEX IF NOT EXISTS "admin_role_created_by_idx" ON "admin_role"("created_by");

-- CreateIndex: admin_permission
CREATE UNIQUE INDEX IF NOT EXISTS "admin_permission_user_id_resource_action_key" ON "admin_permission"("user_id", "resource", "action");
CREATE INDEX IF NOT EXISTS "admin_permission_user_id_idx" ON "admin_permission"("user_id");
CREATE INDEX IF NOT EXISTS "admin_permission_role_id_idx" ON "admin_permission"("role_id");
CREATE INDEX IF NOT EXISTS "admin_permission_resource_action_idx" ON "admin_permission"("resource", "action");
CREATE INDEX IF NOT EXISTS "admin_permission_expires_at_idx" ON "admin_permission"("expires_at");

-- CreateIndex: audit_log
CREATE INDEX IF NOT EXISTS "audit_log_user_id_created_at_idx" ON "audit_log"("user_id", "created_at" DESC);
CREATE INDEX IF NOT EXISTS "audit_log_resource_type_resource_id_idx" ON "audit_log"("resource_type", "resource_id");
CREATE INDEX IF NOT EXISTS "audit_log_action_idx" ON "audit_log"("action");
CREATE INDEX IF NOT EXISTS "audit_log_created_at_idx" ON "audit_log"("created_at" DESC);
CREATE INDEX IF NOT EXISTS "audit_log_ip_address_idx" ON "audit_log"("ip_address");

-- AddForeignKey: admin_role
DO $$ BEGIN
    ALTER TABLE "admin_role" ADD CONSTRAINT "admin_role_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "user_profile"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- AddForeignKey: admin_permission
DO $$ BEGIN
    ALTER TABLE "admin_permission" ADD CONSTRAINT "admin_permission_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user_profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "admin_permission" ADD CONSTRAINT "admin_permission_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "admin_role"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "admin_permission" ADD CONSTRAINT "admin_permission_granted_by_fkey" FOREIGN KEY ("granted_by") REFERENCES "user_profile"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- AddForeignKey: audit_log
DO $$ BEGIN
    ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user_profile"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Check Constraints
DO $$ BEGIN
    ALTER TABLE "admin_role" ADD CONSTRAINT "admin_role_system_protection_check" CHECK (
      (is_system = false) OR 
      (is_system = true AND is_active = true)
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "admin_permission" ADD CONSTRAINT "admin_permission_expires_at_check" CHECK (
      expires_at IS NULL OR expires_at > created_at
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_status_code_check" CHECK (
      status_code IS NULL OR (status_code >= 100 AND status_code < 600)
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
