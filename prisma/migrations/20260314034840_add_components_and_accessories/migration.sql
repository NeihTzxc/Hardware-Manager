-- CreateEnum
CREATE TYPE "CategoryType" AS ENUM ('DEVICE', 'COMPONENT', 'ACCESSORY');

-- CreateEnum
CREATE TYPE "ComponentStatus" AS ENUM ('AVAILABLE', 'INSTALLED', 'DEFECTIVE', 'DISPOSED');

-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "type" "CategoryType" NOT NULL DEFAULT 'DEVICE';

-- CreateTable
CREATE TABLE "Component" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "serialNumber" TEXT,
    "categoryId" TEXT NOT NULL,
    "manufacturer" TEXT,
    "status" "ComponentStatus" NOT NULL DEFAULT 'AVAILABLE',
    "purchaseDate" TIMESTAMP(3),
    "purchasePrice" DOUBLE PRECISION,
    "warrantyExpiry" TIMESTAMP(3),
    "notes" TEXT,
    "supplierId" TEXT,
    "locationId" TEXT,
    "deviceId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Component_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ComponentInstallation" (
    "id" TEXT NOT NULL,
    "componentId" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "installedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "removedAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ComponentInstallation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Accessory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "manufacturer" TEXT,
    "totalQuantity" INTEGER NOT NULL DEFAULT 0,
    "minQuantity" INTEGER NOT NULL DEFAULT 0,
    "unitPrice" DOUBLE PRECISION,
    "notes" TEXT,
    "supplierId" TEXT,
    "locationId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Accessory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AccessoryCheckout" (
    "id" TEXT NOT NULL,
    "accessoryId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "checkedOutAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "returnedAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AccessoryCheckout_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Component_categoryId_idx" ON "Component"("categoryId");

-- CreateIndex
CREATE INDEX "Component_supplierId_idx" ON "Component"("supplierId");

-- CreateIndex
CREATE INDEX "Component_locationId_idx" ON "Component"("locationId");

-- CreateIndex
CREATE INDEX "Component_deviceId_idx" ON "Component"("deviceId");

-- CreateIndex
CREATE INDEX "Component_status_idx" ON "Component"("status");

-- CreateIndex
CREATE INDEX "ComponentInstallation_componentId_idx" ON "ComponentInstallation"("componentId");

-- CreateIndex
CREATE INDEX "ComponentInstallation_deviceId_idx" ON "ComponentInstallation"("deviceId");

-- CreateIndex
CREATE INDEX "Accessory_categoryId_idx" ON "Accessory"("categoryId");

-- CreateIndex
CREATE INDEX "Accessory_supplierId_idx" ON "Accessory"("supplierId");

-- CreateIndex
CREATE INDEX "Accessory_locationId_idx" ON "Accessory"("locationId");

-- CreateIndex
CREATE INDEX "AccessoryCheckout_accessoryId_idx" ON "AccessoryCheckout"("accessoryId");

-- CreateIndex
CREATE INDEX "AccessoryCheckout_userId_idx" ON "AccessoryCheckout"("userId");

-- AddForeignKey
ALTER TABLE "Component" ADD CONSTRAINT "Component_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Component" ADD CONSTRAINT "Component_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Component" ADD CONSTRAINT "Component_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Component" ADD CONSTRAINT "Component_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "Device"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComponentInstallation" ADD CONSTRAINT "ComponentInstallation_componentId_fkey" FOREIGN KEY ("componentId") REFERENCES "Component"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComponentInstallation" ADD CONSTRAINT "ComponentInstallation_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "Device"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Accessory" ADD CONSTRAINT "Accessory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Accessory" ADD CONSTRAINT "Accessory_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Accessory" ADD CONSTRAINT "Accessory_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccessoryCheckout" ADD CONSTRAINT "AccessoryCheckout_accessoryId_fkey" FOREIGN KEY ("accessoryId") REFERENCES "Accessory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccessoryCheckout" ADD CONSTRAINT "AccessoryCheckout_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
