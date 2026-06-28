"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { format } from "date-fns";
import type { TransactionData } from "@/types";
import { formatCurrency } from "@/lib/utils";

interface BalanceTrendChartProps {
  transactions: TransactionData[];
  currentBalance: number;
}

export function BalanceTrendChart({ transactions, currentBalance }: BalanceTrendChartProps) {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const recent = transactions.filter((t) => new Date(t.createdAt) >= thirtyDaysAgo);

  const monthStart = transactions.find((t) => new Date(t.createdAt) < thirtyDaysAgo)?.balanceAfterTx ?? currentBalance;
  const monthEnd = currentBalance;
  const diff = monthEnd - monthStart;

  const byDay = recent.reduce<Record<string, number>>((acc, tx) => {
    const day = format(new Date(tx.createdAt), "MM/dd");
    acc[day] = tx.balanceAfterTx;
    return acc;
  }, {});

  const data = Object.entries(byDay)
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([date, balance]) => ({ date, balance }));

  if (data.length === 0) {
    data.push({ date: format(new Date(), "MM/dd"), balance: currentBalance });
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold">Balance Trend (30 days)</h2>
        <span className={`text-xs font-medium ${diff >= 0 ? "text-green-500" : "text-red-500"}`}>
          {diff >= 0 ? "↑" : "↓"} {formatCurrency(Math.abs(diff))} this month
        </span>
      </div>
      <ResponsiveContainer width="100%" height={180}>
        <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
          <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#64748b" }} />
          <YAxis tick={{ fontSize: 10, fill: "#64748b" }} tickFormatter={(v) => `₦${(v / 1000).toFixed(0)}k`} />
          <Tooltip
            formatter={(v) => [formatCurrency(Number(v)), "Balance"]}
            contentStyle={{ background: "#111827", border: "1px solid #1e293b", borderRadius: 8, fontSize: 12 }}
          />
          <Line type="monotone" dataKey="balance" stroke="#2563eb" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
