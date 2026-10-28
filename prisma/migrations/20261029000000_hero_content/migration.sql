-- Homepage hero: show an event or custom text, plus a YouTube showreel link.

-- CreateEnum
CREATE TYPE "HeroSource" AS ENUM ('EVENT', 'CUSTOM');

-- AlterTable
ALTER TABLE "hero_sections"
  ADD COLUMN "source" "HeroSource" NOT NULL DEFAULT 'EVENT',
  ADD COLUMN "eventId" TEXT,
  ADD COLUMN "subtitle" TEXT,
  ADD COLUMN "buttonLabel" TEXT,
  ADD COLUMN "youtubeUrl" TEXT,
  ALTER COLUMN "desktopImage" DROP NOT NULL;

-- Existing heroes were written as custom text.
UPDATE "hero_sections" SET "source" = 'CUSTOM';

-- AddForeignKey
ALTER TABLE "hero_sections" ADD CONSTRAINT "hero_sections_eventId_fkey"
  FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE SET NULL ON UPDATE CASCADE;
