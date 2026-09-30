import { db } from "@/lib/db";
import { computeDealSplit } from "@/lib/deal-calc";
import type { MemberType } from "@/generated/prisma/client";

export type ClientSearchResult = {
  id: string;
  name: string;
  company: string | null;
  email: string | null;
  phone: string | null;
  dealCount: number;
  totalRevenue: number;
  totalInflow: number;
  totalDue: number;
  devPayouts: number;
  marketingPayouts: number;
  totalPayouts: number;
  netRetained: number;
};

export async function searchClientsWithPayoutStats(query?: string): Promise<ClientSearchResult[]> {
  const q = query?.trim().toLowerCase();

  const clients = await db.client.findMany({
    where: q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { company: { contains: q, mode: "insensitive" } },
            { email: { contains: q, mode: "insensitive" } },
            { phone: { contains: q, mode: "insensitive" } },
          ],
        }
      : {},
    orderBy: { name: "asc" },
    include: {
      deals: {
        include: {
          payments: { select: { amount: true } },
          costItems: { select: { amount: true } },
          sectionPayouts: { select: { amount: true, team: true } },
        },
      },
    },
  });

  return clients.map((client) => {
    let totalRevenue = 0;
    let totalInflow = 0;
    let totalDue = 0;
    let totalCosts = 0;
    let devPayouts = 0;
    let marketingPayouts = 0;

    for (const deal of client.deals) {
      totalRevenue += deal.totalPrice;
      totalDue += deal.dueMoney;

      const paymentsTotal = deal.payments.reduce((s, p) => s + p.amount, 0);
      totalInflow += deal.advanceReceived + paymentsTotal;

      totalCosts += deal.costItems.reduce((s, c) => s + c.amount, 0) + deal.fixedCosts;

      for (const p of deal.sectionPayouts) {
        if (p.team === "DEV") {
          devPayouts += p.amount;
        } else if (p.team === "MARKETING") {
          marketingPayouts += p.amount;
        }
      }
    }

    const totalPayouts = devPayouts + marketingPayouts;
    const netRetained = totalInflow - (totalPayouts + totalCosts);

    return {
      id: client.id,
      name: client.name,
      company: client.company,
      email: client.email,
      phone: client.phone,
      dealCount: client.deals.length,
      totalRevenue,
      totalInflow,
      totalDue,
      devPayouts,
      marketingPayouts,
      totalPayouts,
      netRetained,
    };
  });
}

export type ProvenanceInfo = {
  userName: string;
  userEmail: string;
  userRole: string;
  timestamp: Date;
};

export type EnrichedPayment = {
  id: string;
  dealId: string;
  amount: number;
  method: string | null;
  note: string | null;
  date: Date;
  createdAt: Date;
  enteredBy: ProvenanceInfo;
};

export type EnrichedCostItem = {
  id: string;
  dealId: string | null;
  label: string;
  amount: number;
  team?: MemberType | null;
  isRecurring: boolean;
  createdAt: Date;
  enteredBy: ProvenanceInfo;
};

export type EnrichedPayout = {
  id: string;
  dealId: string;
  team: MemberType;
  amount: number;
  method: string | null;
  note: string | null;
  date: Date;
  createdAt: Date;
  authorizedBy: ProvenanceInfo;
};

export type SectionBalance = {
  entitled: number;
  paid: number;
  due: number;
};

export type EnrichedDealTree = {
  id: string;
  projectName: string;
  status: string;
  totalPrice: number;
  fixedCosts: number;
  marketingPercent: number;
  devPoolPercent: number;
  advanceReceived: number;
  dueMoney: number;
  createdAt: Date;
  createdBy: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  closedBy?: {
    id: string;
    name: string;
    email: string;
  } | null;
  split: {
    costs: number;
    marketing: number;
    devPool: number;
    netEarning: number;
  };
  payments: EnrichedPayment[];
  costItems: EnrichedCostItem[];
  devPayouts: EnrichedPayout[];
  marketingPayouts: EnrichedPayout[];
  sections: {
    DEV: SectionBalance;
    MARKETING: SectionBalance;
  };
  totals: {
    inflow: number;
    costs: number;
    devPaid: number;
    marketingPaid: number;
    totalPaidOut: number;
    netMargin: number;
  };
};

export async function getClientLedgerData(clientId: string) {
  const client = await db.client.findUnique({
    where: { id: clientId },
    include: {
      deals: {
        orderBy: { createdAt: "desc" },
        include: {
          category: true,
          createdBy: { select: { id: true, name: true, email: true, role: true } },
          closedBy: { select: { id: true, name: true, email: true } },
          payments: { orderBy: { createdAt: "desc" } },
          costItems: { orderBy: { createdAt: "desc" } },
          sectionPayouts: {
            orderBy: { createdAt: "desc" },
            include: {
              createdBy: { select: { name: true, email: true, role: true } },
            },
          },
        },
      },
    },
  });

  if (!client) return null;

  const dealIds = client.deals.map((d) => d.id);

  // Fetch relevant audit logs for complete provenance attribution
  const auditLogs = await db.auditLog.findMany({
    where: {
      OR: [
        { entityType: "Deal", entityId: { in: dealIds } },
        { entityType: "Client", entityId: clientId },
        { action: { in: ["payment.create", "costItem.create"] } },
      ],
    },
    include: {
      user: { select: { id: true, name: true, email: true, role: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 300,
  });

  // Helper to find closest audit log author
  const findAuditAuthor = (
    predicate: (log: (typeof auditLogs)[number]) => boolean,
    fallbackUser: { name: string; email: string; role: string },
    defaultTimestamp: Date
  ): ProvenanceInfo => {
    const matched = auditLogs.find(predicate);
    if (matched && matched.user) {
      return {
        userName: matched.user.name,
        userEmail: matched.user.email,
        userRole: matched.user.role,
        timestamp: matched.createdAt,
      };
    }
    return {
      userName: fallbackUser.name,
      userEmail: fallbackUser.email,
      userRole: fallbackUser.role,
      timestamp: defaultTimestamp,
    };
  };

  // Build enriched tree per deal
  const enrichedDeals: EnrichedDealTree[] = client.deals.map((deal) => {
    const split = computeDealSplit(deal);

    // Enriched Payments
    const payments: EnrichedPayment[] = deal.payments.map((p) => {
      const enteredBy = findAuditAuthor(
        (log) =>
          log.entityId === p.id ||
          (log.action === "payment.create" &&
            log.entityId === deal.id &&
            Math.abs(log.createdAt.getTime() - p.createdAt.getTime()) < 60000),
        deal.createdBy,
        p.createdAt
      );

      return {
        ...p,
        enteredBy,
      };
    });

    // Enriched CostItems
    const costItems: EnrichedCostItem[] = deal.costItems.map((c) => {
      const enteredBy = findAuditAuthor(
        (log) =>
          log.entityId === c.id ||
          (log.action === "costItem.create" &&
            log.entityId === deal.id &&
            Math.abs(log.createdAt.getTime() - c.createdAt.getTime()) < 60000),
        deal.createdBy,
        c.createdAt
      );

      return {
        ...c,
        enteredBy,
      };
    });

    // Section payouts — recorded against the Dev or Marketing pool as a whole
    const devPayouts: EnrichedPayout[] = [];
    const marketingPayouts: EnrichedPayout[] = [];

    for (const payout of deal.sectionPayouts) {
      const enriched: EnrichedPayout = {
        id: payout.id,
        dealId: payout.dealId,
        team: payout.team,
        amount: payout.amount,
        method: payout.method,
        note: payout.note,
        date: payout.date,
        createdAt: payout.createdAt,
        authorizedBy: {
          userName: payout.createdBy.name,
          userEmail: payout.createdBy.email,
          userRole: payout.createdBy.role,
          timestamp: payout.createdAt,
        },
      };

      if (payout.team === "DEV") {
        devPayouts.push(enriched);
      } else {
        marketingPayouts.push(enriched);
      }
    }

    const inflow = deal.advanceReceived + payments.reduce((s, p) => s + p.amount, 0);
    const costsTotal = costItems.reduce((s, c) => s + c.amount, 0) + deal.fixedCosts;
    const devPaid = devPayouts.reduce((s, p) => s + p.amount, 0);
    const marketingPaid = marketingPayouts.reduce((s, p) => s + p.amount, 0);
    const totalPaidOut = devPaid + marketingPaid;
    const netMargin = inflow - (costsTotal + totalPaidOut);

    const sectionBalance = (entitled: number, paid: number): SectionBalance => ({
      entitled,
      paid,
      due: Math.max(0, entitled - paid),
    });

    return {
      id: deal.id,
      projectName: deal.projectName,
      status: deal.status,
      totalPrice: deal.totalPrice,
      fixedCosts: deal.fixedCosts,
      marketingPercent: deal.marketingPercent,
      devPoolPercent: deal.devPoolPercent,
      advanceReceived: deal.advanceReceived,
      dueMoney: deal.dueMoney,
      createdAt: deal.createdAt,
      createdBy: deal.createdBy,
      closedBy: deal.closedBy,
      split,
      payments,
      costItems,
      devPayouts,
      marketingPayouts,
      sections: {
        DEV: sectionBalance(split.devPool, devPaid),
        MARKETING: sectionBalance(split.marketing, marketingPaid),
      },
      totals: {
        inflow,
        costs: costsTotal,
        devPaid,
        marketingPaid,
        totalPaidOut,
        netMargin,
      },
    };
  });

  // Client-level aggregate rollups
  let totalRevenue = 0;
  let totalInflow = 0;
  let totalDue = 0;
  let totalCosts = 0;
  let totalDevPaid = 0;
  let totalMarketingPaid = 0;

  for (const deal of enrichedDeals) {
    totalRevenue += deal.totalPrice;
    totalDue += deal.dueMoney;
    totalInflow += deal.totals.inflow;
    totalCosts += deal.totals.costs;
    totalDevPaid += deal.totals.devPaid;
    totalMarketingPaid += deal.totals.marketingPaid;
  }

  const totalPayouts = totalDevPaid + totalMarketingPaid;
  const netClientMargin = totalInflow - (totalCosts + totalPayouts);

  return {
    client: {
      id: client.id,
      name: client.name,
      company: client.company,
      email: client.email,
      phone: client.phone,
      address: client.address,
      notes: client.notes,
      createdAt: client.createdAt,
    },
    deals: enrichedDeals,
    totals: {
      dealCount: enrichedDeals.length,
      totalRevenue,
      totalInflow,
      totalDue,
      totalCosts,
      totalDevPaid,
      totalMarketingPaid,
      totalPayouts,
      netClientMargin,
    },
  };
}

export type GlobalPayoutLedgerRow = {
  id: string;
  amount: number;
  date: Date;
  createdAt: Date;
  method: string | null;
  note: string | null;
  team: MemberType;
  deal: {
    id: string;
    projectName: string;
    client: {
      id: string;
      name: string;
      company: string | null;
      email: string | null;
    };
  };
  authorizedBy: ProvenanceInfo;
};

export type GlobalPayoutsLedgerResult = {
  payouts: GlobalPayoutLedgerRow[];
  totalCount: number;
  totalAmount: number;
  devTotal: number;
  marketingTotal: number;
};

export async function getTotalPayoutsCount(): Promise<number> {
  return db.sectionPayout.count();
}

// Only section-level (Dev / Marketing) payouts — individual team-member
// payouts live on the team pages and are deliberately excluded here.
export async function getAllPayoutsLedger(query?: string): Promise<GlobalPayoutsLedgerResult> {
  const q = query?.trim().toLowerCase();

  const teamMatch = (["DEV", "MARKETING"] as const).filter((t) => q && t.toLowerCase().includes(q));

  const payouts = await db.sectionPayout.findMany({
    where: q
      ? {
          OR: [
            ...(teamMatch.length > 0 ? [{ team: { in: [...teamMatch] } }] : []),
            { deal: { projectName: { contains: q, mode: "insensitive" } } },
            { deal: { client: { name: { contains: q, mode: "insensitive" } } } },
            { deal: { client: { company: { contains: q, mode: "insensitive" } } } },
            { note: { contains: q, mode: "insensitive" } },
            { method: { contains: q, mode: "insensitive" } },
          ],
        }
      : {},
    include: {
      createdBy: { select: { name: true, email: true, role: true } },
      deal: {
        select: {
          id: true,
          projectName: true,
          client: {
            select: {
              id: true,
              name: true,
              company: true,
              email: true,
            },
          },
        },
      },
    },
    orderBy: [
      { date: "desc" },
      { createdAt: "desc" },
    ],
  });

  let totalAmount = 0;
  let devTotal = 0;
  let marketingTotal = 0;

  const rows: GlobalPayoutLedgerRow[] = payouts.map((payout) => {
    totalAmount += payout.amount;
    if (payout.team === "DEV") {
      devTotal += payout.amount;
    } else if (payout.team === "MARKETING") {
      marketingTotal += payout.amount;
    }

    return {
      id: payout.id,
      amount: payout.amount,
      date: payout.date,
      createdAt: payout.createdAt,
      method: payout.method,
      note: payout.note,
      team: payout.team,
      deal: payout.deal,
      authorizedBy: {
        userName: payout.createdBy.name,
        userEmail: payout.createdBy.email,
        userRole: payout.createdBy.role,
        timestamp: payout.createdAt,
      },
    };
  });

  return {
    payouts: rows,
    totalCount: rows.length,
    totalAmount,
    devTotal,
    marketingTotal,
  };
}
