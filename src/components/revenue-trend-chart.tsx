"use client";

import { useMemo, useState } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { TrendingUp } from "lucide-react";
import { formatPaisa } from "@/lib/money";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

type DayPoint = { date: string; revenue: number; margin: number };

const RANGES = [
  { value: "7d", label: "7D", days: 7 },
  { value: "30d", label: "30D", days: 30 },
  { value: "90d", label: "90D", days: 90 },
] as const;

type RangeValue = (typeof RANGES)[number]["value"];

function formatTick(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
}

export function RevenueTrendChart({ data }: { data: DayPoint[] }) {
  const [range, setRange] = useState<RangeValue>("30d");
  const days = RANGES.find((r) => r.value === range)!.days;
  const filtered = useMemo(() => data.slice(-days), [data, days]);

  const totalRevenue = filtered.reduce((sum, d) => sum + d.revenue, 0);
  const totalMargin = filtered.reduce((sum, d) => sum + d.margin, 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <TrendingUp size={16} className="text-dev" />
          <p className="text-lg font-semibold">Performance Overview</p>
        </div>
        <ToggleGroup
          type="single"
          value={range}
          onValueChange={(v) => v && setRange(v as RangeValue)}
          variant="outline"
          className="rounded-input"
        >
          {RANGES.map((r) => (
            <ToggleGroupItem key={r.value} value={r.value} className="text-xs font-mono px-3">
              {r.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>

      <div className="flex gap-6 mb-4">
        <div>
          <p className="flex items-center gap-1.5 text-sm text-text-muted">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: "#0f6e5f" }} />
            Revenue
          </p>
          <p className="font-mono text-lg font-semibold mt-0.5">{formatPaisa(totalRevenue)}</p>
        </div>
        <div>
          <p className="flex items-center gap-1.5 text-sm text-text-muted">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: "#6B5490" }} />
            Net Earning
          </p>
          <p className="font-mono text-lg font-semibold mt-0.5">{formatPaisa(totalMargin)}</p>
        </div>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={filtered} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0f6e5f" stopOpacity={0.32} />
                <stop offset="100%" stopColor="#0f6e5f" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="marginFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6B5490" stopOpacity={0.28} />
                <stop offset="100%" stopColor="#6B5490" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="var(--color-border)" vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={{ stroke: "var(--color-border)" }}
              tick={{ fill: "var(--color-text-faint)", fontSize: 11 }}
              tickFormatter={formatTick}
              minTickGap={32}
            />
            <Tooltip
              cursor={{ stroke: "var(--color-border)", strokeWidth: 1 }}
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null;
                return (
                  <div className="bg-surface border border-border rounded-input shadow-sm px-3 py-2">
                    <p className="text-text-faint text-2xs mb-1">{formatTick(label as string)}</p>
                    {payload.map((entry) => (
                      <p
                        key={entry.dataKey as string}
                        className="font-mono text-xs"
                        style={{ color: entry.color }}
                      >
                        {entry.name}: {formatPaisa(entry.value as number)}
                      </p>
                    ))}
                  </div>
                );
              }}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              name="Revenue"
              stroke="#0f6e5f"
              strokeWidth={2.5}
              fill="url(#revenueFill)"
              dot={false}
              activeDot={{ r: 4, strokeWidth: 0 }}
              isAnimationActive={false}
            />
            <Area
              type="monotone"
              dataKey="margin"
              name="Net Earning"
              stroke="#6B5490"
              strokeWidth={2.5}
              strokeDasharray="6 3"
              fill="url(#marginFill)"
              dot={false}
              activeDot={{ r: 4, strokeWidth: 0 }}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
