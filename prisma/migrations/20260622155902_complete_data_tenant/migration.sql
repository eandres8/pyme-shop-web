/*
  Warnings:

  - Added the required column `address` to the `tenants` table without a default value. This is not possible if the table is not empty.
  - Added the required column `phone` to the `tenants` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "tenants" ADD COLUMN     "address" TEXT NOT NULL,
ADD COLUMN     "phone" TEXT NOT NULL;
