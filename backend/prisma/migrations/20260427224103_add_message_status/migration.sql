-- CreateEnum
CREATE TYPE "MessageStatus" AS ENUM ('SENT', 'DELIVERED', 'SEEN');

-- AlterTable
ALTER TABLE "messages" ADD COLUMN     "status" "MessageStatus" NOT NULL DEFAULT 'SENT';

-- CreateIndex
CREATE INDEX "messages_status_idx" ON "messages"("status");
