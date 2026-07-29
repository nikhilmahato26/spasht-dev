import { db as prisma } from '../src/lib/db';
import { computeDealSplit, computeAssignmentAmount } from '../src/lib/deal-calc';

async function main() {
  const users = await prisma.user.findMany();
  
  for (const user of users) {
    const userId = user.id;
    const [assignments, payouts] = await Promise.all([
      prisma.dealAssignment.findMany({
        where: { userId },
        include: { deal: { include: { client: true } }, user: true },
        orderBy: { deal: { createdAt: "desc" } },
      }),
      prisma.payout.findMany({ where: { userId }, orderBy: { date: "desc" } }),
    ]);

    let entitled = 0;
    for (const a of assignments) {
      const split = computeDealSplit({
        totalPrice: a.deal.totalPrice,
        fixedCosts: a.deal.fixedCosts,
        marketingPercent: a.deal.marketingPercent,
        devPoolPercent: a.deal.devPoolPercent,
      });
      const amount = computeAssignmentAmount(split.netEarning, a.allocationPercent);
      entitled += amount;
    }

    const paid = payouts.reduce((sum, p) => sum + p.amount, 0);
    const due = Math.max(0, entitled - paid);

    if (due > 0) {
      console.log(`User ${user.name} (${user.id}) has due amount ${due}. Creating payout...`);
      await prisma.payout.create({
        data: {
          userId,
          amount: due,
          note: "System clear dues",
          method: "System Adjustment"
        }
      });
      console.log(`Cleared due for ${user.name}.`);
    } else {
      console.log(`User ${user.name} has no due amount.`);
    }
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
