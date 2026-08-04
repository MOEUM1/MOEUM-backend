/*
  Warnings:

  - You are about to drop the `character` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `characterLevel` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `studyHistory` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "GameType" AS ENUM ('CARD', 'QUIZ', 'CHAT');

-- DropForeignKey
ALTER TABLE "character" DROP CONSTRAINT "character_userId_fkey";

-- DropForeignKey
ALTER TABLE "characterLevel" DROP CONSTRAINT "characterLevel_characterId_fkey";

-- DropForeignKey
ALTER TABLE "studyHistory" DROP CONSTRAINT "studyHistory_userId_fkey";

-- DropTable
DROP TABLE "character";

-- DropTable
DROP TABLE "characterLevel";

-- DropTable
DROP TABLE "studyHistory";

-- DropEnum
DROP TYPE "StudyType";

-- CreateTable
CREATE TABLE "UserStreak" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "lastDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserStreak_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Character" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT '',
    "description" TEXT NOT NULL DEFAULT '',
    "imageUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Character_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CharacterLevel" (
    "id" TEXT NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 1,
    "exp" INTEGER NOT NULL DEFAULT 0,
    "totalExp" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "characterId" TEXT NOT NULL,

    CONSTRAINT "CharacterLevel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudyHistory" (
    "id" TEXT NOT NULL,
    "type" "GameType" NOT NULL,
    "userId" TEXT NOT NULL,
    "question" JSONB,
    "result" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudyHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserStreak_userId_key" ON "UserStreak"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Character_userId_key" ON "Character"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "CharacterLevel_characterId_key" ON "CharacterLevel"("characterId");

-- CreateIndex
CREATE INDEX "StudyHistory_userId_createdAt_idx" ON "StudyHistory"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "UserStreak" ADD CONSTRAINT "UserStreak_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Character" ADD CONSTRAINT "Character_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CharacterLevel" ADD CONSTRAINT "CharacterLevel_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudyHistory" ADD CONSTRAINT "StudyHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
