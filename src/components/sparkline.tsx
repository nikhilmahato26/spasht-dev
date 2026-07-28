"use client";

import { Line, LineChart, ResponsiveContainer, Tooltip } from "recharts";
import { formatPaisa } from "@/lib/money";

type Point = { label: string; value: number };
type Format = "currency" | "count";

function formatByKind(kind: Format, value: number) {
  return kind === "currency" ? formatPaisa(value) : String(value);
}

export function Sparkline({
  data,
  color,
  format,
}: {
  data: Point[];
  color: string;
  format: Format;
}) {
  return (
    <div className="h-10 -mx-1">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 4 }}>
          <Tooltip
            cursor={{ stroke: "var(--color-border)", strokeWidth: 1 }}
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const point = payload[0].payload as Point;
              return (
                <div className="bg-text text-surface text-2xs font-mono px-2 py-1 rounded-input shadow-sm whitespace-nowrap">
                  {point.label}: {formatByKind(format, point.value)}
                </div>
              );
            }}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 3, strokeWidth: 0 }}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
