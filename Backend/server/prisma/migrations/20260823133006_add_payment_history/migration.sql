-- CreateTable
CREATE TABLE "public"."PaymentHistory" (
    "id" TEXT NOT NULL,
    "shopName" TEXT NOT NULL,
    "ownerName" TEXT,
    "billNumber" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "billDate" TIMESTAMP(3) NOT NULL,
    "paidAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PaymentHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PaymentHistory_paidAt_idx" ON "public"."PaymentHistory"("paidAt");
