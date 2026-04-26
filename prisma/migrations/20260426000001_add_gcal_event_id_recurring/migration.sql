-- AddColumn gcalEventId to RecurringBlock and WorkoutPlan
ALTER TABLE "RecurringBlock" ADD COLUMN "gcalEventId" TEXT;
ALTER TABLE "WorkoutPlan" ADD COLUMN "gcalEventId" TEXT;
