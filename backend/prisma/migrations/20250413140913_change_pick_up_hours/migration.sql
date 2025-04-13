/*
  Warnings:

  - You are about to drop the column `expiry_date` on the `food_donations` table. All the data in the column will be lost.
  - You are about to drop the column `pickup_address` on the `food_donations` table. All the data in the column will be lost.
  - You are about to drop the column `pickup_instructions` on the `food_donations` table. All the data in the column will be lost.
  - You are about to drop the column `quantity` on the `food_donations` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `food_donations` table. All the data in the column will be lost.
  - Added the required column `amount` to the `food_donations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `expirationDate` to the `food_donations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `product_name` to the `food_donations` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "food_donations" DROP COLUMN "expiry_date",
DROP COLUMN "pickup_address",
DROP COLUMN "pickup_instructions",
DROP COLUMN "quantity",
DROP COLUMN "title",
ADD COLUMN     "amount" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "expirationDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "pickup_hours" TEXT,
ADD COLUMN     "product_name" TEXT NOT NULL;
