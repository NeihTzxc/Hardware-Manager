-- AlterTable
ALTER TABLE "SslCertificate" ADD COLUMN     "domainName" TEXT,
ALTER COLUMN "domainId" DROP NOT NULL;
