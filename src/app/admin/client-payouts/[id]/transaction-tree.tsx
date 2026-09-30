"use client";

import { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  ShieldCheck,
  ArrowDownLeft,
  ArrowUpRight,
  Clock,
  User,
  Receipt,
  Code,
  Megaphone,
  CreditCard,
  FileText,
  Layers,
  FolderGit2,
} from "lucide-react";
import { formatPaisa } from "@/lib/money";
import { Badge } from "@/components/ui/badge";
import type {
  EnrichedDealTree,
  EnrichedPayment,
  EnrichedCostItem,
  EnrichedPayout,
} from "@/lib/client-payouts-data";

function formatExactDateTime(date: Date | string) {
  const d = new Date(date);
  return d.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
}

function formatDateOnly(date: Date | string) {
  const d = new Date(date);
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function TransactionTree({
  clientName,
  deals,
}: {
  clientName: string;
  deals: EnrichedDealTree[];
}) {
  const [expandedDeals, setExpandedDeals] = useState<Record<string, boolean>>(() => {
    // Default all deals to expanded
    const initial: Record<string, boolean> = {};
    for (const d of deals) initial[d.id] = true;
    return initial;
  });

  const [activeFilter, setActiveFilter] = useState<"ALL" | "INFLOWS" | "COSTS" | "DEV" | "MARKETING">("ALL");

  const toggleDeal = (dealId: string) => {
    setExpandedDeals((prev) => ({ ...prev, [dealId]: !prev[dealId] }));
  };

  const expandAll = () => {
    const next: Record<string, boolean> = {};
    for (const d of deals) next[d.id] = true;
    setExpandedDeals(next);
  };

  const collapseAll = () => {
    setExpandedDeals({});
  };

  return (
    <div className="space-y-4">
      {/* Immutability Banner & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-bg/80 border border-border rounded-input px-4 py-3">
        <div className="flex items-center gap-2">
          <ShieldCheck size={18} className="text-emerald-400 shrink-0" />
          <div>
            <p className="text-xs font-semibold text-text uppercase tracking-wider">
              Immutable Audit Ledger
            </p>
            <p className="text-2xs text-text-faint">
              Strictly read-only transaction tree with full provenance (author, timestamp, method).
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center">
          {/* Quick Category Filter */}
          <div className="flex items-center gap-1 bg-surface p-0.5 rounded-sm border border-border">
            {(
              [
                { id: "ALL", label: "All" },
                { id: "INFLOWS", label: "Inflows" },
                { id: "COSTS", label: "Costs" },
                { id: "DEV", label: "Dev" },
                { id: "MARKETING", label: "Marketing" },
              ] as const
            ).map((filter) => (
              <button
                key={filter.id}
                type="button"
                onClick={() => setActiveFilter(filter.id)}
                className={`text-[10px] font-semibold px-2 py-0.5 rounded-xs transition-colors ${
                  activeFilter === filter.id
                    ? "bg-bg text-text shadow-xs"
                    : "text-text-muted hover:text-text"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 pl-2 border-l border-border text-2xs">
            <button
              type="button"
              onClick={expandAll}
              className="text-text-muted hover:text-text px-1.5 py-0.5 rounded transition-colors"
            >
              Expand
            </button>
            <span>·</span>
            <button
              type="button"
              onClick={collapseAll}
              className="text-text-muted hover:text-text px-1.5 py-0.5 rounded transition-colors"
            >
              Collapse
            </button>
          </div>
        </div>
      </div>

      {/* Tree Root Container */}
      <div className="bg-surface border border-border rounded-card p-4 sm:p-6 divide-y divide-border">
        {/* Client Tree Header */}
        <div className="pb-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-border/40 flex items-center justify-center text-text font-bold text-xs">
              <FolderGit2 size={16} className="text-dev" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-base text-text">{clientName}</span>
                <span className="text-2xs uppercase tracking-label px-2 py-0.5 rounded-full bg-border/40 text-text-muted font-mono">
                  {deals.length} {deals.length === 1 ? "Deal Branch" : "Deal Branches"}
                </span>
              </div>
              <p className="text-2xs text-text-faint">Root Transaction Anchor for Client Portfolio</p>
            </div>
          </div>
        </div>

        {/* Deal Tree Branches */}
        <div className="pt-4 space-y-6">
          {deals.map((deal) => {
            const isExpanded = !!expandedDeals[deal.id];

            const showInflows = activeFilter === "ALL" || activeFilter === "INFLOWS";
            const showCosts = activeFilter === "ALL" || activeFilter === "COSTS";
            const showDev = activeFilter === "ALL" || activeFilter === "DEV";
            const showMarketing = activeFilter === "ALL" || activeFilter === "MARKETING";

            return (
              <div
                key={deal.id}
                className="rounded-input border border-border bg-bg/50 overflow-hidden transition-all"
              >
                {/* Deal Header Node */}
                <div
                  onClick={() => toggleDeal(deal.id)}
                  className="px-4 py-3 bg-bg flex items-center justify-between cursor-pointer hover:bg-border/20 transition-colors select-none"
                >
                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      aria-label="Toggle deal details"
                      className="text-text-muted hover:text-text transition-colors"
                    >
                      {isExpanded ? <ChevronDown size={17} /> : <ChevronRight size={17} />}
                    </button>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-text">{deal.projectName}</span>
                        <Badge
                          variant="secondary"
                          className="text-[10px] py-0 px-1.5 rounded-sm uppercase tracking-wider bg-border/40 text-text"
                        >
                          {deal.status}
                        </Badge>
                      </div>
                      <p className="text-2xs text-text-faint mt-0.5">
                        Created by {deal.createdBy.name} on {formatDateOnly(deal.createdAt)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs font-mono">
                    <div className="text-right hidden sm:block">
                      <span className="text-2xs uppercase text-text-faint block">Total Value</span>
                      <span className="text-text font-medium">{formatPaisa(deal.totalPrice)}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-2xs uppercase text-text-faint block">Inflow</span>
                      <span className="text-emerald-400 font-semibold">{formatPaisa(deal.totals.inflow)}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-2xs uppercase text-text-faint block">Outflow</span>
                      <span className="text-text-muted font-medium">{formatPaisa(deal.totals.totalPaidOut)}</span>
                    </div>
                  </div>
                </div>

                {/* Deal Children / Sub-Branches */}
                {isExpanded && (
                  <div className="p-4 sm:p-5 space-y-6 border-t border-border">
                    {/* Sub-Branch 1: Inflows (Client Payments) */}
                    {showInflows && (
                      <div className="relative pl-5 border-l-2 border-emerald-500/30 space-y-3">
                        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-label">
                          <ArrowDownLeft size={15} />
                          <span>Inflows (Client Payments)</span>
                          <span className="font-mono text-text-faint text-2xs normal-case">
                            ({deal.payments.length + (deal.advanceReceived > 0 ? 1 : 0)} recorded)
                          </span>
                        </div>

                        {/* Advance Received Node */}
                        {deal.advanceReceived > 0 && (
                          <div className="bg-surface border border-border rounded-input p-3 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-text">Advance Received</span>
                                <Badge
                                  variant="secondary"
                                  className="text-[10px] py-0 px-1 rounded-sm bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                >
                                  Advance
                                </Badge>
                              </div>
                              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-2xs text-text-faint">
                                <span className="flex items-center gap-1">
                                  <Clock size={11} />
                                  <span>{formatExactDateTime(deal.createdAt)}</span>
                                </span>
                                <span className="flex items-center gap-1">
                                  <User size={11} />
                                  <span>Entered by: {deal.createdBy.name} ({deal.createdBy.email})</span>
                                </span>
                              </div>
                            </div>
                            <span className="font-mono text-sm font-semibold text-emerald-400 sm:self-center">
                              +{formatPaisa(deal.advanceReceived)}
                            </span>
                          </div>
                        )}

                        {/* Subsequent Payments */}
                        {deal.payments.map((payment) => (
                          <div
                            key={payment.id}
                            className="bg-surface border border-border rounded-input p-3 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                          >
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-text">
                                  {payment.method || "Client Payment"}
                                </span>
                                {payment.note && (
                                  <span className="text-2xs text-text-faint">· {payment.note}</span>
                                )}
                              </div>
                              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-2xs text-text-faint">
                                <span className="flex items-center gap-1">
                                  <Clock size={11} />
                                  <span>{formatExactDateTime(payment.createdAt)}</span>
                                </span>
                                <span className="flex items-center gap-1">
                                  <CreditCard size={11} />
                                  <span>Effective: {formatDateOnly(payment.date)}</span>
                                </span>
                                <span className="flex items-center gap-1 text-text-muted">
                                  <User size={11} />
                                  <span>
                                    Entered by: {payment.enteredBy.userName} ({payment.enteredBy.userEmail})
                                  </span>
                                </span>
                              </div>
                            </div>
                            <span className="font-mono text-sm font-semibold text-emerald-400 sm:self-center">
                              +{formatPaisa(payment.amount)}
                            </span>
                          </div>
                        ))}

                        {deal.payments.length === 0 && deal.advanceReceived === 0 && (
                          <p className="text-2xs text-text-faint italic py-1">No client payments recorded yet.</p>
                        )}
                      </div>
                    )}

                    {/* Sub-Branch 2: Direct Costs */}
                    {showCosts && (
                      <div className="relative pl-5 border-l-2 border-amber-500/30 space-y-3">
                        <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-label">
                          <Receipt size={15} />
                          <span>Direct Project Costs</span>
                          <span className="font-mono text-text-faint text-2xs normal-case">
                            ({deal.costItems.length + (deal.fixedCosts > 0 ? 1 : 0)} items)
                          </span>
                        </div>

                        {deal.fixedCosts > 0 && (
                          <div className="bg-surface border border-border rounded-input p-3 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div className="space-y-1">
                              <span className="font-medium text-text">Fixed Deal Costs</span>
                              <div className="flex items-center gap-3 text-2xs text-text-faint">
                                <span>Allocated at deal setup</span>
                                <span>Entered by: {deal.createdBy.name}</span>
                              </div>
                            </div>
                            <span className="font-mono text-sm font-semibold text-amber-400 sm:self-center">
                              -{formatPaisa(deal.fixedCosts)}
                            </span>
                          </div>
                        )}

                        {deal.costItems.map((item) => (
                          <div
                            key={item.id}
                            className="bg-surface border border-border rounded-input p-3 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                          >
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-text">{item.label}</span>
                                {item.isRecurring && (
                                  <span className="text-[10px] text-text-faint bg-border/40 px-1 rounded">
                                    recurring
                                  </span>
                                )}
                              </div>
                              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-2xs text-text-faint">
                                <span className="flex items-center gap-1">
                                  <Clock size={11} />
                                  <span>{formatExactDateTime(item.createdAt)}</span>
                                </span>
                                <span className="flex items-center gap-1">
                                  <User size={11} />
                                  <span>Entered by: {item.enteredBy.userName} ({item.enteredBy.userEmail})</span>
                                </span>
                              </div>
                            </div>
                            <span className="font-mono text-sm font-semibold text-amber-400 sm:self-center">
                              -{formatPaisa(item.amount)}
                            </span>
                          </div>
                        ))}

                        {deal.costItems.length === 0 && deal.fixedCosts === 0 && (
                          <p className="text-2xs text-text-faint italic py-1">No direct costs recorded.</p>
                        )}
                      </div>
                    )}

                    {/* Sub-Branch 3: Dev Section Payouts */}
                    {showDev && (
                      <div className="relative pl-5 border-l-2 border-dev/40 space-y-3">
                        <div className="flex items-center gap-2 text-xs font-semibold text-dev uppercase tracking-label">
                          <Code size={15} />
                          <span>Dev Section Payouts</span>
                          <span className="font-mono text-text-faint text-2xs normal-case">
                            ({deal.devPayouts.length} disbursements)
                          </span>
                        </div>

                        {deal.devPayouts.map((payout) => (
                          <div
                            key={payout.id}
                            className="bg-surface border border-border rounded-input p-3 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                          >
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-text">Dev Section</span>
                                <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.2 rounded bg-dev-soft text-dev font-semibold">
                                  DEV
                                </span>
                                {payout.method && (
                                  <span className="text-2xs text-text-faint">via {payout.method}</span>
                                )}
                                {payout.note && (
                                  <span className="text-2xs text-text-faint">· {payout.note}</span>
                                )}
                              </div>
                              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-2xs text-text-faint">
                                <span className="flex items-center gap-1">
                                  <Clock size={11} />
                                  <span>{formatExactDateTime(payout.createdAt)}</span>
                                </span>
                                <span className="flex items-center gap-1">
                                  <CreditCard size={11} />
                                  <span>Disbursed: {formatDateOnly(payout.date)}</span>
                                </span>
                                <span className="flex items-center gap-1 text-text-muted">
                                  <ShieldCheck size={11} className="text-dev" />
                                  <span>
                                    Authorized by: {payout.authorizedBy.userName} ({payout.authorizedBy.userEmail})
                                  </span>
                                </span>
                              </div>
                            </div>
                            <span className="font-mono text-sm font-semibold text-dev sm:self-center">
                              -{formatPaisa(payout.amount)}
                            </span>
                          </div>
                        ))}

                        {deal.devPayouts.length === 0 && (
                          <p className="text-2xs text-text-faint italic py-1">No dev payouts disbursed yet.</p>
                        )}
                      </div>
                    )}

                    {/* Sub-Branch 4: Marketing Section Payouts */}
                    {showMarketing && (
                      <div className="relative pl-5 border-l-2 border-marketing/40 space-y-3">
                        <div className="flex items-center gap-2 text-xs font-semibold text-marketing uppercase tracking-label">
                          <Megaphone size={15} />
                          <span>Marketing Section Payouts</span>
                          <span className="font-mono text-text-faint text-2xs normal-case">
                            ({deal.marketingPayouts.length} disbursements)
                          </span>
                        </div>

                        {deal.marketingPayouts.map((payout) => (
                          <div
                            key={payout.id}
                            className="bg-surface border border-border rounded-input p-3 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                          >
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-text">Marketing Section</span>
                                <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.2 rounded bg-marketing-soft text-marketing font-semibold">
                                  MARKETING
                                </span>
                                {payout.method && (
                                  <span className="text-2xs text-text-faint">via {payout.method}</span>
                                )}
                                {payout.note && (
                                  <span className="text-2xs text-text-faint">· {payout.note}</span>
                                )}
                              </div>
                              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-2xs text-text-faint">
                                <span className="flex items-center gap-1">
                                  <Clock size={11} />
                                  <span>{formatExactDateTime(payout.createdAt)}</span>
                                </span>
                                <span className="flex items-center gap-1">
                                  <CreditCard size={11} />
                                  <span>Disbursed: {formatDateOnly(payout.date)}</span>
                                </span>
                                <span className="flex items-center gap-1 text-text-muted">
                                  <ShieldCheck size={11} className="text-marketing" />
                                  <span>
                                    Authorized by: {payout.authorizedBy.userName} ({payout.authorizedBy.userEmail})
                                  </span>
                                </span>
                              </div>
                            </div>
                            <span className="font-mono text-sm font-semibold text-marketing sm:self-center">
                              -{formatPaisa(payout.amount)}
                            </span>
                          </div>
                        ))}

                        {deal.marketingPayouts.length === 0 && (
                          <p className="text-2xs text-text-faint italic py-1">No marketing payouts disbursed yet.</p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {deals.length === 0 && (
            <p className="text-center py-8 text-sm text-text-muted">
              No project deals found for this client.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
