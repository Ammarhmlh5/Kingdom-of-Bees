-- AlterTable
ALTER TABLE "user_profile" ADD COLUMN "google_id" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "user_profile_google_id_key" ON "user_profile"("google_id");
