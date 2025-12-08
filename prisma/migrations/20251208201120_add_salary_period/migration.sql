-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Job" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "locationType" TEXT NOT NULL DEFAULT 'onsite',
    "employmentType" TEXT NOT NULL DEFAULT 'full-time',
    "experienceLevel" TEXT NOT NULL DEFAULT 'mid',
    "salaryMin" INTEGER,
    "salaryMax" INTEGER,
    "salaryCurrency" TEXT NOT NULL DEFAULT 'EUR',
    "salaryPeriod" TEXT NOT NULL DEFAULT 'monthly',
    "requirements" TEXT,
    "responsibilities" TEXT,
    "benefits" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "companyId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "expiresAt" DATETIME,
    CONSTRAINT "Job_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Job" ("benefits", "category", "companyId", "createdAt", "description", "employmentType", "experienceLevel", "expiresAt", "id", "location", "locationType", "requirements", "responsibilities", "salaryCurrency", "salaryMax", "salaryMin", "status", "title", "updatedAt") SELECT "benefits", "category", "companyId", "createdAt", "description", "employmentType", "experienceLevel", "expiresAt", "id", "location", "locationType", "requirements", "responsibilities", "salaryCurrency", "salaryMax", "salaryMin", "status", "title", "updatedAt" FROM "Job";
DROP TABLE "Job";
ALTER TABLE "new_Job" RENAME TO "Job";
CREATE INDEX "Job_companyId_idx" ON "Job"("companyId");
CREATE INDEX "Job_status_idx" ON "Job"("status");
CREATE INDEX "Job_category_idx" ON "Job"("category");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
