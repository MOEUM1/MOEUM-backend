/*
  Warnings:

  - Made the column `context` on table `UserContext` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "UserContext" ALTER COLUMN "context" SET NOT NULL,
ALTER COLUMN "context" SET DEFAULT '',
ALTER COLUMN "context" SET DATA TYPE TEXT;
