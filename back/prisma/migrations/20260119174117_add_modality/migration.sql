/*
  Warnings:

  - Added the required column `modality` to the `Exam` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ExamModality" AS ENUM ('CR', 'CT', 'DX', 'MG', 'MR', 'NM', 'OT', 'PT', 'RF', 'US', 'XA');

-- AlterTable
ALTER TABLE "Exam" ADD COLUMN     "modality" "ExamModality" NOT NULL;
