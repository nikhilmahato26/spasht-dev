import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/dal";
import { db } from "@/lib/db";
import { formatPaisa } from "@/lib/money";
import { SubmitButton } from "@/components/submit-button";
import { deleteClient } from "../actions";

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-surface border border-border rounded-card p-3.5">
      <p className="text-xs uppercase tracking-label text-text-muted font-semibold">{label}</p>
      <p className="font-mono text-2xl font-semibold mt-1.5 tracking-tighter">{value}</p>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-2xs uppercase tracking-label text-text-faint">{label}</dt>
      <dd className="text-base">{value}</dd>
    </div>
  );
}

export default async function ClientDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;
  const { error } = await searchParams;

  const client = await db.client.findUnique({
    where: { id },
    include: { deals: { orderBy: { createdAt: "desc" } } },
  });
  if (!client) notFound();

  const revenue = client.deals.reduce((sum, d) => sum + d.totalPrice, 0);
  const due = client.deals.reduce((sum, d) => sum + d.dueMoney, 0);
  const hasDeals = client.deals.length > 0;

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight">{client.name}</h1>
          {client.company && <p className="text-text-muted mt-1">{client.company}</p>}
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="flex gap-2">
            <Link
              href={`/admin/clients/${client.id}/edit`}
              className="bg-surface text-text border border-border px-4 py-2.5 rounded-btn text-base font-medium hover:border-text-faint transition-colors"
            >
              Edit
            </Link>
            {user.role === "ADMIN" &&
              (hasDeals ? (
                <button
                  type="button"
                  disabled
                  title="Can't delete a client with existing deals"
                  className="bg-surface text-text-faint border border-border px-4 py-2.5 rounded-btn text-base font-medium cursor-not-allowed"
                >
                  Delete
                </button>
              ) : (
                <form action={deleteClient}>
                  <input type="hidden" name="id" value={client.id} />
                  <SubmitButton
                    pendingText="Deleting..."
                    className="bg-surface text-danger border border-border px-4 py-2.5 rounded-btn text-base font-medium hover:border-danger transition-colors disabled:opacity-60"
                  >
                    Delete
                  </SubmitButton>
                </form>
              ))}
          </div>
          {user.role === "ADMIN" && hasDeals && (
            <p className="text-2xs text-text-faint">Delete or reassign their deals first.</p>
          )}
        </div>
      </div>

      {error === "has-deals" && (
        <p className="text-sm text-danger mb-4 bg-cost-soft border border-cost/30 rounded-input px-3 py-2">
          Can&apos;t delete this client — they still have deals attached. Delete or reassign those
          deals first.
        </p>
      )}

      <div className="grid grid-cols-3 gap-3 mb-6">
        <SummaryCard label="Deals" value={String(client.deals.length)} />
        <SummaryCard label="Total Revenue" value={formatPaisa(revenue)} />
        <SummaryCard label="Outstanding Due" value={formatPaisa(due)} />
      </div>

      <div className="bg-surface border border-border rounded-card p-5 mb-6">
        <p className="text-xs uppercase tracking-label text-text-muted font-semibold mb-3">Contact</p>
        <dl className="grid grid-cols-2 gap-3">
          {client.phone && <Info label="Phone" value={client.phone} />}
          {client.email && <Info label="Email" value={client.email} />}
          {client.address && <Info label="Address" value={client.address} />}
        </dl>
        {client.notes && (
          <p className="text-sm text-text-muted mt-3 border-t border-border pt-3">{client.notes}</p>
        )}
        {!client.phone && !client.email && !client.address && !client.notes && (
          <p className="text-sm text-text-faint">No contact details yet.</p>
        )}
      </div>

      <h2 className="text-lg font-semibold mb-3">Deals</h2>
      <div className="flex flex-col gap-2">
        {client.deals.map((deal) => (
          <Link
            key={deal.id}
            href={`/admin/deals/${deal.id}`}
            className="flex items-center justify-between bg-surface border border-border rounded-card px-4 py-3 hover:border-text-faint transition-colors"
          >
            <div>
              <p className="font-medium">{deal.projectName}</p>
              <p className="text-sm text-text-faint">{deal.status}</p>
            </div>
            <span className="font-mono font-semibold">{formatPaisa(deal.totalPrice)}</span>
          </Link>
        ))}
        {client.deals.length === 0 && <p className="text-text-muted text-sm">No deals yet.</p>}
      </div>
    </div>
  );
}
