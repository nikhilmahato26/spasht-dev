import 'dotenv/config';
import { db as prisma } from '../src/lib/db';

async function main() {
  console.log("Altering enum DealStatus to add CANCELLED...");
  try {
    await prisma.$executeRawUnsafe(`ALTER TYPE "DealStatus" ADD VALUE 'CANCELLED'`);
    console.log("Added CANCELLED to DealStatus successfully.");
  } catch (e: any) {
    if (e.message?.includes("already exists")) {
      console.log("CANCELLED already exists in DealStatus enum.");
    } else {
      throw e;
    }
  }

  console.log("Migrating deals with status CLOSED to CANCELLED...");
  const result = await prisma.$executeRawUnsafe(`
    UPDATE "Deal"
    SET "status" = 'CANCELLED'
    WHERE "status" = 'CLOSED'
  `);
  console.log(`Updated ${result} deals from CLOSED to CANCELLED.`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
    process.exit(0);
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
