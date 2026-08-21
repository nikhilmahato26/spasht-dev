import 'dotenv/config';
import { db as prisma } from '../src/lib/db';

async function main() {
  console.log("Adding column previewImage to Deal table...");
  await prisma.$executeRawUnsafe(`ALTER TABLE "Deal" ADD COLUMN IF NOT EXISTS "previewImage" TEXT;`);
  console.log("Column previewImage added successfully!");
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
