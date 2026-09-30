-- CreateEnum
CREATE TYPE "Permission" AS ENUM ('DEALS_VIEW', 'DEALS_MANAGE', 'CLIENTS_MANAGE', 'CATEGORIES_MANAGE', 'EXPENSES_VIEW', 'DEV_PROJECTS');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "permissions" "Permission"[] DEFAULT ARRAY['DEALS_VIEW', 'DEALS_MANAGE', 'CLIENTS_MANAGE', 'CATEGORIES_MANAGE', 'EXPENSES_VIEW']::"Permission"[];


-- Dev Projects access used to be implied by being on the Dev team; carry that over.
UPDATE "User" SET "permissions" = array_append("permissions", 'DEV_PROJECTS'::"Permission") WHERE "type" = 'DEV';
