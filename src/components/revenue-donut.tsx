"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { formatPaisa } from "@/lib/money";

type Slice = { name: string; value: number; color: string };

export function RevenueDonut({
  data,
  centerLabel,
  centerValue,
}: {
  data: Slice[];
  centerLabel: string;
  centerValue: string;
}) {
  return (
    <div className="relative h-44">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const slice = payload[0].payload as Slice;
              return (
                <div className="bg-text text-surface text-2xs font-mono px-2 py-1 rounded-input shadow-sm whitespace-nowrap">
                  {slice.name}: {formatPaisa(slice.value)}
                </div>
              );
            }}
          />
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius="64%"
            outerRadius="100%"
            strokeWidth={2}
            stroke="var(--color-surface)"
            isAnimationActive={false}
          >
            {data.map((slice) => (
              <Cell key={slice.name} fill={slice.color} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none px-4 text-center">
        <p className="font-mono text-lg font-semibold tracking-tighter">{centerValue}</p>
        <p className="text-2xs text-text-muted uppercase tracking-label">{centerLabel}</p>
      </div>
    </div>
  );
}
