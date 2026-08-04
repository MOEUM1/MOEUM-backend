/*
  Warnings:

  - You are about to drop the column `passwordHashed` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[nickname]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `passwordHash` to the `User` table without a default value. This is not possible if the table is not empty.
  - Made the column `bestStreak` on table `User` required. This step will fail if there are existing NULL values in that column.
  - Made the column `currentStreak` on table `User` required. This step will fail if there are existing NULL values in that column.
  - Made the column `dailyGoalMinutes` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "Difficulty" AS ENUM ('EASY', 'NORMAL', 'HARD');

-- CreateEnum
CREATE TYPE "QuestionType" AS ENUM ('MULTIPLE_CHOICE', 'SHORT_ANSWER', 'DESCRIPTIVE', 'OX');

-- CreateEnum
CREATE TYPE "SetSource" AS ENUM ('AI', 'REGENERATED', 'PRE_GENERATED');

-- CreateEnum
CREATE TYPE "ExamStatus" AS ENUM ('IN_PROGRESS', 'SUBMITTED', 'GRADING', 'GRADED');

-- CreateEnum
CREATE TYPE "TeachingLevel" AS ENUM ('BEGINNER', 'NORMAL', 'SHARP');

-- CreateEnum
CREATE TYPE "SessionStatus" AS ENUM ('IN_PROGRESS', 'READY_TO_FINISH', 'FINISHED', 'ABANDONED');

-- CreateEnum
CREATE TYPE "MessageRole" AS ENUM ('AI', 'USER');

-- CreateEnum
CREATE TYPE "ExpSource" AS ENUM ('TEACHING', 'CARD', 'EXAM', 'STREAK', 'LEVEL_UP_BONUS');

-- CreateEnum
CREATE TYPE "UnlockType" AS ENUM ('SKIN', 'TITLE');

-- CreateEnum
CREATE TYPE "ReportPeriod" AS ENUM ('WEEKLY', 'MONTHLY');

-- CreateEnum
CREATE TYPE "AnswerType" AS ENUM ('EXPLANATION', 'HINT');

-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "JobType" AS ENUM ('GRADE_DESCRIPTIVE', 'TEACHING_REPORT', 'POST_LEARNING_CHAIN');

-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('GENERATING', 'READY', 'FAILED');

-- CreateEnum
CREATE TYPE "RecommendType" AS ENUM ('TEACHING', 'CARD', 'EXAM', 'NONE');

-- CreateEnum
CREATE TYPE "StatPeriod" AS ENUM ('WEEKLY', 'MONTHLY', 'ALL_TIME');

-- CreateEnum
CREATE TYPE "TopicSource" AS ENUM ('AUTO', 'USER');

-- CreateEnum
CREATE TYPE "Mastery" AS ENUM ('NEW', 'WEAK', 'LEARNING', 'MASTERED');

-- CreateEnum
CREATE TYPE "UserType" AS ENUM ('STUDENT', 'ADULT');

-- CreateEnum
CREATE TYPE "DeckType" AS ENUM ('OX_QUIZ');

-- CreateEnum
CREATE TYPE "SeasonStatus" AS ENUM ('ACTIVE', 'CLOSED');

-- CreateEnum
CREATE TYPE "LeagueResult" AS ENUM ('PROMOTED', 'STAY', 'DEMOTED');

-- AlterTable
ALTER TABLE "User" DROP COLUMN "passwordHashed",
ADD COLUMN     "aiStudentLevel" "TeachingLevel" NOT NULL DEFAULT 'NORMAL',
ADD COLUMN     "currentLeagueId" TEXT,
ADD COLUMN     "learningPrompt" TEXT,
ADD COLUMN     "passwordHash" TEXT NOT NULL,
ALTER COLUMN "bestStreak" SET NOT NULL,
ALTER COLUMN "currentStreak" SET NOT NULL,
ALTER COLUMN "dailyGoalMinutes" SET NOT NULL,
ALTER COLUMN "dailyGoalMinutes" SET DEFAULT 20,
ALTER COLUMN "rankingAlert" SET DEFAULT false,
ALTER COLUMN "studyReminderTime" SET DEFAULT '21:00',
ALTER COLUMN "studyReminderTime" SET DATA TYPE TEXT;

-- CreateTable
CREATE TABLE "Field" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "emoji" TEXT,
    "parentId" TEXT,
    "depth" INTEGER NOT NULL DEFAULT 0,
    "path" TEXT NOT NULL,
    "isLeaf" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Field_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Topic" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fieldId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "source" "TopicSource" NOT NULL DEFAULT 'AUTO',
    "studyCount" INTEGER NOT NULL DEFAULT 0,
    "correctCount" INTEGER NOT NULL DEFAULT 0,
    "totalCount" INTEGER NOT NULL DEFAULT 0,
    "mastery" "Mastery" NOT NULL DEFAULT 'NEW',
    "firstStudiedAt" TIMESTAMP(3),
    "lastStudiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Topic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserField" (
    "userId" TEXT NOT NULL,
    "fieldId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserField_pkey" PRIMARY KEY ("userId","fieldId")
);

-- CreateTable
CREATE TABLE "CharacterPreset" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "imageKey" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "personality" TEXT,
    "unlockLevel" INTEGER NOT NULL DEFAULT 0,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "CharacterPreset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Character" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "presetId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "title" TEXT,
    "level" INTEGER NOT NULL DEFAULT 1,
    "exp" INTEGER NOT NULL DEFAULT 0,
    "totalExp" INTEGER NOT NULL DEFAULT 0,
    "description" TEXT,
    "descriptionUpdatedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Character_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CharacterStat" (
    "characterId" TEXT NOT NULL,
    "understanding" INTEGER NOT NULL DEFAULT 0,
    "memory" INTEGER NOT NULL DEFAULT 0,
    "application" INTEGER NOT NULL DEFAULT 0,
    "explanation" INTEGER NOT NULL DEFAULT 0,
    "consistency" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CharacterStat_pkey" PRIMARY KEY ("characterId")
);

-- CreateTable
CREATE TABLE "FieldLevel" (
    "id" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,
    "fieldId" TEXT NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 1,
    "exp" INTEGER NOT NULL DEFAULT 0,
    "totalExp" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "FieldLevel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExpLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "source" "ExpSource" NOT NULL,
    "sourceId" TEXT,
    "fieldId" TEXT,
    "exp" INTEGER NOT NULL,
    "memo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExpLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserUnlock" (
    "userId" TEXT NOT NULL,
    "type" "UnlockType" NOT NULL,
    "code" TEXT NOT NULL,
    "unlockedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserUnlock_pkey" PRIMARY KEY ("userId","type","code")
);

-- CreateTable
CREATE TABLE "QuestionSet" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fieldId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "difficulty" "Difficulty" NOT NULL,
    "questionType" "QuestionType" NOT NULL,
    "questionCount" INTEGER NOT NULL,
    "sourceType" "SetSource" NOT NULL DEFAULT 'AI',
    "parentSetId" TEXT,
    "referenceText" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QuestionSet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Question" (
    "id" TEXT NOT NULL,
    "questionSetId" TEXT NOT NULL,
    "index" INTEGER NOT NULL,
    "type" "QuestionType" NOT NULL,
    "content" TEXT NOT NULL,
    "choices" JSONB,
    "answer" TEXT NOT NULL,
    "explanation" TEXT,
    "concept" TEXT,

    CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Exam" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "questionSetId" TEXT NOT NULL,
    "status" "ExamStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "timeLimitSec" INTEGER,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "submittedAt" TIMESTAMP(3),
    "elapsedSec" INTEGER,
    "score" INTEGER,
    "correctCount" INTEGER,
    "totalCount" INTEGER,
    "expGained" INTEGER,
    "resultMessage" TEXT,

    CONSTRAINT "Exam_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExamAnswer" (
    "id" TEXT NOT NULL,
    "examId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "myAnswer" TEXT NOT NULL,
    "isCorrect" BOOLEAN,
    "aiComment" TEXT,
    "aiScore" INTEGER,

    CONSTRAINT "ExamAnswer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Deck" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fieldId" TEXT NOT NULL,
    "topicId" TEXT,
    "deckType" "DeckType" NOT NULL DEFAULT 'OX_QUIZ',
    "title" TEXT NOT NULL,
    "questionSetId" TEXT,
    "isShared" BOOLEAN NOT NULL DEFAULT false,
    "copiedFromId" TEXT,
    "copyCount" INTEGER NOT NULL DEFAULT 0,
    "lastStudiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Deck_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Card" (
    "id" TEXT NOT NULL,
    "deckId" TEXT NOT NULL,
    "statement" TEXT NOT NULL,
    "answer" BOOLEAN NOT NULL,
    "explanation" TEXT NOT NULL,
    "concept" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "reviewCount" INTEGER NOT NULL DEFAULT 0,
    "correctCount" INTEGER NOT NULL DEFAULT 0,
    "consecutiveCorrect" INTEGER NOT NULL DEFAULT 0,
    "intervalDays" INTEGER NOT NULL DEFAULT 1,
    "nextReviewAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastCorrect" BOOLEAN,
    "isMastered" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Card_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CardReview" (
    "id" TEXT NOT NULL,
    "cardId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "myAnswer" BOOLEAN NOT NULL,
    "isCorrect" BOOLEAN NOT NULL,
    "elapsedMs" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CardReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "League" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tier" INTEGER NOT NULL,
    "iconKey" TEXT NOT NULL,
    "colorHex" TEXT NOT NULL,
    "promoteCount" INTEGER NOT NULL DEFAULT 3,
    "demoteCount" INTEGER NOT NULL DEFAULT 2,
    "groupSize" INTEGER NOT NULL DEFAULT 10,

    CONSTRAINT "League_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeagueSeason" (
    "id" TEXT NOT NULL,
    "startAt" TIMESTAMP(3) NOT NULL,
    "endAt" TIMESTAMP(3) NOT NULL,
    "status" "SeasonStatus" NOT NULL DEFAULT 'ACTIVE',
    "closedAt" TIMESTAMP(3),

    CONSTRAINT "LeagueSeason_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeagueGroup" (
    "id" TEXT NOT NULL,
    "seasonId" TEXT NOT NULL,
    "leagueId" TEXT NOT NULL,
    "memberCount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "LeagueGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeagueMember" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "weeklyExp" INTEGER NOT NULL DEFAULT 0,
    "rank" INTEGER,
    "result" "LeagueResult",
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LeagueMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeachingSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fieldId" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "level" "TeachingLevel" NOT NULL DEFAULT 'NORMAL',
    "questionSetId" TEXT,
    "status" "SessionStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "turn" INTEGER NOT NULL DEFAULT 1,
    "maxTurns" INTEGER NOT NULL DEFAULT 5,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),

    CONSTRAINT "TeachingSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeachingMessage" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "role" "MessageRole" NOT NULL,
    "turn" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "isFollowUp" BOOLEAN NOT NULL DEFAULT false,
    "score" INTEGER,
    "understood" BOOLEAN,
    "goodPoints" JSONB,
    "missingPoints" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TeachingMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeachingReport" (
    "sessionId" TEXT NOT NULL,
    "overallScore" INTEGER NOT NULL,
    "turnCount" INTEGER NOT NULL,
    "durationSec" INTEGER NOT NULL,
    "summary" TEXT NOT NULL,
    "goodPoints" JSONB NOT NULL,
    "improvePoints" JSONB NOT NULL,
    "weakConcepts" JSONB NOT NULL,
    "expGained" INTEGER NOT NULL,
    "recommendedNext" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TeachingReport_pkey" PRIMARY KEY ("sessionId")
);

-- CreateTable
CREATE TABLE "FeedbackReport" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "period" "ReportPeriod" NOT NULL,
    "fieldId" TEXT,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "summary" TEXT NOT NULL DEFAULT '',
    "metrics" JSONB NOT NULL,
    "trends" JSONB NOT NULL,
    "weakConcepts" JSONB NOT NULL,
    "patterns" JSONB NOT NULL,
    "curriculum" JSONB NOT NULL,
    "characterMessage" TEXT,
    "status" "ReportStatus" NOT NULL DEFAULT 'GENERATING',
    "generatedAt" TIMESTAMP(3),
    "basedOnSessions" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FeedbackReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Job" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "JobType" NOT NULL,
    "targetId" TEXT,
    "status" "JobStatus" NOT NULL DEFAULT 'PENDING',
    "progress" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "result" JSONB,
    "errorCode" TEXT,
    "errorMessage" TEXT,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),

    CONSTRAINT "Job_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Recommendation" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "RecommendType" NOT NULL,
    "title" TEXT NOT NULL,
    "targetId" TEXT,
    "reason" TEXT,
    "payload" JSONB,
    "expiresAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Recommendation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GrowthSnapshot" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "period" "StatPeriod" NOT NULL,
    "summary" JSONB NOT NULL,
    "expByDate" JSONB NOT NULL,
    "byField" JSONB NOT NULL,
    "byActivity" JSONB NOT NULL,
    "snapshotAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GrowthSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WeakPoint" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fieldId" TEXT NOT NULL,
    "concept" TEXT NOT NULL,
    "wrongCount" INTEGER NOT NULL DEFAULT 0,
    "totalCount" INTEGER NOT NULL DEFAULT 0,
    "lastWrongAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WeakPoint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyActivity" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "studiedMinutes" INTEGER NOT NULL DEFAULT 0,
    "cardsReviewed" INTEGER NOT NULL DEFAULT 0,
    "questionsSolved" INTEGER NOT NULL DEFAULT 0,
    "correctCount" INTEGER NOT NULL DEFAULT 0,
    "teachingSessions" INTEGER NOT NULL DEFAULT 0,
    "expGained" INTEGER NOT NULL DEFAULT 0,
    "checkedIn" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "DailyActivity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Memo" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fieldId" TEXT,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Memo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MemoAnswer" (
    "id" TEXT NOT NULL,
    "memoId" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "type" "AnswerType" NOT NULL DEFAULT 'EXPLANATION',
    "relatedConcepts" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MemoAnswer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_TopicToWeakPoint" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_TopicToWeakPoint_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_QuestionSetToTopic" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_QuestionSetToTopic_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_TeachingSessionToTopic" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_TeachingSessionToTopic_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "Field_parentId_order_idx" ON "Field"("parentId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "Field_parentId_name_key" ON "Field"("parentId", "name");

-- CreateIndex
CREATE INDEX "Topic_userId_lastStudiedAt_idx" ON "Topic"("userId", "lastStudiedAt");

-- CreateIndex
CREATE INDEX "Topic_userId_mastery_idx" ON "Topic"("userId", "mastery");

-- CreateIndex
CREATE UNIQUE INDEX "Topic_userId_fieldId_name_key" ON "Topic"("userId", "fieldId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "CharacterPreset_imageKey_key" ON "CharacterPreset"("imageKey");

-- CreateIndex
CREATE UNIQUE INDEX "Character_userId_key" ON "Character"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "FieldLevel_characterId_fieldId_key" ON "FieldLevel"("characterId", "fieldId");

-- CreateIndex
CREATE INDEX "ExpLog_userId_createdAt_idx" ON "ExpLog"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "QuestionSet_userId_fieldId_createdAt_idx" ON "QuestionSet"("userId", "fieldId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Question_questionSetId_index_key" ON "Question"("questionSetId", "index");

-- CreateIndex
CREATE INDEX "Exam_userId_submittedAt_idx" ON "Exam"("userId", "submittedAt");

-- CreateIndex
CREATE UNIQUE INDEX "ExamAnswer_examId_questionId_key" ON "ExamAnswer"("examId", "questionId");

-- CreateIndex
CREATE INDEX "Deck_userId_fieldId_idx" ON "Deck"("userId", "fieldId");

-- CreateIndex
CREATE INDEX "Deck_isShared_copyCount_idx" ON "Deck"("isShared", "copyCount");

-- CreateIndex
CREATE INDEX "Card_deckId_nextReviewAt_idx" ON "Card"("deckId", "nextReviewAt");

-- CreateIndex
CREATE INDEX "CardReview_userId_createdAt_idx" ON "CardReview"("userId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "League_tier_key" ON "League"("tier");

-- CreateIndex
CREATE UNIQUE INDEX "LeagueSeason_startAt_key" ON "LeagueSeason"("startAt");

-- CreateIndex
CREATE INDEX "LeagueGroup_seasonId_leagueId_idx" ON "LeagueGroup"("seasonId", "leagueId");

-- CreateIndex
CREATE INDEX "LeagueMember_userId_idx" ON "LeagueMember"("userId");

-- CreateIndex
CREATE INDEX "LeagueMember_groupId_weeklyExp_idx" ON "LeagueMember"("groupId", "weeklyExp");

-- CreateIndex
CREATE UNIQUE INDEX "LeagueMember_groupId_userId_key" ON "LeagueMember"("groupId", "userId");

-- CreateIndex
CREATE INDEX "TeachingSession_userId_startedAt_idx" ON "TeachingSession"("userId", "startedAt");

-- CreateIndex
CREATE INDEX "TeachingMessage_sessionId_createdAt_idx" ON "TeachingMessage"("sessionId", "createdAt");

-- CreateIndex
CREATE INDEX "FeedbackReport_userId_status_periodStart_idx" ON "FeedbackReport"("userId", "status", "periodStart");

-- CreateIndex
CREATE UNIQUE INDEX "FeedbackReport_userId_period_periodStart_key" ON "FeedbackReport"("userId", "period", "periodStart");

-- CreateIndex
CREATE INDEX "Job_userId_status_idx" ON "Job"("userId", "status");

-- CreateIndex
CREATE INDEX "Job_status_startedAt_idx" ON "Job"("status", "startedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Recommendation_userId_key" ON "Recommendation"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "GrowthSnapshot_userId_period_key" ON "GrowthSnapshot"("userId", "period");

-- CreateIndex
CREATE UNIQUE INDEX "WeakPoint_userId_fieldId_concept_key" ON "WeakPoint"("userId", "fieldId", "concept");

-- CreateIndex
CREATE UNIQUE INDEX "DailyActivity_userId_date_key" ON "DailyActivity"("userId", "date");

-- CreateIndex
CREATE INDEX "Memo_userId_createdAt_idx" ON "Memo"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "_TopicToWeakPoint_B_index" ON "_TopicToWeakPoint"("B");

-- CreateIndex
CREATE INDEX "_QuestionSetToTopic_B_index" ON "_QuestionSetToTopic"("B");

-- CreateIndex
CREATE INDEX "_TeachingSessionToTopic_B_index" ON "_TeachingSessionToTopic"("B");

-- CreateIndex
CREATE UNIQUE INDEX "User_nickname_key" ON "User"("nickname");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_currentLeagueId_fkey" FOREIGN KEY ("currentLeagueId") REFERENCES "League"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Field" ADD CONSTRAINT "Field_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Field"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Topic" ADD CONSTRAINT "Topic_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Topic" ADD CONSTRAINT "Topic_fieldId_fkey" FOREIGN KEY ("fieldId") REFERENCES "Field"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserField" ADD CONSTRAINT "UserField_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserField" ADD CONSTRAINT "UserField_fieldId_fkey" FOREIGN KEY ("fieldId") REFERENCES "Field"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Character" ADD CONSTRAINT "Character_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Character" ADD CONSTRAINT "Character_presetId_fkey" FOREIGN KEY ("presetId") REFERENCES "CharacterPreset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CharacterStat" ADD CONSTRAINT "CharacterStat_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FieldLevel" ADD CONSTRAINT "FieldLevel_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FieldLevel" ADD CONSTRAINT "FieldLevel_fieldId_fkey" FOREIGN KEY ("fieldId") REFERENCES "Field"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExpLog" ADD CONSTRAINT "ExpLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserUnlock" ADD CONSTRAINT "UserUnlock_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionSet" ADD CONSTRAINT "QuestionSet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionSet" ADD CONSTRAINT "QuestionSet_fieldId_fkey" FOREIGN KEY ("fieldId") REFERENCES "Field"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_questionSetId_fkey" FOREIGN KEY ("questionSetId") REFERENCES "QuestionSet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Exam" ADD CONSTRAINT "Exam_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Exam" ADD CONSTRAINT "Exam_questionSetId_fkey" FOREIGN KEY ("questionSetId") REFERENCES "QuestionSet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamAnswer" ADD CONSTRAINT "ExamAnswer_examId_fkey" FOREIGN KEY ("examId") REFERENCES "Exam"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamAnswer" ADD CONSTRAINT "ExamAnswer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Deck" ADD CONSTRAINT "Deck_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Deck" ADD CONSTRAINT "Deck_fieldId_fkey" FOREIGN KEY ("fieldId") REFERENCES "Field"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Deck" ADD CONSTRAINT "Deck_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Deck" ADD CONSTRAINT "Deck_questionSetId_fkey" FOREIGN KEY ("questionSetId") REFERENCES "QuestionSet"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Card" ADD CONSTRAINT "Card_deckId_fkey" FOREIGN KEY ("deckId") REFERENCES "Deck"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CardReview" ADD CONSTRAINT "CardReview_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "Card"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CardReview" ADD CONSTRAINT "CardReview_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeagueGroup" ADD CONSTRAINT "LeagueGroup_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "LeagueSeason"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeagueGroup" ADD CONSTRAINT "LeagueGroup_leagueId_fkey" FOREIGN KEY ("leagueId") REFERENCES "League"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeagueMember" ADD CONSTRAINT "LeagueMember_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "LeagueGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeagueMember" ADD CONSTRAINT "LeagueMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeachingSession" ADD CONSTRAINT "TeachingSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeachingSession" ADD CONSTRAINT "TeachingSession_fieldId_fkey" FOREIGN KEY ("fieldId") REFERENCES "Field"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeachingSession" ADD CONSTRAINT "TeachingSession_questionSetId_fkey" FOREIGN KEY ("questionSetId") REFERENCES "QuestionSet"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeachingMessage" ADD CONSTRAINT "TeachingMessage_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "TeachingSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeachingReport" ADD CONSTRAINT "TeachingReport_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "TeachingSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeedbackReport" ADD CONSTRAINT "FeedbackReport_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recommendation" ADD CONSTRAINT "Recommendation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GrowthSnapshot" ADD CONSTRAINT "GrowthSnapshot_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WeakPoint" ADD CONSTRAINT "WeakPoint_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WeakPoint" ADD CONSTRAINT "WeakPoint_fieldId_fkey" FOREIGN KEY ("fieldId") REFERENCES "Field"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyActivity" ADD CONSTRAINT "DailyActivity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Memo" ADD CONSTRAINT "Memo_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MemoAnswer" ADD CONSTRAINT "MemoAnswer_memoId_fkey" FOREIGN KEY ("memoId") REFERENCES "Memo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TopicToWeakPoint" ADD CONSTRAINT "_TopicToWeakPoint_A_fkey" FOREIGN KEY ("A") REFERENCES "Topic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TopicToWeakPoint" ADD CONSTRAINT "_TopicToWeakPoint_B_fkey" FOREIGN KEY ("B") REFERENCES "WeakPoint"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_QuestionSetToTopic" ADD CONSTRAINT "_QuestionSetToTopic_A_fkey" FOREIGN KEY ("A") REFERENCES "QuestionSet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_QuestionSetToTopic" ADD CONSTRAINT "_QuestionSetToTopic_B_fkey" FOREIGN KEY ("B") REFERENCES "Topic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TeachingSessionToTopic" ADD CONSTRAINT "_TeachingSessionToTopic_A_fkey" FOREIGN KEY ("A") REFERENCES "TeachingSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TeachingSessionToTopic" ADD CONSTRAINT "_TeachingSessionToTopic_B_fkey" FOREIGN KEY ("B") REFERENCES "Topic"("id") ON DELETE CASCADE ON UPDATE CASCADE;
