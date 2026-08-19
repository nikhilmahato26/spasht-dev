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
    const percent = clamp(rawPercent, 0, 100);
    
    const patch: Partial<RowState> = { money: clampedMoney, percent };
    if (clampedMoney > 0) {
      patch.checked = true;
    } else if (clampedMoney === 0) {
      patch.checked = false;
    }
    
    updateRow(userId, patch);
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

  const currentMarketingSum = users
    .filter((u) => u.type === "MARKETING")
    .reduce((sum, u) => sum + (rows[u.id]?.checked ? rows[u.id].money || 0 : 0), 0);

  const currentDevSum = users
    .filter((u) => u.type === "DEV")
    .reduce((sum, u) => sum + (rows[u.id]?.checked ? rows[u.id].money || 0 : 0), 0);

  // If no money is assigned yet, fallback to the default percentages passed in so the server saves reasonable defaults
  const dynamicMarketingPercent = netEarning > 0 && totalAssignedMoney > 0 
    ? (currentMarketingSum / netEarning) * 100 
    : defaultMarketingPercent;
    
  const dynamicDevPoolPercent = netEarning > 0 && totalAssignedMoney > 0 
    ? (currentDevSum / netEarning) * 100 
    : defaultDevPoolPercent;

  return (
    <>
      <input type="hidden" name="marketingPercent" value={dynamicMarketingPercent} />
      <input type="hidden" name="devPoolPercent" value={dynamicDevPoolPercent} />
      
      <div className="grid grid-cols-3 gap-4 mb-4">
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
            onWheel={(e) => e.currentTarget.blur()}
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
            onWheel={(e) => e.currentTarget.blur()}
            onChange={(e) => setFixedCosts(clamp(Number(e.target.value), 0, Infinity))}
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
            onWheel={(e) => e.currentTarget.blur()}
            className="border border-border rounded-input px-3 py-2 text-base bg-surface font-mono"
          />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs uppercase tracking-label text-text-muted font-semibold flex items-center gap-3">
            <span>Team assignments</span>
            <span className="text-text-faint font-normal normal-case">
              (Approx pools: Marketing ~{Math.round(dynamicMarketingPercent)}% / Dev ~{Math.round(dynamicDevPoolPercent)}%)
            </span>
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
                  value={row.percent ? `${(Math.round(row.percent * 10) / 10).toFixed(1)}%` : ""}
                  readOnly
                  placeholder="%"
                  className="border border-border rounded-input px-2 py-1.5 text-sm bg-surface font-mono text-text-muted cursor-not-allowed opacity-70"
                />
                <input type="hidden" name={`pct_${u.id}`} value={row.percent || ""} />
                <input
                  type="number"
                  value={row.money || ""}
                  min="0"
                  placeholder="₹"
                  onWheel={(e) => e.currentTarget.blur()}
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
