"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function AdminTransactionsPage() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [type, setType] = useState("");
  const [status, setStatus] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-transactions", page, type, status],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), pageSize: "20" });
      if (type) params.set("type", type);
      if (status) params.set("status", status);
      const res = await fetch(`/api/admin/transactions?${params}`);
      return res.json();
    },
  });

  const { mutate: updateStatus } = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await fetch("/api/admin/transactions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      return res.json();
    },
    onSuccess: () => { toast.success("Transaction updated"); qc.invalidateQueries({ queryKey: ["admin-transactions"] }); },
    onError: () => toast.error("Failed to update"),
  });

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">All Transactions</h1>
      <div className="flex gap-3">
        <select value={type} onChange={e => { setType(e.target.value); setPage(1); }} className="px-3 py-2.5 rounded-lg border border-border bg-muted text-sm">
          <option value="">All Types</option>
          <option value="transfer">Transfer</option>
          <option value="airtime">Airtime</option>
          <option value="bill">Bill</option>
          <option value="deposit">Deposit</option>
        </select>
        <select value={status} onChange={e => { setStatus(e.target.value); setPage(1); }} className="px-3 py-2.5 rounded-lg border border-border bg-muted text-sm">
          <option value="">All Status</option>
          <option value="success">Success</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
        </select>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : !data?.data?.length ? (
          <div className="text-center py-12 text-sm text-muted-foreground">No transactions</div>
        ) : (
          <>
            <div className="divide-y divide-border">
              {data.data.map((tx: any) => (
                <div key={tx.id}>
                  <button onClick={() => setExpanded(expanded === tx.id ? null : tx.id)} className="w-full flex items-center gap-3 p-4 hover:bg-muted/50 transition-colors text-left">
                    <div className={cn("h-9 w-9 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold", tx.direction === "credit" ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500")}>
                      {tx.direction === "credit" ? "+" : "-"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{tx.description}</p>
                      <p className="text-xs text-muted-foreground">{tx.user?.name} • {formatDate(tx.createdAt)}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className={cn("text-sm font-semibold", tx.direction === "credit" ? "text-green-500" : "text-red-500")}>
                        {tx.direction === "credit" ? "+" : "-"}{formatCurrency(tx.amount)}
                      </p>
                      <span className={cn("text-xs px-1.5 py-0.5 rounded-full", tx.status === "success" ? "bg-green-500/10 text-green-500" : tx.status === "pending" ? "bg-yellow-500/10 text-yellow-500" : "bg-red-500/10 text-red-500")}>
                        {tx.status}
                      </span>
                    </div>
                  </button>
                  {expanded === tx.id && (
                    <div className="px-4 pb-4 bg-muted/30">
                      <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                        <div><span className="text-muted-foreground">Ref</span><p className="font-mono">{tx.reference}</p></div>
                        <div><span className="text-muted-foreground">User</span><p>{tx.user?.email}</p></div>
                        <div><span className="text-muted-foreground">Type</span><p className="capitalize">{tx.type}</p></div>
                        <div><span className="text-muted-foreground">Currency</span><p>{tx.currency}</p></div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => updateStatus({ id: tx.id, status: "failed" })} className="px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 text-xs hover:bg-red-500/20 transition">Mark Failed</button>
                        <button onClick={() => updateStatus({ id: tx.id, status: "reversed" })} className="px-3 py-1.5 rounded-lg bg-yellow-500/10 text-yellow-400 text-xs hover:bg-yellow-500/20 transition">Mark Reversed</button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
            {data.totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-border">
                <p className="text-xs text-muted-foreground">Page {page} of {data.totalPages}</p>
                <div className="flex gap-2">
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-1.5 rounded-lg hover:bg-muted disabled:opacity-40"><ChevronLeft className="h-4 w-4" /></button>
                  <button onClick={() => setPage(p => Math.min(data.totalPages, p + 1))} disabled={page === data.totalPages} className="p-1.5 rounded-lg hover:bg-muted disabled:opacity-40"><ChevronRight className="h-4 w-4" /></button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
