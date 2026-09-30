import { db } from "@/lib/db";
import { computeDealSplit, resolveAssignmentAmount } from "@/lib/deal-calc";
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
          payouts: {
            select: {
              amount: true,
              user: { select: { type: true } },
            },
          },
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

      for (const p of deal.payouts) {
        if (p.user.type === "DEV") {
          devPayouts += p.amount;
        } else if (p.user.type === "MARKETING") {
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
  userId: string;
  dealId: string | null;
  amount: number;
  method: string | null;
  note: string | null;
  date: Date;
  createdAt: Date;
  user: {
    id: string;
    name: string;
    email: string;
    type: MemberType;
    role: string;
  };
  authorizedBy: ProvenanceInfo;
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
  assignments: {
    id: string;
    userId: string;
    role: string | null;
    allocationPercent: number;
    allocationAmount: number;
    user: {
      id: string;
      name: string;
      email: string;
      type: MemberType;
      role: string;
    };
    totalPaid: number;
    dueBalance: number;
  }[];
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
          payouts: {
            orderBy: { createdAt: "desc" },
            include: {
              user: { select: { id: true, name: true, email: true, type: true, role: true } },
            },
          },
          assignments: {
            include: {
              user: { select: { id: true, name: true, email: true, type: true, role: true } },
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
        { entityType: "Payout" },
        { action: { in: ["payout.create", "payment.create", "costItem.create"] } },
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

    // Enriched Payouts
    const devPayouts: EnrichedPayout[] = [];
    const marketingPayouts: EnrichedPayout[] = [];

    for (const payout of deal.payouts) {
      const authorizedBy = findAuditAuthor(
        (log) =>
          log.entityId === payout.id ||
          (log.action === "payout.create" &&
            (log.entityId === payout.userId || log.entityId === deal.id) &&
            Math.abs(log.createdAt.getTime() - payout.createdAt.getTime()) < 60000),
        deal.createdBy,
        payout.createdAt
      );

      const enriched: EnrichedPayout = {
        ...payout,
        authorizedBy,
      };

      if (payout.user.type === "DEV") {
        devPayouts.push(enriched);
      } else {
        marketingPayouts.push(enriched);
      }
    }

    // Enriched Assignments with accurate due tracking
    const assignments = deal.assignments.map((assignment) => {
      const allocationAmount = resolveAssignmentAmount(assignment, split.netEarning);
      const totalPaid = deal.payouts
        .filter((p) => p.userId === assignment.userId)
        .reduce((sum, p) => sum + p.amount, 0);

      return {
        id: assignment.id,
        userId: assignment.userId,
        role: assignment.role,
        allocationPercent: assignment.allocationPercent,
        allocationAmount,
        user: assignment.user,
        totalPaid,
        dueBalance: Math.max(0, allocationAmount - totalPaid),
      };
    });

    const inflow = deal.advanceReceived + payments.reduce((s, p) => s + p.amount, 0);
    const costsTotal = costItems.reduce((s, c) => s + c.amount, 0) + deal.fixedCosts;
    const devPaid = devPayouts.reduce((s, p) => s + p.amount, 0);
    const marketingPaid = marketingPayouts.reduce((s, p) => s + p.amount, 0);
    const totalPaidOut = devPaid + marketingPaid;
    const netMargin = inflow - (costsTotal + totalPaidOut);

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
      assignments,
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

  // Also retrieve active team members so the admin payout form can pick team members easily
  const activeTeamMembers = await db.user.findMany({
    where: { isActive: true },
    select: {
      id: true,
      name: true,
      email: true,
      type: true,
      role: true,
    },
    orderBy: [{ type: "asc" }, { name: "asc" }],
  });

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
    activeTeamMembers,
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
  user: {
    id: string;
    name: string;
    email: string;
    type: MemberType;
    role: string;
  };
  deal: {
    id: string;
    projectName: string;
    client: {
      id: string;
      name: string;
      company: string | null;
      email: string | null;
    } | null;
  } | null;
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
  return db.payout.count();
}

export async function getAllPayoutsLedger(query?: string): Promise<GlobalPayoutsLedgerResult> {
  const q = query?.trim().toLowerCase();

  const payouts = await db.payout.findMany({
    where: q
      ? {
          OR: [
            { user: { name: { contains: q, mode: "insensitive" } } },
            { user: { email: { contains: q, mode: "insensitive" } } },
            { deal: { projectName: { contains: q, mode: "insensitive" } } },
            { deal: { client: { name: { contains: q, mode: "insensitive" } } } },
            { deal: { client: { company: { contains: q, mode: "insensitive" } } } },
            { note: { contains: q, mode: "insensitive" } },
            { method: { contains: q, mode: "insensitive" } },
          ],
        }
      : {},
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          type: true,
          role: true,
        },
      },
      deal: {
        select: {
          id: true,
          projectName: true,
          createdBy: {
            select: { id: true, name: true, email: true, role: true },
          },
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

  const payoutIds = payouts.map((p) => p.id);

  // Fetch relevant audit logs for complete provenance attribution
  const auditLogs = await db.auditLog.findMany({
    where: {
      OR: [
        { entityType: "Payout", entityId: { in: payoutIds } },
        { action: "payout.create" },
      ],
    },
    include: {
      user: { select: { id: true, name: true, email: true, role: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 500,
  });

  let totalAmount = 0;
  let devTotal = 0;
  let marketingTotal = 0;

  const rows: GlobalPayoutLedgerRow[] = payouts.map((payout) => {
    totalAmount += payout.amount;
    if (payout.user.type === "DEV") {
      devTotal += payout.amount;
    } else if (payout.user.type === "MARKETING") {
      marketingTotal += payout.amount;
    }

    const matchedLog = auditLogs.find(
      (log) =>
        log.entityId === payout.id ||
        (log.action === "payout.create" &&
          (log.entityId === payout.userId || (payout.dealId && log.entityId === payout.dealId)) &&
          Math.abs(log.createdAt.getTime() - payout.createdAt.getTime()) < 60000)
    );

    const fallbackAuthor = payout.deal?.createdBy ?? {
      name: "Admin",
      email: "admin@spasht.dev",
      role: "ADMIN",
    };

    const authorizedBy: ProvenanceInfo = matchedLog && matchedLog.user
      ? {
          userName: matchedLog.user.name,
          userEmail: matchedLog.user.email,
          userRole: matchedLog.user.role,
          timestamp: matchedLog.createdAt,
        }
      : {
          userName: fallbackAuthor.name,
          userEmail: fallbackAuthor.email,
          userRole: fallbackAuthor.role,
          timestamp: payout.createdAt,
        };

    return {
      id: payout.id,
      amount: payout.amount,
      date: payout.date,
      createdAt: payout.createdAt,
      method: payout.method,
      note: payout.note,
      user: payout.user,
      deal: payout.deal
        ? {
            id: payout.deal.id,
            projectName: payout.deal.projectName,
            client: payout.deal.client,
          }
        : null,
      authorizedBy,
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

