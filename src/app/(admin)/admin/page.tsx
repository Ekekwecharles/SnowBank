import { getAdminStatsAction } from "@/actions/admin.actions";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Users, Receipt, DollarSign, AlertTriangle } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const stats = await getAdminStatsAction();
  if ("error" in stats) return <p className="text-red-500">{stats.error}</p>;

  const cards = [
    { label: "Total Users", value: stats.totalUsers, icon: Users, color: "text-blue-400", bg: "bg-blue-400/10" },
    { label: "Tx Today", value: stats.totalTxToday, icon: Receipt, color: "text-purple-400", bg: "bg-purple-400/10" },
    { label: "Volume Today", value: formatCurrency(stats.totalVolumeToday), icon: DollarSign, color: "text-green-400", bg: "bg-green-400/10" },
    { label: "Restricted", value: stats.restricted, icon: AlertTriangle, color: "text-red-400", bg: "bg-red-400/10" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">Admin Overview</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="rounded-xl border border-border bg-card p-4">
            <div className={`h-10 w-10 rounded-lg ${bg} flex items-center justify-center mb-3`}>
              <Icon className={`h-5 w-5 ${color}`} />
            </div>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="font-semibold">Recent Registrations</h2>
          <Link href="/admin/users" className="text-xs text-primary hover:underline">View all</Link>
        </div>
        <div className="divide-y divide-border">
          {stats.recentUsers.map(u => (
            <Link key={u.id} href={`/admin/users/${u.id}`} className="flex items-center justify-between px-5 py-3 hover:bg-muted/50 transition-colors">
              <div>
                <p className="text-sm font-medium">{u.name}</p>
                <p className="text-xs text-muted-foreground">{u.email}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">{formatCurrency(u.balance)}</p>
                <p className="text-xs text-muted-foreground">{formatDate(u.createdAt)}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
