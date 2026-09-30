import Link from "next/link";
import {
  WalletCards,
  ArrowRight,
  Code,
  Megaphone,
  IndianRupee,
  Layers,
} from "lucide-react";
import { requireAdmin } from "@/lib/dal";
import {
  searchClientsWithPayoutStats,
  getAllPayoutsLedger,
  getTotalPayoutsCount,
} from "@/lib/client-payouts-data";
import { formatPaisa } from "@/lib/money";
import { PageHeader } from "@/components/page-header";
import { SummaryCard } from "@/components/summary-card";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ClientSearchInput } from "./client-search-input";
import { ClientPayoutsSubTabs } from "./sub-tabs";
import { AllPayoutsTable } from "./all-payouts-table";
import { PaginationControls } from "./pagination-controls";

export default async function ClientPayoutsPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    tab?: string;
    page?: string;
    pageSize?: string;
  }>;
}) {
  await requireAdmin();
  const { q, tab, page: pageParam, pageSize: pageSizeParam } = await searchParams;
  const activeTab = tab === "payouts" ? "payouts" : "clients";

  // Parse pagination parameters
  const rawPage = parseInt(pageParam || "1", 10);
  const rawPageSize = parseInt(pageSizeParam || (activeTab === "payouts" ? "20" : "15"), 10);
  const validPageSizes = [10, 15, 20, 25, 50, 100];
  const pageSize = validPageSizes.includes(rawPageSize)
    ? rawPageSize
    : activeTab === "payouts"
    ? 20
    : 15;

  // Fetch client data
  const clients = await searchClientsWithPayoutStats(activeTab === "clients" ? q : undefined);

  // Fetch all payouts data
  const allPayoutsData = await getAllPayoutsLedger(activeTab === "payouts" ? q : undefined);
  const totalPayoutsInDb = await getTotalPayoutsCount();

  // Compute rollups across all clients
  const totalInflow = clients.reduce((s, c) => s + c.totalInflow, 0);
  const totalDevPayouts = clients.reduce((s, c) => s + c.devPayouts, 0);
  const totalMarketingPayouts = clients.reduce((s, c) => s + c.marketingPayouts, 0);
  const totalPayouts = totalDevPayouts + totalMarketingPayouts;

  // Pagination for clients
  const totalClientsCount = clients.length;
  const totalClientPages = Math.max(1, Math.ceil(totalClientsCount / pageSize));
  const currentClientPage = Math.min(
    Math.max(1, isNaN(rawPage) ? 1 : rawPage),
    totalClientPages
  );
  const paginatedClients = clients.slice(
    (currentClientPage - 1) * pageSize,
    currentClientPage * pageSize
  );

  // Pagination for payouts
  const totalPayoutsCount = allPayoutsData.payouts.length;
  const totalPayoutPages = Math.max(1, Math.ceil(totalPayoutsCount / pageSize));
  const currentPayoutPage = Math.min(
    Math.max(1, isNaN(rawPage) ? 1 : rawPage),
    totalPayoutPages
  );
  const paginatedPayouts = allPayoutsData.payouts.slice(
    (currentPayoutPage - 1) * pageSize,
    currentPayoutPage * pageSize
  );

  return (
    <div>
      <PageHeader
        icon={WalletCards}
        color="#39568f"
        title="Client Payouts & Ledger"
      />

      {/* Aggregate Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <SummaryCard
          label="Total Inflow"
          value={formatPaisa(totalInflow)}
          color="#0f6e5f"
          icon={IndianRupee}
        />
        <SummaryCard
          label="Dev Payouts"
          value={formatPaisa(totalDevPayouts)}
          color="#39568f"
          icon={Code}
        />
        <SummaryCard
          label="Marketing Payouts"
          value={formatPaisa(totalMarketingPayouts)}
          color="#9A5B13"
          icon={Megaphone}
        />
        <SummaryCard
          label="Total Disbursed"
          value={formatPaisa(totalPayouts)}
          color="#5B398F"
          icon={Layers}
        />
      </div>

      {/* Sub-tab Navigation */}
      <ClientPayoutsSubTabs
        activeTab={activeTab}
        clientsCount={clients.length}
        payoutsCount={totalPayoutsInDb}
        searchQuery={q}
      />

      {/* Search Header Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-5">
        <ClientSearchInput
          key={activeTab}
          defaultValue={q ?? ""}
          placeholder={
            activeTab === "payouts"
              ? "Search payouts by client, section (dev / marketing), project, method, or note..."
              : "Search clients by name, company, email or phone..."
          }
        />
        <span className="text-xs text-text-muted self-end sm:self-center font-mono">
          {activeTab === "payouts"
            ? `Showing ${paginatedPayouts.length} of ${allPayoutsData.totalCount} payouts (Page ${currentPayoutPage}/${totalPayoutPages})`
            : `Showing ${paginatedClients.length} of ${clients.length} clients (Page ${currentClientPage}/${totalClientPages})`}
        </span>
      </div>

      {/* Conditional Sub-tab Content */}
      {activeTab === "payouts" ? (
        <AllPayoutsTable
          payouts={paginatedPayouts}
          totalCount={totalPayoutsCount}
          totalAmount={allPayoutsData.totalAmount}
          devTotal={allPayoutsData.devTotal}
          marketingTotal={allPayoutsData.marketingTotal}
          searchQuery={q}
          currentPage={currentPayoutPage}
          totalPages={totalPayoutPages}
          pageSize={pageSize}
        />
      ) : (
        /* Client Payout Directory Table */
        <Card className="border border-border rounded-card ring-0 py-0 overflow-hidden bg-surface">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-bg text-2xs uppercase tracking-label text-text-muted border-b border-border">
                <tr>
                  <th className="py-3 px-4 font-semibold">Client / Company</th>
                  <th className="py-3 px-4 font-semibold text-center">Deals</th>
                  <th className="py-3 px-4 font-semibold text-right">Inflow (Recv.)</th>
                  <th className="py-3 px-4 font-semibold text-right text-dev">Dev Payouts</th>
                  <th className="py-3 px-4 font-semibold text-right text-marketing">Marketing Payouts</th>
                  <th className="py-3 px-4 font-semibold text-right">Total Payouts</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {paginatedClients.map((client) => (
                  <tr
                    key={client.id}
                    className="hover:bg-bg/40 transition-colors group"
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col">
                        <Link
                          href={`/admin/client-payouts/${client.id}`}
                          className="font-medium text-text group-hover:text-dev transition-colors"
                        >
                          {client.name}
                        </Link>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          {client.company && (
                            <Badge
                              variant="secondary"
                              className="text-[10px] py-0 px-1.5 rounded-sm uppercase tracking-wider bg-border/40 text-text-faint"
                            >
                              {client.company}
                            </Badge>
                          )}
                          {client.email && (
                            <span className="text-2xs text-text-faint">{client.email}</span>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-center font-mono text-xs">
                      <span className="inline-block px-2 py-0.5 rounded-full bg-border/30 text-text">
                        {client.dealCount}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono text-sm font-medium text-text">
                      {formatPaisa(client.totalInflow)}
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono text-sm text-dev font-medium">
                      {formatPaisa(client.devPayouts)}
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono text-sm text-marketing font-medium">
                      {formatPaisa(client.marketingPayouts)}
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono text-sm font-medium text-text">
                      {formatPaisa(client.totalPayouts)}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <Link
                        href={`/admin/client-payouts/${client.id}`}
                        className="inline-flex items-center gap-1 text-xs font-medium text-text border border-border px-3 py-1.5 rounded-btn hover:border-text-faint hover:bg-bg transition-colors"
                      >
                        <span>Ledger & Payouts</span>
                        <ArrowRight size={13} className="text-text-muted" />
                      </Link>
                    </td>
                  </tr>
                ))}

                {paginatedClients.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-text-muted">
                      <WalletCards size={36} className="mx-auto text-text-faint mb-3 opacity-60" />
                      <p className="font-medium text-text">No clients found</p>
                      <p className="text-xs text-text-faint mt-1">
                        {q ? `No clients matching "${q}"` : "No clients created yet."}
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Client Table Pagination */}
          <PaginationControls
            currentPage={currentClientPage}
            totalPages={totalClientPages}
            totalItems={totalClientsCount}
            pageSize={pageSize}
            itemLabel="clients"
          />
        </Card>
      )}
    </div>
  );
}
