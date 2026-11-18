-- Optional "Event partners" logos per event: [{ name, role, logo?, short? }]. NULL = none.
ALTER TABLE "events" ADD COLUMN "partners" JSONB;
