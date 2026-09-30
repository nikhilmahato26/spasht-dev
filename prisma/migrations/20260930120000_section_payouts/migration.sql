-- CreateTable
CREATE TABLE "SectionPayout" (
    "id" TEXT NOT NULL,
    "dealId" TEXT NOT NULL,
    "team" "MemberType" NOT NULL,
    "amount" INTEGER NOT NULL,
    "note" TEXT,
    "method" TEXT,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SectionPayout_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SectionPayout_dealId_idx" ON "SectionPayout"("dealId");

-- AddForeignKey
ALTER TABLE "SectionPayout" ADD CONSTRAINT "SectionPayout_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES "Deal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SectionPayout" ADD CONSTRAINT "SectionPayout_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

