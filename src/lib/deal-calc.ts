export type DealSplitInput = {
  totalPrice: number;
  fixedCosts: number;
  marketingPercent: number;
  devPoolPercent: number;
  status?: string;
  advanceReceived?: number;
  payments?: { amount: number }[];
};

export type DealSplit = {
  costs: number;
  marketing: number;
  devPool: number;
  /** totalPrice - fixedCosts. What the company actually earned on this deal. */
  netEarning: number;
  /** netEarning - marketing - devPool. Only used to size the blank leftover
   * segment in the money flow bar — never shown as its own figure, since
   * marketing/dev pool are part of the company, not a cut taken from it. */
  unallocated: number;
};

// Fixed costs come off the top first; marketing/dev pool percentages apply
// to what's left (netEarning). Everything is in paisa.
export function computeDealSplit(deal: DealSplitInput): DealSplit {
  let effectiveTotalPrice = deal.totalPrice;
  let netEarning = deal.totalPrice - deal.fixedCosts;

  if (deal.status === "CANCELLED") {
    if (deal.advanceReceived !== undefined && deal.payments !== undefined) {
      effectiveTotalPrice = deal.advanceReceived + deal.payments.reduce((sum, p) => sum + p.amount, 0);
    }
    // Cancelled deals do NOT subtract fixed costs from the effective total price for payout purposes
    netEarning = effectiveTotalPrice;
  }

  const marketing = Math.round(netEarning * (deal.marketingPercent / 100));
  const devPool = Math.round(netEarning * (deal.devPoolPercent / 100));
  const unallocated = netEarning - marketing - devPool;

  return { costs: deal.fixedCosts, marketing, devPool, netEarning, unallocated };
}

export function computeDueMoney(
  totalPrice: number,
  advanceReceived: number,
  payments: { amount: number }[],
  status?: string
): number {
  if (status === "CANCELLED") return 0;
  const paid = advanceReceived + payments.reduce((sum, p) => sum + p.amount, 0);
  return Math.max(0, totalPrice - paid);
}

// allocationPercent is a direct share of the deal's net earning (same base
// as marketingPercent/devPoolPercent themselves) — e.g. the sole marketing
// person on a deal shows 40%, matching the deal's Marketing % exactly,
// rather than "100% of the marketing pool". A DEV assignee's % should sum
// (with their dev teammates) to at most devPoolPercent; a MARKETING
// assignee's % should sum to at most marketingPercent — enforced where
// assignments are validated, not here.
export function computeAssignmentAmount(netEarning: number, allocationPercent: number): number {
  return Math.round(netEarning * (allocationPercent / 100));
}
