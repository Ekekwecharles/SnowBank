"use client";

import { useState, useEffect } from "react";
import { Loader2, Save, Plus, Trash2, Edit2 } from "lucide-react";
import { toast } from "sonner";

export default function AdminSettingsPage() {
  const [tab, setTab] = useState<"general" | "banks" | "accounts">("general");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/settings").then(r => r.json()).then(d => { setData(d); setLoading(false); });
  }, []);

  const refresh = () => fetch("/api/admin/settings").then(r => r.json()).then(d => setData(d));

  const saveSettings = async () => {
    setSaving(true);
    const res = await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "settings", data: data.settings }),
    });
    setSaving(false);
    if (res.ok) toast.success("Settings saved");
    else toast.error("Failed to save");
  };

  const bankAction = async (action: string, bankData: any) => {
    const res = await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, data: bankData }),
    });
    if (res.ok) { toast.success("Done"); refresh(); }
    else toast.error("Failed");
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  return (
    <div className="max-w-3xl space-y-4">
      <h1 className="text-xl font-bold">System Settings</h1>
      <div className="flex gap-1 rounded-xl bg-muted p-1">
        {(["general", "banks", "accounts"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} className={`flex-1 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${tab === t ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>{t}</button>
        ))}
      </div>

      {tab === "general" && data.settings && (
        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Default Transaction Limit (₦)</label>
            <input type="number" value={data.settings.defaultTransactionLimit} onChange={e => setData((d: any) => ({ ...d, settings: { ...d.settings, defaultTransactionLimit: Number(e.target.value) } }))} className="w-full px-4 py-3 rounded-xl border border-border bg-muted text-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Transfer Fee (%)</label>
            <input type="number" min={0} max={100} step={0.1} value={data.settings.transferFeePercent} onChange={e => setData((d: any) => ({ ...d, settings: { ...d.settings, transferFeePercent: Number(e.target.value) } }))} className="w-full px-4 py-3 rounded-xl border border-border bg-muted text-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>
          <label className="flex items-center justify-between">
            <div>
              <p className="font-medium">Maintenance Mode</p>
              <p className="text-sm text-muted-foreground">Disable all banking operations</p>
            </div>
            <button onClick={() => setData((d: any) => ({ ...d, settings: { ...d.settings, maintenanceMode: !d.settings.maintenanceMode } }))} className={`relative h-6 w-11 rounded-full transition-colors ${data.settings.maintenanceMode ? "bg-red-500" : "bg-muted"}`}>
              <div className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-transform ${data.settings.maintenanceMode ? "translate-x-6" : "translate-x-1"}`} />
            </button>
          </label>
          <button onClick={saveSettings} disabled={saving} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white font-medium hover:bg-primary/90 disabled:opacity-60 transition">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save
          </button>
        </div>
      )}

      {tab === "banks" && (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h2 className="font-semibold">Banks ({data.banks?.length ?? 0})</h2>
            <button
              onClick={() => {
                const name = prompt("Bank name:");
                const code = prompt("Bank code:");
                if (name && code) bankAction("bank-create", { name, code, isActive: true });
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-sm hover:bg-primary/20 transition"
            >
              <Plus className="h-4 w-4" /> Add Bank
            </button>
          </div>
          <div className="divide-y divide-border max-h-96 overflow-y-auto scrollbar-thin">
            {data.banks?.map((bank: any) => (
              <div key={bank.id} className="flex items-center justify-between px-5 py-3">
                <div>
                  <p className="text-sm font-medium">{bank.name}</p>
                  <p className="text-xs text-muted-foreground">{bank.code}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${bank.isActive ? "bg-green-500/10 text-green-500" : "bg-muted text-muted-foreground"}`}>{bank.isActive ? "Active" : "Inactive"}</span>
                  <button onClick={() => bankAction("bank-delete", { id: bank.id })} className="p-1.5 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "accounts" && (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h2 className="font-semibold">Acceptable Accounts ({data.accounts?.length ?? 0})</h2>
            <button
              onClick={() => {
                const accountNumber = prompt("Account number (10 digits):");
                const ownerName = prompt("Owner name:");
                const bankName = prompt("Bank name:");
                const bankCode = prompt("Bank code:");
                if (accountNumber && ownerName && bankName && bankCode) {
                  bankAction("account-create", { accountNumber, ownerName, bankName, bankCode, isActive: true });
                }
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-sm hover:bg-primary/20 transition"
            >
              <Plus className="h-4 w-4" /> Add Account
            </button>
          </div>
          <div className="divide-y divide-border max-h-96 overflow-y-auto scrollbar-thin">
            {data.accounts?.map((acc: any) => (
              <div key={acc.id} className="flex items-center justify-between px-5 py-3">
                <div>
                  <p className="text-sm font-medium">{acc.ownerName}</p>
                  <p className="text-xs text-muted-foreground font-mono">{acc.accountNumber} • {acc.bankName}</p>
                </div>
                <button onClick={() => bankAction("account-delete", { id: acc.id })} className="p-1.5 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
