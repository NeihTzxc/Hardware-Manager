-- AlterTable
ALTER TABLE "Assignment" ADD COLUMN     "conditionAfter" "DeviceCondition",
ADD COLUMN     "conditionBefore" "DeviceCondition" NOT NULL DEFAULT 'GOOD';
