"use client";

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { StatusCount } from "@/lib/types";

const STATUS_COLORS: Record<string, string> = {
  requested: "#3b82f6",
  accepted: "#4f46e5",
  "in-progress": "#f59e0b",
  completed: "#16a34a",
  rejected: "#dc2626",
  cancelled: "#94a3b8",
  paid: "#16a34a",
  unpaid: "#f59e0b",
};

const label = (s: string) =>
  s.replace("-", " ").replace(/\b\w/g, (c) => c.toUpperCase());

const tooltipStyle = {
  background: "var(--fallback-b1, oklch(var(--b1)))",
  border: "1px solid var(--fallback-b3, oklch(var(--b3)))",
  borderRadius: "0.75rem",
  color: "var(--fallback-bc, oklch(var(--bc)))",
  fontSize: 12,
};

const legendStyle = {
  color: "var(--fallback-bc, oklch(var(--bc)))",
  fontSize: 12,
};

function NoData() {
  return (
    <div className="h-56 grid place-items-center text-sm opacity-60">
      No data to visualize yet
    </div>
  );
}

export function StatusPie({ data, title }: { data: StatusCount[]; title: string }) {
  const chartData = data.map((d) => ({ name: label(d._id), value: d.count, key: d._id }));
  return (
    <div className="card-surface p-5">
      <h3 className="font-heading font-bold text-sm mb-3">{title}</h3>
      {!chartData.length ? (
        <NoData />
      ) : (
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={3}
              >
                {chartData.map((d) => (
                  <Cell key={d.key} fill={STATUS_COLORS[d.key] || "#0f766e"} stroke="none" />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
              <Legend style={legendStyle} iconType="circle" iconSize={9} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

export function StatusBars({ data, title }: { data: StatusCount[]; title: string }) {
  const chartData = data.map((d) => ({ name: label(d._id), count: d.count, key: d._id }));
  return (
    <div className="card-surface p-5">
      <h3 className="font-heading font-bold text-sm mb-3">{title}</h3>
      {!chartData.length ? (
        <NoData />
      ) : (
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 4, right: 8, left: -18, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--fallback-b3, oklch(var(--b3)))" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "var(--fallback-bc, oklch(var(--bc)))" }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "var(--fallback-bc, oklch(var(--bc)))" }} />
              <Tooltip
                cursor={{ fill: "var(--fallback-b2, oklch(var(--b2)))", opacity: 0.5 }}
                contentStyle={tooltipStyle}
              />
              <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                {chartData.map((d) => (
                  <Cell key={d.key} fill={STATUS_COLORS[d.key] || "#0f766e"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
