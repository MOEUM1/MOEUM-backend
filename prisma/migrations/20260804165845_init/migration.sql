-- CreateTable
CREATE TABLE "AIConversation" (
    "id" TEXT NOT NULL,
    "StudyHistoryId" TEXT NOT NULL,
    "conversationId" TEXT,
    "messages" JSONB,

    CONSTRAINT "AIConversation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AIConversation_StudyHistoryId_key" ON "AIConversation"("StudyHistoryId");

-- AddForeignKey
ALTER TABLE "AIConversation" ADD CONSTRAINT "AIConversation_StudyHistoryId_fkey" FOREIGN KEY ("StudyHistoryId") REFERENCES "StudyHistory"("id") ON DELETE CASCADE ON UPDATE CASCADE;
