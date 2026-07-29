import { db as prisma } from '../src/lib/db';
import { recalcDue } from '../src/lib/deals-data';

async function main() {
  const deals = await prisma.deal.findMany({
    where: { dueMoney: 0, totalPrice: { gt: 0 } },
  });

  console.log(`Found ${deals.length} fully paid deals. Processing payouts...`);

  // We need an admin user ID for the audit logs, or just a placeholder if it allows non-existent IDs.
  // Let's find an admin user.
  const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
  const actorId = admin ? admin.id : "system_backfill";

  for (const deal of deals) {
    console.log(`Recalculating and triggering auto-payout for deal ${deal.id} (${deal.projectName})`);
    await recalcDue(deal.id, actorId);
  }
  
  console.log('Backfill complete.');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
