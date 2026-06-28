import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { AccountCard } from "@/components/dashboard/AccountCard";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { TransactionList } from "@/components/dashboard/TransactionList";
import { BalanceTrendChart } from "@/components/dashboard/BalanceTrendChart";
import { SpendingChart } from "@/components/dashboard/SpendingChart";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const userId = (session.user as any).id;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true, accountNumber: true, balance: true },
  });
  if (!user) redirect("/login");

  const transactions = await prisma.transaction.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  const recent = transactions.slice(0, 5);
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const thisMonth = transactions.filter((t) => new Date(t.createdAt) >= monthStart);
  const creditTotal = thisMonth.filter((t) => t.direction === "credit").reduce((s, t) => s + t.amount, 0);
  const debitTotal = thisMonth.filter((t) => t.direction === "debit").reduce((s, t) => s + t.amount, 0);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <AccountCard
        name={user.name}
        accountNumber={user.accountNumber}
        balance={user.balance}
        creditTotal={creditTotal}
        debitTotal={debitTotal}
      />

      <QuickActions />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-border bg-card p-5">
          <BalanceTrendChart transactions={transactions as any} currentBalance={user.balance} />
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <SpendingChart transactions={transactions as any} />
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">Recent Transactions</h2>
        </div>
        <TransactionList transactions={recent as any} showViewAll={true} />
      </div>
    </div>
  );
}
