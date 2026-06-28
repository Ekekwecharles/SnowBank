"use client";

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { formatCurrency } from "@/lib/utils";
import type { TransactionData } from "@/types";

const COLORS = ["#2563eb", "#7c3aed", "#059669", "#d97706", "#dc2626", "#0891b2", "#64748b"];

const CATEGORY_LABELS: Record<string, string> = {
  food: "Food",
  transport: "Transport",
  utilities: "Utilities",
  shopping: "Shopping",
  transfers: "Transfers",
  airtime: "Airtime",
  bills: "Bills",
  others: "Others",
  salary: "Salary",
};

interface SpendingChartProps {
  transactions: TransactionData[];
}

export function SpendingChart({ transactions }: SpendingChartProps) {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const debits = transactions.filter(
    (t) => t.direction === "debit" && new Date(t.createdAt) >= monthStart
  );

  const byCategory = debits.reduce<Record<string, number>>((acc, tx) => {
    const cat = tx.category ?? "others";
    acc[cat] = (acc[cat] ?? 0) + tx.amount;
    return acc;
  }, {});

  const data = Object.entries(byCategory).map(([key, value]) => ({
    name: CATEGORY_LABELS[key] ?? key,
    value: parseFloat(value.toFixed(2)),
  }));

  if (data.length === 0) {
    return (
      <div>
        <h2 className="text-sm font-semibold mb-4">Spending Breakdown</h2>
        <div className="text-center py-8 text-sm text-muted-foreground">No spending data for this month</div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-sm font-semibold mb-4">Spending Breakdown (This Month)</h2>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="value" paddingAngle={2}>
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(v) => [formatCurrency(Number(v)), "Amount"]}
            contentStyle={{ background: "#111827", border: "1px solid #1e293b", borderRadius: 8, fontSize: 12 }}
          />
          <Legend iconSize={8} wrapperStyle={{ fontSize: 11 }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
