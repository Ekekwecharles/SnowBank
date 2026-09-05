"use client";

import { useState } from "react";
import { Eye, EyeOff, Copy, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { formatCurrency, maskAccountNumber } from "@/lib/utils";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface AccountCardProps {
  name: string;
  accountNumber: string;
  balance: number;
  creditTotal?: number;
  debitTotal?: number;
}

export function AccountCard({
  name,
  accountNumber,
  balance,
  creditTotal = 0,
  debitTotal = 0,
}: AccountCardProps) {
  // Balance is shown by default; user can blur/hide it for privacy
  const [balanceVisible, setBalanceVisible] = useState(true);

  // Copies the raw (unmasked) account number to the clipboard
  const copyAccount = () => {
    navigator.clipboard.writeText(accountNumber);
    toast.success("Account number copied!");
  };

  return (
    <div className="relative overflow-hidden rounded-2xl card-gradient p-6 text-white shadow-2xl">
      {/* Decorative background glows, purely visual, sits behind the content */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-white/20 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-blue-400/20 blur-3xl" />
      </div>

      <div className="relative z-10">
        {/* Header: account name/type + logo badge */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <p className="text-blue-300 text-xs font-medium uppercase tracking-wider">
              Personal • NGN
            </p>
            <h3 className="text-lg font-semibold mt-1">{name}</h3>
          </div>
          <div className="h-10 w-10 rounded-lg bg-white/10 flex items-center justify-center border border-white/20">
            <span className="text-sm font-bold">SB</span>
          </div>
        </div>

        {/* Balance section with show/hide toggle */}
        <div className="mb-6">
          <p className="text-blue-300 text-xs mb-1">Available Balance</p>
          <div className="flex items-center gap-3">
            <AnimatePresence mode="wait">
              {/* key change re-triggers the fade/slide transition on toggle */}
              <motion.span
                key={balanceVisible ? "visible" : "hidden"}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className={cn(
                  "text-3xl font-bold",
                  !balanceVisible && "blur-md select-none",
                )}
              >
                {formatCurrency(balance)}
              </motion.span>
            </AnimatePresence>
            <button
              onClick={() => setBalanceVisible((v) => !v)}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
              aria-label={balanceVisible ? "Hide balance" : "Show balance"}
            >
              {balanceVisible ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        {/* Footer row: masked account number on the left, income/spend totals on the right */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-blue-300 text-xs mb-0.5">Account Number</p>
            <div className="flex items-center gap-2">
              {/* Display is always masked, regardless of balanceVisible */}
              <span className="font-mono text-sm">
                {maskAccountNumber(accountNumber)}
              </span>
              <button
                onClick={copyAccount}
                className="p-1 rounded bg-white/10 hover:bg-white/20 transition-colors"
                aria-label="Copy account number"
              >
                <Copy className="h-3 w-3" />
              </button>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="text-right">
              <p className="text-blue-300 text-xs mb-0.5">Income</p>
              <div className="flex items-center gap-1 justify-end">
                <ArrowDownLeft className="h-3 w-3 text-green-400" />
                <span className="text-sm font-medium text-green-400">
                  {formatCurrency(creditTotal)}
                </span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-blue-300 text-xs mb-0.5">Spent</p>
              <div className="flex items-center gap-1 justify-end">
                <ArrowUpRight className="h-3 w-3 text-red-400" />
                <span className="text-sm font-medium text-red-400">
                  {formatCurrency(debitTotal)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
