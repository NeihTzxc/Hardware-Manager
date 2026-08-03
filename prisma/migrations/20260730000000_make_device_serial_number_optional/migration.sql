-- Allow devices whose serial number is missing or unreadable.
ALTER TABLE "Device" ALTER COLUMN "serialNumber" DROP NOT NULL;
