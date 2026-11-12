-- Gallery photos can be tagged with a service ("weddings", "sports-events" …).
-- The list lives in lib/gallery-services.ts. Optional, so existing photos
-- keep working (they show under "All").
ALTER TABLE "gallery_images" ADD COLUMN "service" TEXT;
