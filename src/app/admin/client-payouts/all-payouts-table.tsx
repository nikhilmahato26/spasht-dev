import Link from "next/link";
import {
  Lock,
  Calendar,
  Clock,
  ArrowRight,
  ShieldCheck,
  Building2,
  FolderKanban,
  User,
  CreditCard,
  FileText,
  AlertCircle,
} from "lucide-react";
import { formatPaisa } from "@/lib/money";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { GlobalPayoutLedgerRow } from "@/lib/client-payouts-data";
import { PaginationControls } from "./pagination-controls";

function formatDate(date: Date | string) {
  const d = new Date(date);
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatTime(date: Date | string) {
  const d = new Date(date);
  return d.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
}

function formatRelativeTime(date: Date | string) {
  const d = new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHr / 24);

  if (diffDays > 30) return formatDate(d);
  if (diffDays > 0) return `${diffDays}d ago`;
  if (diffHr > 0) return `${diffHr}h ago`;
  if (diffMin > 0) return `${diffMin}m ago`;
  return "Just now";
}

interface AllPayoutsTableProps {
  payouts: GlobalPayoutLedgerRow[];
  totalCount: number;
  totalAmount: number;
  devTotal: number;
  marketingTotal: number;
  searchQuery?: string;
  currentPage: number;
  totalPages: number;
  pageSize: number;
}

export function AllPayoutsTable({
  payouts,
  totalCount,
  totalAmount,
  devTotal,
  marketingTotal,
  searchQuery,
  currentPage,
  totalPages,
  pageSize,
}: AllPayoutsTableProps) {
  return (
    <Card className="border border-border rounded-card ring-0 py-0 overflow-hidden bg-surface shadow-sm">
      {/* Immutability & Audit Guarantee Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 px-4 py-3 bg-bg/70 border-b border-border text-xs">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500/15 text-emerald-500">
            <Lock size={12} />
          </span>
          <div>
            <span className="font-semibold text-text">Immutable Audit Ledger</span>
            <span className="text-text-muted hidden md:inline ml-1.5">
              — Chronological read-only log of every team disbursement. Records cannot be edited, modified, or deleted.
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 font-mono text-2xs text-text-faint self-start sm:self-center">
          <span className="inline-flex items-center gap-1 text-emerald-500">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Auto-Populated Live
          </span>
          <span>•</span>
          <span>Sorted: Newest First</span>
        </div>
      </div>

      {/* Rows Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-bg text-2xs uppercase tracking-label text-text-muted border-b border-border">
            <tr>
              <th className="py-3 px-4 font-semibold whitespace-nowrap">
                <div className="flex items-center gap-1.5">
                  <Calendar size={13} className="text-text-faint" />
                  <span>Date & Time</span>
                </div>
              </th>
              <th className="py-3 px-4 font-semibold whitespace-nowrap">
                <div className="flex items-center gap-1.5">
                  <Building2 size={13} className="text-text-faint" />
                  <span>Client / Company</span>
                </div>
              </th>
              <th className="py-3 px-4 font-semibold whitespace-nowrap">
                <div className="flex items-center gap-1.5">
                  <FolderKanban size={13} className="text-text-faint" />
                  <span>Deal / Project</span>
                </div>
              </th>
              <th className="py-3 px-4 font-semibold whitespace-nowrap">
                <div className="flex items-center gap-1.5">
                  <User size={13} className="text-text-faint" />
                  <span>Recipient</span>
                </div>
              </th>
              <th className="py-3 px-4 font-semibold whitespace-nowrap">
                <div className="flex items-center gap-1.5">
                  <CreditCard size={13} className="text-text-faint" />
                  <span>Method</span>
                </div>
              </th>
              <th className="py-3 px-4 font-semibold text-right whitespace-nowrap">Amount</th>
              <th className="py-3 px-4 font-semibold whitespace-nowrap">Note / Reference</th>
              <th className="py-3 px-4 font-semibold whitespace-nowrap text-center">
                <div className="flex items-center justify-center gap-1.5">
                  <ShieldCheck size={13} className="text-text-faint" />
                  <span>Audit Stamp</span>
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border font-sans">
            {payouts.map((payout) => {
              const isDev = payout.user.type === "DEV";
              const isMarketing = payout.user.type === "MARKETING";

              return (
                <tr
                  key={payout.id}
                  className="hover:bg-bg/40 transition-colors group"
                >
                  {/* Date & Time */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="font-medium text-text font-mono text-xs">
                        {formatDate(payout.date)}
                      </span>
                      <div className="flex items-center gap-1 text-2xs text-text-faint font-mono mt-0.5">
                        <Clock size={11} className="text-text-faint" />
                        <span>{formatTime(payout.createdAt)}</span>
                        <span className="text-text-muted/60">({formatRelativeTime(payout.createdAt)})</span>
                      </div>
                    </div>
                  </td>

                  {/* Client & Company */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {payout.deal?.client ? (
                      <div className="flex flex-col">
                        <Link
                          href={`/admin/client-payouts/${payout.deal.client.id}`}
                          className="font-medium text-text hover:text-dev transition-colors inline-flex items-center gap-1 group/link"
                        >
                          <span>{payout.deal.client.name}</span>
                          <ArrowRight
                            size={11}
                            className="opacity-0 -translate-x-1 group-hover/link:opacity-100 group-hover/link:translate-x-0 transition-all text-dev"
                          />
                        </Link>
                        {payout.deal.client.company && (
                          <Badge
                            variant="secondary"
                            className="text-[10px] py-0 px-1.5 rounded-sm uppercase tracking-wider bg-border/40 text-text-faint mt-0.5 w-fit"
                          >
                            {payout.deal.client.company}
                          </Badge>
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-col">
                        <span className="text-xs text-text-muted italic">General / Internal</span>
                        <span className="text-[10px] text-text-faint">Direct company payout</span>
                      </div>
                    )}
                  </td>

                  {/* Deal / Project */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {payout.deal ? (
                      <Link
                        href={`/admin/deals/${payout.deal.id}`}
                        className="text-xs font-medium text-text-muted hover:text-text transition-colors"
                      >
                        {payout.deal.projectName}
                      </Link>
                    ) : (
                      <span className="text-2xs text-text-faint font-mono">No deal linked</span>
                    )}
                  </td>

                  {/* Recipient */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1.5">
                          <span className="font-medium text-text">{payout.user.name}</span>
                          {isDev && (
                            <Badge className="text-[10px] py-0 px-1.5 rounded font-mono font-medium bg-dev/10 text-dev border border-dev/20">
                              DEV
                            </Badge>
                          )}
                          {isMarketing && (
                            <Badge className="text-[10px] py-0 px-1.5 rounded font-mono font-medium bg-marketing/10 text-marketing border border-marketing/20">
                              MARKETING
                            </Badge>
                          )}
                          {!isDev && !isMarketing && (
                            <Badge className="text-[10px] py-0 px-1.5 rounded font-mono font-medium bg-border/50 text-text-muted border border-border">
                              {payout.user.type}
                            </Badge>
                          )}
                        </div>
                        <span className="text-2xs text-text-faint">
                          {payout.user.role || payout.user.email}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Method */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1 text-2xs px-2 py-0.5 rounded-full bg-border/40 text-text font-mono">
                      {payout.method || "Bank Transfer"}
                    </span>
                  </td>

                  {/* Amount */}
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <span
                      className={`font-mono text-sm font-semibold ${
                        isDev ? "text-dev" : isMarketing ? "text-marketing" : "text-text"
                      }`}
                    >
                      {formatPaisa(payout.amount)}
                    </span>
                  </td>

                  {/* Note / Reference */}
                  <td className="py-3.5 px-4 max-w-xs truncate text-xs text-text-muted">
                    {payout.note ? (
                      <span title={payout.note}>{payout.note}</span>
                    ) : (
                      <span className="text-text-faint font-mono">—</span>
                    )}
                  </td>

                  {/* Immutable Audit Stamp */}
                  <td className="py-3.5 px-4 whitespace-nowrap text-center">
                    <div className="inline-flex flex-col items-center">
                      <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 font-medium border border-emerald-500/20">
                        <Lock size={10} />
                        <span>Immutable</span>
                      </span>
                      <span className="text-[10px] text-text-faint mt-0.5">
                        By {payout.authorizedBy.userName}
                      </span>
                    </div>
                  </td>
                </tr>
              );
            })}

            {payouts.length === 0 && (
              <tr>
                <td colSpan={8} className="py-14 text-center text-text-muted">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-bg mb-3 text-text-faint border border-border">
                    <AlertCircle size={24} />
                  </div>
                  <p className="font-medium text-text text-sm">No Payout Records Found</p>
                  <p className="text-xs text-text-faint mt-1 max-w-md mx-auto">
                    {searchQuery
                      ? `No payout entries matched your search "${searchQuery}". Try searching by another client name, recipient, or note.`
                      : "No team payouts have been recorded yet. Payouts recorded from client deals will automatically stream into this table."}
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Table Footer Rollup */}
      {totalCount > 0 && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 px-4 py-2.5 bg-bg/50 border-t border-border text-xs text-text-muted">
          <div className="flex items-center gap-2 font-mono text-2xs">
            <span>Overall Total Disbursed ({totalCount} total entries)</span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
            <div>
              <span className="text-text-faint mr-1.5">Dev Total:</span>
              <span className="font-semibold text-dev">{formatPaisa(devTotal)}</span>
            </div>
            <div>
              <span className="text-text-faint mr-1.5">Marketing Total:</span>
              <span className="font-semibold text-marketing">{formatPaisa(marketingTotal)}</span>
            </div>
            <div className="pl-2 border-l border-border">
              <span className="text-text-faint mr-1.5">Total Disbursed:</span>
              <span className="font-bold text-text">{formatPaisa(totalAmount)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Pagination Controls */}
      <PaginationControls
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalCount}
        pageSize={pageSize}
        itemLabel="payouts"
      />
    </Card>
  );
}
