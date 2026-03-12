-- CreateTable
CREATE TABLE "AssignmentDocument" (
    "id" TEXT NOT NULL,
    "assignmentId" TEXT NOT NULL,
    "templateId" TEXT,
    "name" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AssignmentDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PrintTemplate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "content" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PrintTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AssignmentDocument_assignmentId_idx" ON "AssignmentDocument"("assignmentId");

-- CreateIndex
CREATE INDEX "AssignmentDocument_templateId_idx" ON "AssignmentDocument"("templateId");

-- CreateIndex
CREATE UNIQUE INDEX "PrintTemplate_name_key" ON "PrintTemplate"("name");

-- AddForeignKey
ALTER TABLE "AssignmentDocument" ADD CONSTRAINT "AssignmentDocument_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "Assignment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssignmentDocument" ADD CONSTRAINT "AssignmentDocument_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "PrintTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;
