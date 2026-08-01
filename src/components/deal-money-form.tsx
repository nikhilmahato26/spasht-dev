"use client";

import { useState, useRef, useEffect } from "react";

type MemberType = "DEV" | "MARKETING";
type UserOption = { id: string; name: string; type: MemberType };
type ExistingAssignment = { userId: string; role: string | null; allocationPercent: number };

type RowState = { checked: boolean; role: string; percent: number; money: number };

function clamp(value: number, min: number, max: number) {
  if (Number.isNaN(value)) return min;
  return Math.min(max, Math.max(min, value));
}

export function DealMoneyForm({
  users,
  defaultTotalPrice = 0,
  defaultFixedCosts = 0,
  defaultMarketingPercent = 15,
  defaultDevPoolPercent = 50,
  defaultAdvanceReceived = 0,
  existingAssignments = [],
}: {
  users: UserOption[];
  defaultTotalPrice?: number;
  defaultFixedCosts?: number;
  defaultMarketingPercent?: number;
  defaultDevPoolPercent?: number;
  defaultAdvanceReceived?: number;
  existingAssignments?: ExistingAssignment[];
}) {
  const [totalPrice, setTotalPrice] = useState(defaultTotalPrice);
  const [fixedCosts, setFixedCosts] = useState(defaultFixedCosts);
  const [marketingPercent, setMarketingPercent] = useState(defaultMarketingPercent);
  const [devPoolPercent, setDevPoolPercent] = useState(defaultDevPoolPercent);

  const netEarning = Math.max(0, totalPrice - fixedCosts);

  const existingByUser = new Map(existingAssignments.map((a) => [a.userId, a]));
  const [rows, setRows] = useState<Record<string, RowState>>(() =>
    Object.fromEntries(
      users.map((u) => {
        const existing = existingByUser.get(u.id);
        const percent = existing?.allocationPercent ?? 0;
        return [
          u.id,
          {
            checked: !!existing,
            role: existing?.role ?? "",
            percent,
            money: Math.round((netEarning * percent) / 100),
          },
        ];
      })
    )
  );

  // Net earning changed (total price / fixed costs edited) — refresh every
  // row's ₹ display to match its stored %, without touching % itself.
  // Render-time adjustment (not an effect) per React's own guidance for
  // "reset/derive state when an input changes".
  const [lastNetEarning, setLastNetEarning] = useState(netEarning);
  if (netEarning !== lastNetEarning) {
    setLastNetEarning(netEarning);
    setRows((prev) => {
      const next: Record<string, RowState> = {};
      for (const [id, r] of Object.entries(prev)) {
        next[id] = { ...r, money: Math.round((netEarning * r.percent) / 100) };
      }
      return next;
    });
  }

  const marketingPool = Math.round((netEarning * marketingPercent) / 100);
  const devPool = Math.round((netEarning * devPoolPercent) / 100);

  function handleMarketingChange(value: number) {
    const clamped = clamp(value, 0, 100);
    setMarketingPercent(clamped);
    setDevPoolPercent(100 - clamped);
  }

  function handleDevPoolChange(value: number) {
    const clamped = clamp(value, 0, 100);
    setDevPoolPercent(clamped);
    setMarketingPercent(100 - clamped);
  }

  function updateRow(userId: string, patch: Partial<RowState>) {
    setRows((prev) => ({ ...prev, [userId]: { ...prev[userId], ...patch } }));
  }

  // % and ₹ are both stored directly (not derived from each other at render
  // time) so typing in one never gets clobbered by a rounded round-trip
  // through the other on the very next keystroke — each edit updates both
  // fields atomically instead.
  function handlePercentChange(userId: string, percent: number) {
    const clamped = clamp(percent, 0, 100);
    updateRow(userId, { percent: clamped, money: Math.round((netEarning * clamped) / 100) });
  }

  function handleMoneyChange(userId: string, money: number) {
    const clampedMoney = clamp(money, 0, Infinity);
    const rawPercent = netEarning > 0 ? (clampedMoney / netEarning) * 100 : 0;
    const percent = clamp(Math.round(rawPercent * 10) / 10, 0, 100);
    updateRow(userId, { money: clampedMoney, percent });
  }

  // A DEV assignee's % (with their dev teammates) should total at most
  // devPoolPercent; a MARKETING assignee's % should total at most
  // marketingPercent — each is a slice of that same shared budget.
  function otherRowsPercentSum(userId: string, memberType: MemberType) {
    const raw = users
      .filter((u) => u.type === memberType && u.id !== userId)
      .reduce((sum, u) => sum + (rows[u.id]?.checked ? rows[u.id].percent : 0), 0);
    return Math.round(raw * 10) / 10;
  }

  const totalAssignedMoney = users.reduce(
    (sum, u) => sum + (rows[u.id]?.checked ? rows[u.id].money || 0 : 0),
    0
  );
  // Allow exact 0 net earning to be valid, otherwise require assigned money to exactly match
  const isFullyAssigned = netEarning === 0 || totalAssignedMoney === netEarning;

  const validationRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (validationRef.current) {
      validationRef.current.setCustomValidity(
        isFullyAssigned
          ? ""
          : `Please assign exactly all of the net earning (₹${netEarning}). Currently assigned: ₹${totalAssignedMoney}`
      );
    }
  }, [isFullyAssigned, netEarning, totalAssignedMoney]);

  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-xs uppercase tracking-label text-text-muted font-semibold">
            Total price (₹) *
          </label>
          <input
            type="number"
            name="totalPrice"
            min="0"
            step="1"
            required
            value={totalPrice || ""}
            onChange={(e) => setTotalPrice(clamp(Number(e.target.value), 0, Infinity))}
            className="border border-border rounded-input px-3 py-2 text-base bg-surface font-mono"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs uppercase tracking-label text-text-muted font-semibold">
            Fixed costs (₹)
          </label>
          <input
            type="number"
            name="fixedCosts"
            min="0"
            step="1"
            value={fixedCosts || ""}
            onChange={(e) => setFixedCosts(clamp(Number(e.target.value), 0, Infinity))}
            className="border border-border rounded-input px-3 py-2 text-base bg-surface font-mono"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-xs uppercase tracking-label text-text-muted font-semibold">
            Marketing % <span className="normal-case text-text-faint">(₹{marketingPool})</span>
          </label>
          <input
            type="number"
            name="marketingPercent"
            min="0"
            max="100"
            step="0.1"
            value={marketingPercent}
            onChange={(e) => handleMarketingChange(Number(e.target.value))}
            className="border border-border rounded-input px-3 py-2 text-base bg-surface font-mono"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs uppercase tracking-label text-text-muted font-semibold">
            Dev pool % <span className="normal-case text-text-faint">(₹{devPool})</span>
          </label>
          <input
            type="number"
            name="devPoolPercent"
            min="0"
            max="100"
            step="0.1"
            value={devPoolPercent}
            onChange={(e) => handleDevPoolChange(Number(e.target.value))}
            className="border border-border rounded-input px-3 py-2 text-base bg-surface font-mono"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs uppercase tracking-label text-text-muted font-semibold">
            Advance received (₹)
          </label>
          <input
            type="number"
            name="advanceReceived"
            min="0"
            step="1"
            defaultValue={defaultAdvanceReceived}
            className="border border-border rounded-input px-3 py-2 text-base bg-surface font-mono"
          />
        </div>
      </div>
      <p className="text-2xs text-text-faint -mt-3">
        Marketing % and Dev pool % always add up to 100% of net earning — editing one adjusts the
        other.
      </p>

      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs uppercase tracking-label text-text-muted font-semibold">
            Team assignments
          </p>
          <div
            className={`text-sm font-medium ${
              isFullyAssigned ? "text-green-600" : "text-red-500"
            }`}
          >
            Assigned: ₹{totalAssignedMoney} / ₹{netEarning}
          </div>
        </div>
        <input
          type="checkbox"
          required
          checked={isFullyAssigned}
          className="opacity-0 absolute -z-10 w-0 h-0"
          onChange={() => {}}
          ref={validationRef}
          tabIndex={-1}
        />
        <div className="border border-border rounded-card divide-y divide-border">
          {users.map((u) => {
            const row = rows[u.id];
            const typeBudgetPercent = u.type === "MARKETING" ? marketingPercent : devPoolPercent;
            const maxPercent = clamp(
              typeBudgetPercent - otherRowsPercentSum(u.id, u.type),
              0,
              typeBudgetPercent
            );
            const maxMoney = Math.round((netEarning * maxPercent) / 100);

            return (
              <div
                key={u.id}
                className="grid grid-cols-[auto_1fr_120px_90px_100px] items-center gap-2 px-3 py-2.5"
              >
                <input
                  type="checkbox"
                  name={`assign_${u.id}`}
                  checked={row.checked}
                  onChange={(e) => updateRow(u.id, { checked: e.target.checked })}
                  className="w-4 h-4"
                />
                <span className="text-base">
                  {u.name} <span className="text-2xs text-text-faint uppercase">{u.type}</span>
                </span>
                <input
                  type="text"
                  name={`role_${u.id}`}
                  value={row.role}
                  onChange={(e) => updateRow(u.id, { role: e.target.value })}
                  placeholder="Role (optional)"
                  className="border border-border rounded-input px-2 py-1.5 text-sm bg-surface"
                />
                <input
                  type="text"
                  value={row.percent ? `${row.percent}%` : ""}
                  readOnly
                  placeholder="%"
                  className="border border-border rounded-input px-2 py-1.5 text-sm bg-surface font-mono text-text-muted cursor-not-allowed opacity-70"
                />
                <input type="hidden" name={`pct_${u.id}`} value={row.percent || ""} />
                <input
                  type="number"
                  value={row.money || ""}
                  min="0"
                  max={maxMoney}
                  placeholder="₹"
                  onChange={(e) => handleMoneyChange(u.id, Number(e.target.value))}
                  className="border border-border rounded-input px-2 py-1.5 text-sm bg-surface font-mono"
                />
              </div>
            );
          })}
        </div>
        {users.length === 0 && (
          <p className="text-text-muted text-sm mt-2">No team members yet — add them under Team.</p>
        )}
        <p className="text-2xs text-text-faint mt-1">
          Type the ₹ amount for each member. The percentage is calculated automatically.
          All of the net earning must be assigned before you can save.
        </p>
      </div>
    </>
  );
}
