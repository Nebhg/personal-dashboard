-- AlterTable: add job description fields to JobApplication
ALTER TABLE "JobApplication" ADD COLUMN "jobDescriptionPath" TEXT;
ALTER TABLE "JobApplication" ADD COLUMN "jobDescription" TEXT;
