-- CreateTable
CREATE TABLE "public"."SalesArchive" (
    "id" TEXT NOT NULL,
    "billId" TEXT NOT NULL,
    "categoryId" TEXT,
    "categoryName" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "billDate" TIMESTAMP(3) NOT NULL,
    "archivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SalesArchive_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SalesArchive_billDate_idx" ON "public"."SalesArchive"("billDate");

-- CreateIndex
CREATE INDEX "SalesArchive_categoryId_idx" ON "public"."SalesArchive"("categoryId");
