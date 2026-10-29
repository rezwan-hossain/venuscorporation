-- SUPER_ADMIN: an admin who can't be removed from the website.
-- Nobody becomes one automatically. To make someone a super admin, run
-- (with their login email):
--
--   UPDATE "users" SET "role" = 'SUPER_ADMIN' WHERE "email" = 'you@example.com';

-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'SUPER_ADMIN' AFTER 'ADMIN';
