-- CreateEnum
CREATE TYPE "PortfolioStrategy" AS ENUM ('COURT_TERME', 'LONG_TERME', 'RETRAITE', 'EPARGNE', 'AUTRE');

-- AlterTable NamedPortfolio: add strategy column
ALTER TABLE "NamedPortfolio" ADD COLUMN "strategy" "PortfolioStrategy" NOT NULL DEFAULT 'AUTRE';

-- AlterTable PortfolioHolding: add notes column
ALTER TABLE "PortfolioHolding" ADD COLUMN "notes" TEXT;
