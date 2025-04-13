/*
  Warnings:

  - You are about to drop the column `allergens` on the `food_donations` table. All the data in the column will be lost.
  - You are about to drop the column `dietary_restrictions` on the `food_donations` table. All the data in the column will be lost.
  - You are about to drop the column `temperature` on the `food_donations` table. All the data in the column will be lost.
  - You are about to drop the column `unit` on the `food_donations` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "food_donations" DROP COLUMN "allergens",
DROP COLUMN "dietary_restrictions",
DROP COLUMN "temperature",
DROP COLUMN "unit";
