-- CreateEnum
CREATE TYPE "Unit" AS ENUM ('servings', 'pounds', 'boxes', 'items');

-- CreateEnum
CREATE TYPE "Category" AS ENUM ('prepared_meals', 'fresh_produce', 'canned_goods', 'bakery', 'dairy', 'meat', 'other');

-- CreateEnum
CREATE TYPE "DietaryRestriction" AS ENUM ('vegetarian', 'vegan', 'gluten_free', 'nut_free', 'dairy_free', 'kosher', 'halal', 'none');

-- CreateEnum
CREATE TYPE "Allergen" AS ENUM ('peanuts', 'tree_nuts', 'milk', 'eggs', 'fish', 'shellfish', 'soy', 'wheat', 'none');

-- CreateEnum
CREATE TYPE "DonationStatus" AS ENUM ('available', 'claimed', 'completed');

-- CreateEnum
CREATE TYPE "Temperature" AS ENUM ('frozen', 'refrigerated', 'room_temperature');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "food_donations" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "image_url" TEXT,
    "quantity" DOUBLE PRECISION NOT NULL,
    "unit" "Unit" NOT NULL DEFAULT 'servings',
    "expiry_date" TIMESTAMP(3) NOT NULL,
    "pickup_address" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "pickup_instructions" TEXT,
    "category" "Category" NOT NULL,
    "dietary_restrictions" "DietaryRestriction"[],
    "allergens" "Allergen"[],
    "status" "DonationStatus" NOT NULL DEFAULT 'available',
    "claimed_by" TEXT,
    "dietary_notes" TEXT,
    "temperature" "Temperature",

    CONSTRAINT "food_donations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
