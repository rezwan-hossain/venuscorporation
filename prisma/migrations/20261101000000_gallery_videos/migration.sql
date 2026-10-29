-- Event films on the gallery page (admin → Manage Gallery → Event films).

-- CreateTable
CREATE TABLE "gallery_videos" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT,
    "duration" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gallery_videos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "gallery_videos_isActive_sortOrder_idx" ON "gallery_videos"("isActive", "sortOrder");

