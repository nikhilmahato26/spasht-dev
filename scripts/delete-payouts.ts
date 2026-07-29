import { db as prisma } from '../src/lib/db';

async function main() {
  const result = await prisma.payout.deleteMany();
  console.log(`Deleted ${result.count} payouts.`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
