-- Event categories (marathon, conference, exhibition, social, workshop).
-- NOT APPLIED YET — run `npx prisma migrate dev` to apply.
--
-- 1. Every existing event becomes a MARATHON (the default), so nothing changes
--    for current events.
-- 2. The race-only registration fields become optional, so non-race events
--    can save registrations without them. Existing rows keep their values.
-- 3. `details` stores the answers to other categories' checkout questions.

-- CreateEnum
CREATE TYPE "EventCategory" AS ENUM ('MARATHON', 'CONFERENCE', 'EXHIBITION', 'SOCIAL', 'WORKSHOP');

-- AlterTable
ALTER TABLE "events" ADD COLUMN "category" "EventCategory" NOT NULL DEFAULT 'MARATHON';

-- AlterTable
ALTER TABLE "registrations" ALTER COLUMN "gender" DROP NOT NULL,
ALTER COLUMN "birthDate" DROP NOT NULL,
ALTER COLUMN "ageCategory" DROP NOT NULL,
ALTER COLUMN "bloodGroup" DROP NOT NULL,
ALTER COLUMN "tshirtSize" DROP NOT NULL,
ALTER COLUMN "runnerCategory" DROP NOT NULL,
ADD COLUMN "details" JSONB;
