/*
  Warnings:

  - You are about to drop the column `aiStudentLevel` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `bestStreak` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `currentStreak` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `dailyGoalMinutes` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `lastStudiedAt` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `notificationEnabled` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `onboarded` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `profileImageUrl` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `rankingAlert` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `reportAlert` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `streakAlert` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `studyReminderTime` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `Card` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CardReview` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Character` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CharacterPreset` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CharacterStat` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `DailyActivity` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Deck` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Exam` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ExamAnswer` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ExpLog` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `FeedbackReport` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Field` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `FieldLevel` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `GrowthSnapshot` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Job` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `League` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `LeagueGroup` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `LeagueMember` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `LeagueSeason` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Memo` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `MemoAnswer` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Question` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `QuestionSet` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Recommendation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TeachingMessage` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TeachingReport` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TeachingSession` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Topic` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UserField` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UserUnlock` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `WeakPoint` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_QuestionSetToTopic` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_TeachingSessionToTopic` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_TopicToWeakPoint` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "StudyType" AS ENUM ('TEACH', 'CARD', 'EXAM');

-- DropForeignKey
ALTER TABLE "Card" DROP CONSTRAINT "Card_deckId_fkey";

-- DropForeignKey
ALTER TABLE "CardReview" DROP CONSTRAINT "CardReview_cardId_fkey";

-- DropForeignKey
ALTER TABLE "CardReview" DROP CONSTRAINT "CardReview_userId_fkey";

-- DropForeignKey
ALTER TABLE "Character" DROP CONSTRAINT "Character_presetId_fkey";

-- DropForeignKey
ALTER TABLE "Character" DROP CONSTRAINT "Character_userId_fkey";

-- DropForeignKey
ALTER TABLE "CharacterStat" DROP CONSTRAINT "CharacterStat_characterId_fkey";

-- DropForeignKey
ALTER TABLE "DailyActivity" DROP CONSTRAINT "DailyActivity_userId_fkey";

-- DropForeignKey
ALTER TABLE "Deck" DROP CONSTRAINT "Deck_fieldId_fkey";

-- DropForeignKey
ALTER TABLE "Deck" DROP CONSTRAINT "Deck_questionSetId_fkey";

-- DropForeignKey
ALTER TABLE "Deck" DROP CONSTRAINT "Deck_topicId_fkey";

-- DropForeignKey
ALTER TABLE "Deck" DROP CONSTRAINT "Deck_userId_fkey";

-- DropForeignKey
ALTER TABLE "Exam" DROP CONSTRAINT "Exam_questionSetId_fkey";

-- DropForeignKey
ALTER TABLE "Exam" DROP CONSTRAINT "Exam_userId_fkey";

-- DropForeignKey
ALTER TABLE "ExamAnswer" DROP CONSTRAINT "ExamAnswer_examId_fkey";

-- DropForeignKey
ALTER TABLE "ExamAnswer" DROP CONSTRAINT "ExamAnswer_questionId_fkey";

-- DropForeignKey
ALTER TABLE "ExpLog" DROP CONSTRAINT "ExpLog_userId_fkey";

-- DropForeignKey
ALTER TABLE "FeedbackReport" DROP CONSTRAINT "FeedbackReport_userId_fkey";

-- DropForeignKey
ALTER TABLE "Field" DROP CONSTRAINT "Field_parentId_fkey";

-- DropForeignKey
ALTER TABLE "FieldLevel" DROP CONSTRAINT "FieldLevel_characterId_fkey";

-- DropForeignKey
ALTER TABLE "FieldLevel" DROP CONSTRAINT "FieldLevel_fieldId_fkey";

-- DropForeignKey
ALTER TABLE "GrowthSnapshot" DROP CONSTRAINT "GrowthSnapshot_userId_fkey";

-- DropForeignKey
ALTER TABLE "Job" DROP CONSTRAINT "Job_userId_fkey";

-- DropForeignKey
ALTER TABLE "LeagueGroup" DROP CONSTRAINT "LeagueGroup_leagueId_fkey";

-- DropForeignKey
ALTER TABLE "LeagueGroup" DROP CONSTRAINT "LeagueGroup_seasonId_fkey";

-- DropForeignKey
ALTER TABLE "LeagueMember" DROP CONSTRAINT "LeagueMember_groupId_fkey";

-- DropForeignKey
ALTER TABLE "LeagueMember" DROP CONSTRAINT "LeagueMember_userId_fkey";

-- DropForeignKey
ALTER TABLE "Memo" DROP CONSTRAINT "Memo_userId_fkey";

-- DropForeignKey
ALTER TABLE "MemoAnswer" DROP CONSTRAINT "MemoAnswer_memoId_fkey";

-- DropForeignKey
ALTER TABLE "Question" DROP CONSTRAINT "Question_questionSetId_fkey";

-- DropForeignKey
ALTER TABLE "QuestionSet" DROP CONSTRAINT "QuestionSet_fieldId_fkey";

-- DropForeignKey
ALTER TABLE "QuestionSet" DROP CONSTRAINT "QuestionSet_userId_fkey";

-- DropForeignKey
ALTER TABLE "Recommendation" DROP CONSTRAINT "Recommendation_userId_fkey";

-- DropForeignKey
ALTER TABLE "TeachingMessage" DROP CONSTRAINT "TeachingMessage_sessionId_fkey";

-- DropForeignKey
ALTER TABLE "TeachingReport" DROP CONSTRAINT "TeachingReport_sessionId_fkey";

-- DropForeignKey
ALTER TABLE "TeachingSession" DROP CONSTRAINT "TeachingSession_fieldId_fkey";

-- DropForeignKey
ALTER TABLE "TeachingSession" DROP CONSTRAINT "TeachingSession_questionSetId_fkey";

-- DropForeignKey
ALTER TABLE "TeachingSession" DROP CONSTRAINT "TeachingSession_userId_fkey";

-- DropForeignKey
ALTER TABLE "Topic" DROP CONSTRAINT "Topic_fieldId_fkey";

-- DropForeignKey
ALTER TABLE "Topic" DROP CONSTRAINT "Topic_userId_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_currentLeagueId_fkey";

-- DropForeignKey
ALTER TABLE "UserField" DROP CONSTRAINT "UserField_fieldId_fkey";

-- DropForeignKey
ALTER TABLE "UserField" DROP CONSTRAINT "UserField_userId_fkey";

-- DropForeignKey
ALTER TABLE "UserUnlock" DROP CONSTRAINT "UserUnlock_userId_fkey";

-- DropForeignKey
ALTER TABLE "WeakPoint" DROP CONSTRAINT "WeakPoint_fieldId_fkey";

-- DropForeignKey
ALTER TABLE "WeakPoint" DROP CONSTRAINT "WeakPoint_userId_fkey";

-- DropForeignKey
ALTER TABLE "_QuestionSetToTopic" DROP CONSTRAINT "_QuestionSetToTopic_A_fkey";

-- DropForeignKey
ALTER TABLE "_QuestionSetToTopic" DROP CONSTRAINT "_QuestionSetToTopic_B_fkey";

-- DropForeignKey
ALTER TABLE "_TeachingSessionToTopic" DROP CONSTRAINT "_TeachingSessionToTopic_A_fkey";

-- DropForeignKey
ALTER TABLE "_TeachingSessionToTopic" DROP CONSTRAINT "_TeachingSessionToTopic_B_fkey";

-- DropForeignKey
ALTER TABLE "_TopicToWeakPoint" DROP CONSTRAINT "_TopicToWeakPoint_A_fkey";

-- DropForeignKey
ALTER TABLE "_TopicToWeakPoint" DROP CONSTRAINT "_TopicToWeakPoint_B_fkey";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "aiStudentLevel",
DROP COLUMN "bestStreak",
DROP COLUMN "createdAt",
DROP COLUMN "currentStreak",
DROP COLUMN "dailyGoalMinutes",
DROP COLUMN "lastStudiedAt",
DROP COLUMN "notificationEnabled",
DROP COLUMN "onboarded",
DROP COLUMN "profileImageUrl",
DROP COLUMN "rankingAlert",
DROP COLUMN "reportAlert",
DROP COLUMN "streakAlert",
DROP COLUMN "studyReminderTime",
DROP COLUMN "updatedAt";

-- DropTable
DROP TABLE "Card";

-- DropTable
DROP TABLE "CardReview";

-- DropTable
DROP TABLE "Character";

-- DropTable
DROP TABLE "CharacterPreset";

-- DropTable
DROP TABLE "CharacterStat";

-- DropTable
DROP TABLE "DailyActivity";

-- DropTable
DROP TABLE "Deck";

-- DropTable
DROP TABLE "Exam";

-- DropTable
DROP TABLE "ExamAnswer";

-- DropTable
DROP TABLE "ExpLog";

-- DropTable
DROP TABLE "FeedbackReport";

-- DropTable
DROP TABLE "Field";

-- DropTable
DROP TABLE "FieldLevel";

-- DropTable
DROP TABLE "GrowthSnapshot";

-- DropTable
DROP TABLE "Job";

-- DropTable
DROP TABLE "League";

-- DropTable
DROP TABLE "LeagueGroup";

-- DropTable
DROP TABLE "LeagueMember";

-- DropTable
DROP TABLE "LeagueSeason";

-- DropTable
DROP TABLE "Memo";

-- DropTable
DROP TABLE "MemoAnswer";

-- DropTable
DROP TABLE "Question";

-- DropTable
DROP TABLE "QuestionSet";

-- DropTable
DROP TABLE "Recommendation";

-- DropTable
DROP TABLE "TeachingMessage";

-- DropTable
DROP TABLE "TeachingReport";

-- DropTable
DROP TABLE "TeachingSession";

-- DropTable
DROP TABLE "Topic";

-- DropTable
DROP TABLE "UserField";

-- DropTable
DROP TABLE "UserUnlock";

-- DropTable
DROP TABLE "WeakPoint";

-- DropTable
DROP TABLE "_QuestionSetToTopic";

-- DropTable
DROP TABLE "_TeachingSessionToTopic";

-- DropTable
DROP TABLE "_TopicToWeakPoint";

-- DropEnum
DROP TYPE "AnswerType";

-- DropEnum
DROP TYPE "DeckType";

-- DropEnum
DROP TYPE "Difficulty";

-- DropEnum
DROP TYPE "ExamStatus";

-- DropEnum
DROP TYPE "ExpSource";

-- DropEnum
DROP TYPE "JobStatus";

-- DropEnum
DROP TYPE "JobType";

-- DropEnum
DROP TYPE "LeagueResult";

-- DropEnum
DROP TYPE "Mastery";

-- DropEnum
DROP TYPE "MessageRole";

-- DropEnum
DROP TYPE "QuestionType";

-- DropEnum
DROP TYPE "RecommendType";

-- DropEnum
DROP TYPE "ReportPeriod";

-- DropEnum
DROP TYPE "ReportStatus";

-- DropEnum
DROP TYPE "SeasonStatus";

-- DropEnum
DROP TYPE "SessionStatus";

-- DropEnum
DROP TYPE "SetSource";

-- DropEnum
DROP TYPE "StatPeriod";

-- DropEnum
DROP TYPE "TeachingLevel";

-- DropEnum
DROP TYPE "TopicSource";

-- DropEnum
DROP TYPE "UnlockType";

-- DropEnum
DROP TYPE "UserType";

-- CreateTable
CREATE TABLE "character" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,

    CONSTRAINT "character_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "characterLevel" (
    "id" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "exp" INTEGER NOT NULL,
    "characterId" TEXT NOT NULL,

    CONSTRAINT "characterLevel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "studyHistory" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "studyType" "StudyType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "studyHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "character_userId_key" ON "character"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "characterLevel_characterId_key" ON "characterLevel"("characterId");

-- AddForeignKey
ALTER TABLE "character" ADD CONSTRAINT "character_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "characterLevel" ADD CONSTRAINT "characterLevel_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "character"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "studyHistory" ADD CONSTRAINT "studyHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
