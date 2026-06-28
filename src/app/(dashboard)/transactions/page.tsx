"use client";

import { useState } from "react";
import { useTransactions } from "@/hooks/useTransactions";
import { TransactionList } from "@/components/dashboard/TransactionList";
import { Search, Filter, Download, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

export default function TransactionsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [direction, setDirection] = useState("");
  const [status, setStatus] = useState("");
  const [sortBy, setSortBy] = useState("date-desc");
  const [expanded, setExpanded] = useState<string | null>(null);

  const { data, isLoading } = useTransactions({ page, pageSize: 20, search, type, direction, status, sortBy });

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Transactions</h1>
      </div>

      <div className="rounded-xl border border-border bg-card p-4 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-border bg-muted text-sm focus:outline-none focus:ring-2 focus:ring-primary transition"
              placeholder="Search transactions..."
            />
          </div>
          <select value={type} onChange={e => { setType(e.target.value); setPage(1); }} className="px-3 py-2.5 rounded-lg border border-border bg-muted text-sm focus:outline-none focus:ring-2 focus:ring-primary">
            <option value="">All Types</option>
            <option value="transfer">Transfer</option>
            <option value="airtime">Airtime</option>
            <option value="bill">Bill</option>
            <option value="deposit">Deposit</option>
          </select>
          <select value={direction} onChange={e => { setDirection(e.target.value); setPage(1); }} className="px-3 py-2.5 rounded-lg border border-border bg-muted text-sm focus:outline-none focus:ring-2 focus:ring-primary">
            <option value="">All</option>
            <option value="credit">Credit</option>
            <option value="debit">Debit</option>
          </select>
          <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="px-3 py-2.5 rounded-lg border border-border bg-muted text-sm focus:outline-none focus:ring-2 focus:ring-primary">
            <option value="date-desc">Newest</option>
            <option value="date-asc">Oldest</option>
            <option value="amount-desc">Amount ↓</option>
            <option value="amount-asc">Amount ↑</option>
          </select>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : !data?.data.length ? (
          <div className="text-center py-16 text-muted-foreground text-sm">No transactions found</div>
        ) : (
          <>
            <div className="divide-y divide-border">
              {data.data.map((tx) => (
                <div key={tx.id}>
                  <button
                    onClick={() => setExpanded(expanded === tx.id ? null : tx.id)}
                    className="w-full flex items-center gap-3 p-4 hover:bg-muted/50 transition-colors text-left"
                  >
                    <div className={cn("h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold", tx.direction === "credit" ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500")}>
                      {tx.direction === "credit" ? "+" : "-"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{tx.description}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(tx.createdAt)}</p>
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
                    <div className="px-4 pb-4 bg-muted/30 grid grid-cols-2 gap-2 text-xs">
                      <div><span className="text-muted-foreground">Reference</span><p className="font-mono">{tx.reference}</p></div>
                      <div><span className="text-muted-foreground">Type</span><p className="capitalize">{tx.type}</p></div>
                      {tx.receiverName && <div><span className="text-muted-foreground">To</span><p>{tx.receiverName}</p></div>}
                      {tx.receiverBank && <div><span className="text-muted-foreground">Bank</span><p>{tx.receiverBank}</p></div>}
                      {tx.senderName && <div><span className="text-muted-foreground">From</span><p>{tx.senderName}</p></div>}
                      <div><span className="text-muted-foreground">Balance After</span><p>{formatCurrency(tx.balanceAfterTx)}</p></div>
                      {tx.category && <div><span className="text-muted-foreground">Category</span><p className="capitalize">{tx.category}</p></div>}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {data.totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-border">
                <p className="text-xs text-muted-foreground">Page {page} of {data.totalPages} ({data.total} total)</p>
                <div className="flex gap-2">
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-1.5 rounded-lg hover:bg-muted disabled:opacity-40 transition-colors">
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button onClick={() => setPage(p => Math.min(data.totalPages, p + 1))} disabled={page === data.totalPages} className="p-1.5 rounded-lg hover:bg-muted disabled:opacity-40 transition-colors">
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
