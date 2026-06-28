"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, Save, AlertTriangle, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { generateTransactionsAction } from "@/actions/admin.actions";
import { formatCurrency, formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

export default function AdminUserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [genCount, setGenCount] = useState(50);
  const [genLoading, setGenLoading] = useState(false);
  const [form, setForm] = useState<any>({});

  useEffect(() => {
    fetch(`/api/admin/users/${id}`).then(r => r.json()).then(d => {
      setUser(d);
      setForm({
        name: d.name, email: d.email, phone: d.phone ?? "", address: d.address ?? "",
        role: d.role, balance: d.balance, transactionLimit: d.transactionLimit ?? "",
        isRestricted: d.isRestricted, isSuspended: d.isSuspended, newPassword: "",
      });
      setLoading(false);
    });
  }, [id]);

  const save = async () => {
    setSaving(true);
    const res = await fetch(`/api/admin/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, balance: Number(form.balance), transactionLimit: form.transactionLimit ? Number(form.transactionLimit) : null }),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) toast.error(data.error ?? "Failed to save");
    else { setUser(data); toast.success("User updated"); }
  };

  const genTx = async () => {
    setGenLoading(true);
    const res = await generateTransactionsAction(id, genCount);
    setGenLoading(false);
    if ("error" in res) toast.error(res.error);
    else toast.success(`Generated ${res.count} transactions`);
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  if (!user) return <p className="text-red-500">User not found</p>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Edit User</h1>
        <button onClick={() => router.back()} className="text-sm text-muted-foreground hover:text-foreground">← Back</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-xl border border-border bg-card p-5 space-y-3">
          <h2 className="font-semibold">Account Details</h2>
          {[["name", "Full Name", "text"], ["email", "Email", "email"], ["phone", "Phone", "tel"], ["address", "Address", "text"], ["balance", "Balance (₦)", "number"], ["transactionLimit", "Tx Limit (₦, blank = default)", "number"], ["newPassword", "New Password (leave blank to keep)", "password"]].map(([k, label, type]) => (
            <div key={k}>
              <label className="block text-xs text-muted-foreground mb-1">{label}</label>
              <input type={type} value={form[k] ?? ""} onChange={e => setForm((f: any) => ({ ...f, [k]: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-border bg-muted text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
          ))}
          <div>
            <label className="block text-xs text-muted-foreground mb-1">Role</label>
            <select value={form.role} onChange={e => setForm((f: any) => ({ ...f, role: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-border bg-muted text-sm">
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-card p-5 space-y-3">
            <h2 className="font-semibold">Account Status</h2>
            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <p className="text-sm font-medium">Restricted</p>
                <p className="text-xs text-muted-foreground">Blocks transfers & dashboard</p>
              </div>
              <button onClick={() => setForm((f: any) => ({ ...f, isRestricted: !f.isRestricted }))} className={cn("relative h-6 w-11 rounded-full transition-colors", form.isRestricted ? "bg-red-500" : "bg-muted")}>
                <div className={cn("absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-transform", form.isRestricted ? "translate-x-6" : "translate-x-1")} />
              </button>
            </label>
            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <p className="text-sm font-medium">Suspended</p>
                <p className="text-xs text-muted-foreground">Prevents all logins</p>
              </div>
              <button onClick={() => setForm((f: any) => ({ ...f, isSuspended: !f.isSuspended }))} className={cn("relative h-6 w-11 rounded-full transition-colors", form.isSuspended ? "bg-orange-500" : "bg-muted")}>
                <div className={cn("absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-transform", form.isSuspended ? "translate-x-6" : "translate-x-1")} />
              </button>
            </label>
          </div>

          <div className="rounded-xl border border-border bg-card p-5">
            <h2 className="font-semibold mb-3">Generate Transactions</h2>
            <div className="flex gap-2">
              <input type="number" min={10} max={500} value={genCount} onChange={e => setGenCount(Number(e.target.value))} className="flex-1 px-3 py-2 rounded-lg border border-border bg-muted text-sm focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Count (10-500)" />
              <button onClick={genTx} disabled={genLoading} className="px-4 py-2 rounded-lg bg-purple-600 text-white text-sm font-medium hover:bg-purple-700 disabled:opacity-60 transition flex items-center gap-1.5">
                {genLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                Generate
              </button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">Replaces previously generated transactions only.</p>
          </div>
        </div>
      </div>

      <button onClick={save} disabled={saving} className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-semibold hover:bg-primary/90 disabled:opacity-60 transition">
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
        Save Changes
      </button>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h2 className="font-semibold">Recent Transactions ({user.transactions?.length ?? 0})</h2>
        </div>
        <div className="divide-y divide-border max-h-72 overflow-y-auto scrollbar-thin">
          {user.transactions?.slice(0, 20).map((tx: any) => (
            <div key={tx.id} className="flex items-center justify-between px-5 py-3">
              <div>
                <p className="text-sm truncate max-w-[200px]">{tx.description}</p>
                <p className="text-xs text-muted-foreground">{formatDate(tx.createdAt)}</p>
              </div>
              <span className={cn("text-sm font-medium", tx.direction === "credit" ? "text-green-500" : "text-red-500")}>
                {tx.direction === "credit" ? "+" : "-"}{formatCurrency(tx.amount)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
