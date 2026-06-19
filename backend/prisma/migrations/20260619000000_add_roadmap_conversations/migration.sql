CREATE TABLE "RoadmapConversation" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "roadmapId" TEXT,
    "title" TEXT NOT NULL,
    "goal" TEXT,
    "skills" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "targetCompany" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RoadmapConversation_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "RoadmapMessage" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "model" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RoadmapMessage_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "RoadmapConversation_userId_updatedAt_idx" ON "RoadmapConversation"("userId", "updatedAt");
CREATE INDEX "RoadmapMessage_conversationId_createdAt_idx" ON "RoadmapMessage"("conversationId", "createdAt");

ALTER TABLE "RoadmapConversation"
ADD CONSTRAINT "RoadmapConversation_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "RoadmapConversation"
ADD CONSTRAINT "RoadmapConversation_roadmapId_fkey"
FOREIGN KEY ("roadmapId") REFERENCES "Roadmap"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "RoadmapMessage"
ADD CONSTRAINT "RoadmapMessage_conversationId_fkey"
FOREIGN KEY ("conversationId") REFERENCES "RoadmapConversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
