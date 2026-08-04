-- AlterTable
ALTER TABLE "User" ADD COLUMN     "bestStreak" INTEGER DEFAULT 0,
ADD COLUMN     "currentStreak" INTEGER DEFAULT 0,
ADD COLUMN     "dailyGoalMinutes" INTEGER DEFAULT 0,
ADD COLUMN     "lastStudiedAt" TIMESTAMP(3),
ADD COLUMN     "notificationEnabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "onboarded" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "profileImageUrl" TEXT,
ADD COLUMN     "rankingAlert" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "reportAlert" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "streakAlert" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "studyReminderTime" TIMESTAMP(3);
