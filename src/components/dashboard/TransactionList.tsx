"use client";

import Link from "next/link";
import { ArrowUpRight, ArrowDownLeft, ArrowLeftRight, Phone, Zap, PiggyBank } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { TransactionData } from "@/types";

const typeIcons: Record<string, React.ElementType> = {
  transfer: ArrowLeftRight,
  airtime: Phone,
  bill: Zap,
  deposit: PiggyBank,
  withdrawal: ArrowUpRight,
};

interface TransactionListProps {
  transactions: TransactionData[];
  showViewAll?: boolean;
}

export function TransactionList({ transactions, showViewAll = true }: TransactionListProps) {
  if (transactions.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
          <ArrowLeftRight className="h-6 w-6 text-muted-foreground" />
        </div>
        <p className="text-muted-foreground text-sm">No transactions yet</p>
      </div>
    );
  }

  return (
    <div>
      <div className="space-y-1">
        {transactions.map((tx) => {
          const Icon = typeIcons[tx.type] ?? ArrowLeftRight;
          const isCredit = tx.direction === "credit";
          return (
            <div
              key={tx.id}
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors cursor-default"
            >
              <div className={cn(
                "h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0",
                isCredit ? "bg-green-500/10" : "bg-red-500/10"
              )}>
                {isCredit
                  ? <ArrowDownLeft className="h-4 w-4 text-green-500" />
                  : <Icon className="h-4 w-4 text-red-500" />
                }
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{tx.description}</p>
                <p className="text-xs text-muted-foreground">{formatDate(tx.createdAt)}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className={cn("text-sm font-semibold", isCredit ? "text-green-500" : "text-red-500")}>
                  {isCredit ? "+" : "-"}{formatCurrency(tx.amount)}
                </p>
                <p className="text-xs text-muted-foreground capitalize">{tx.status}</p>
              </div>
            </div>
          );
        })}
      </div>
      {showViewAll && (
        <div className="mt-3 text-center">
          <Link href="/transactions" className="text-sm text-primary hover:underline">
            View all transactions →
          </Link>
        </div>
      )}
    </div>
  );
}
