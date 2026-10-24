-- Add a MANAGEMENT team category (CEO, MD, directors, heads of department).
-- BEFORE 'ADMIN' so it sorts first wherever team members are ordered by category.
ALTER TYPE "TeamCategory" ADD VALUE 'MANAGEMENT' BEFORE 'ADMIN';
