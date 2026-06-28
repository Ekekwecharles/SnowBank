"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Shield, RefreshCw, DollarSign, Snowflake } from "lucide-react";
import { toast } from "sonner";
import { VirtualCard } from "@/components/virtual-card/VirtualCard";
import { useSession } from "next-auth/react";

export default function CardsPage() {
  const { data: session } = useSession();
  const [frozen, setFrozen] = useState(false);
  const [showNewCardModal, setShowNewCardModal] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);

  const userName = (session?.user as any)?.name ?? "Card Holder";

  return (
    <div className="max-w-md mx-auto space-y-6">
      <h1 className="text-xl font-bold">My Card</h1>

      <VirtualCard name={userName} />

      <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-card">
        <div className="flex items-center gap-2">
          <div className={`h-2.5 w-2.5 rounded-full ${frozen ? "bg-blue-400" : "bg-green-500"} animate-pulse`} />
          <span className="text-sm font-medium">{frozen ? "Frozen" : "Active"}</span>
        </div>
        <span className="text-xs text-muted-foreground">Virtual Debit Card • Visa</span>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <motion.button
          whileHover={{ y: -2 }}
          onClick={() => {
            setFrozen(f => !f);
            toast.success(frozen ? "Card unfrozen" : "Card frozen successfully");
          }}
          className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${frozen ? "border-blue-500/40 bg-blue-500/10 text-blue-400" : "border-border bg-muted hover:border-primary/40"}`}
        >
          <Snowflake className="h-5 w-5" />
          <span className="text-xs font-medium">{frozen ? "Unfreeze" : "Freeze"}</span>
        </motion.button>

        <motion.button
          whileHover={{ y: -2 }}
          onClick={() => setShowNewCardModal(true)}
          className="flex flex-col items-center gap-2 p-4 rounded-xl border border-border bg-muted hover:border-primary/40 transition-all"
        >
          <RefreshCw className="h-5 w-5" />
          <span className="text-xs font-medium">New Card</span>
        </motion.button>

        <motion.button
          whileHover={{ y: -2 }}
          onClick={() => setShowLimitModal(true)}
          className="flex flex-col items-center gap-2 p-4 rounded-xl border border-border bg-muted hover:border-primary/40 transition-all"
        >
          <DollarSign className="h-5 w-5" />
          <span className="text-xs font-medium">Set Limit</span>
        </motion.button>
      </div>

      <div className="rounded-xl border border-border bg-card p-4 space-y-3">
        <div className="flex items-center gap-2 mb-1">
          <Shield className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold">Card Security</span>
        </div>
        {[
          { label: "Online Transactions", enabled: true },
          { label: "International Payments", enabled: false },
          { label: "Contactless Payments", enabled: true },
        ].map(({ label, enabled }) => (
          <div key={label} className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">{label}</span>
            <div className={`h-5 w-10 rounded-full transition-colors ${enabled ? "bg-primary" : "bg-muted-foreground/30"} relative`}>
              <div className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${enabled ? "translate-x-5" : "translate-x-0.5"}`} />
            </div>
          </div>
        ))}
      </div>

      {showNewCardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-card rounded-2xl border border-border p-6 max-w-sm w-full">
            <h3 className="font-semibold mb-2">Request New Card</h3>
            <p className="text-sm text-muted-foreground mb-4">Your current card will be deactivated. A new virtual card will be issued instantly.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowNewCardModal(false)} className="flex-1 py-2.5 rounded-xl border border-border hover:bg-muted transition text-sm">Cancel</button>
              <button onClick={() => { toast.success("New card requested! It will be issued shortly."); setShowNewCardModal(false); }} className="flex-1 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 transition">Confirm</button>
            </div>
          </motion.div>
        </div>
      )}

      {showLimitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-card rounded-2xl border border-border p-6 max-w-sm w-full">
            <h3 className="font-semibold mb-2">Set Spending Limit</h3>
            <input type="number" className="w-full px-4 py-3 rounded-xl border border-border bg-muted mb-3 focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Daily limit (₦)" />
            <div className="flex gap-3">
              <button onClick={() => setShowLimitModal(false)} className="flex-1 py-2.5 rounded-xl border border-border hover:bg-muted transition text-sm">Cancel</button>
              <button onClick={() => { toast.success("Spending limit updated!"); setShowLimitModal(false); }} className="flex-1 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 transition">Save</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
