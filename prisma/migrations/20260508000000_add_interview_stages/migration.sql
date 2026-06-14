-- Add flexible interview stages to JobApplication
ALTER TABLE "JobApplication" ADD COLUMN "interviewStages" TEXT;
ALTER TABLE "JobApplication" ADD COLUMN "currentStageIdx" INTEGER NOT NULL DEFAULT 0;
