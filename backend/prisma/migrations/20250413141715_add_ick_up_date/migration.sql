/*
  Warnings:

  - Added the required column `pickupDate` to the `food_donations` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "food_donations" ADD COLUMN     "pickupDate" TIMESTAMP(3) NOT NULL;
