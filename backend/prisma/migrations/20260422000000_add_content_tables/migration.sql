-- Content Management Migration
-- Date: 2026-04-22
-- Adds: content_article, content_faq tables

-- CreateTable: content_article
CREATE TABLE IF NOT EXISTS "content_article" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "title_ar" TEXT NOT NULL,
    "title_en" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "content_ar" TEXT NOT NULL,
    "content_en" TEXT NOT NULL,
    "excerpt_ar" TEXT,
    "excerpt_en" TEXT,
    "category" TEXT NOT NULL,
    "tags" TEXT[] NOT NULL DEFAULT '{}',
    "featured_image" TEXT,
    "images" TEXT[] NOT NULL DEFAULT '{}',
    "videos" TEXT[] NOT NULL DEFAULT '{}',
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "published_at" TIMESTAMPTZ,
    "scheduled_at" TIMESTAMPTZ,
    "author_id" UUID NOT NULL,
    "view_count" INTEGER NOT NULL DEFAULT 0,
    "like_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "content_article_pkey" PRIMARY KEY ("id")
);

-- CreateTable: content_faq
CREATE TABLE IF NOT EXISTS "content_faq" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "question_ar" TEXT NOT NULL,
    "question_en" TEXT NOT NULL,
    "answer_ar" TEXT NOT NULL,
    "answer_en" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "view_count" INTEGER NOT NULL DEFAULT 0,
    "helpful_count" INTEGER NOT NULL DEFAULT 0,
    "created_by" UUID,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "content_faq_pkey" PRIMARY KEY ("id")
);

-- CreateIndex: content_article
CREATE UNIQUE INDEX IF NOT EXISTS "content_article_slug_key" ON "content_article"("slug");
CREATE INDEX IF NOT EXISTS "content_article_status_published_at_idx" ON "content_article"("status", "published_at" DESC);
CREATE INDEX IF NOT EXISTS "content_article_category_idx" ON "content_article"("category");
CREATE INDEX IF NOT EXISTS "content_article_author_id_idx" ON "content_article"("author_id");

-- CreateIndex: content_faq
CREATE INDEX IF NOT EXISTS "content_faq_category_idx" ON "content_faq"("category");
CREATE INDEX IF NOT EXISTS "content_faq_is_active_idx" ON "content_faq"("is_active");
CREATE INDEX IF NOT EXISTS "content_faq_created_by_idx" ON "content_faq"("created_by");

-- AddForeignKey: content_article
DO $$ BEGIN
    ALTER TABLE "content_article" ADD CONSTRAINT "content_article_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "user_profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- AddForeignKey: content_faq
DO $$ BEGIN
    ALTER TABLE "content_faq" ADD CONSTRAINT "content_faq_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "user_profile"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
