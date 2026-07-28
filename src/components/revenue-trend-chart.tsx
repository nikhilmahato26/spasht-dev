"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { formatPaisa } from "@/lib/money";

type Point = { label: string; revenue: number; margin: number };

export function RevenueTrendChart({ data }: { data: Point[] }) {
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0F6E5F" stopOpacity={0.32} />
              <stop offset="100%" stopColor="#0F6E5F" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="marginFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6B5490" stopOpacity={0.28} />
              <stop offset="100%" stopColor="#6B5490" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="var(--color-border)" vertical={false} />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={{ stroke: "var(--color-border)" }}
            tick={{ fill: "var(--color-text-faint)", fontSize: 11 }}
          />
          <Tooltip
            cursor={{ stroke: "var(--color-border)", strokeWidth: 1 }}
            content={({ active, payload, label }) => {
              if (!active || !payload?.length) return null;
              return (
                <div className="bg-surface border border-border rounded-input shadow-sm px-3 py-2">
                  <p className="text-text-faint text-2xs mb-1">{label}</p>
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
            stroke="#0F6E5F"
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
  );
}
