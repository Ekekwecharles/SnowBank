"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Users, ArrowLeftRight, Trash2, Loader2, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { getInitials, maskAccountNumber } from "@/lib/utils";
import { deleteBeneficiaryAction } from "@/actions/user.actions";
import { toast } from "sonner";
import type { BeneficiaryData } from "@/types";

export default function BeneficiariesPage() {
  const qc = useQueryClient();
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const { data: beneficiaries = [], isLoading } = useQuery<BeneficiaryData[]>({
    queryKey: ["beneficiaries"],
    queryFn: async () => {
      const res = await fetch("/api/user/beneficiaries");
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const { mutate: deleteBen, isPending } = useMutation({
    mutationFn: deleteBeneficiaryAction,
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: ["beneficiaries"] });
      const prev = qc.getQueryData<BeneficiaryData[]>(["beneficiaries"]);
      qc.setQueryData<BeneficiaryData[]>(["beneficiaries"], old => old?.filter(b => b.id !== id) ?? []);
      return { prev };
    },
    onError: (_e, _id, ctx) => {
      if (ctx?.prev) qc.setQueryData(["beneficiaries"], ctx.prev);
      toast.error("Failed to remove beneficiary");
    },
    onSuccess: () => toast.success("Beneficiary removed"),
    onSettled: () => { setConfirmDelete(null); qc.invalidateQueries({ queryKey: ["beneficiaries"] }); },
  });

  if (isLoading) return <div className="flex items-center justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <h1 className="text-xl font-bold">Beneficiaries</h1>

      {beneficiaries.length === 0 ? (
        <div className="text-center py-16">
          <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <Users className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="font-semibold mb-1">No beneficiaries yet</h2>
          <p className="text-sm text-muted-foreground mb-4">Save recipients when making a transfer</p>
          <Link href="/transfer" className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition">
            Make a Transfer
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <AnimatePresence>
            {beneficiaries.map((ben) => (
              <motion.div
                key={ben.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="rounded-xl border border-border bg-card p-4"
              >
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm flex-shrink-0">
                    {getInitials(ben.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{ben.name}</p>
                    <p className="text-xs text-muted-foreground">{ben.bankName}</p>
                    <p className="text-xs text-muted-foreground font-mono">{maskAccountNumber(ben.accountNumber)}</p>
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <Link
                    href={`/transfer?account=${ben.accountNumber}&bank=${ben.bankCode ?? ""}`}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition"
                  >
                    <ArrowLeftRight className="h-3.5 w-3.5" /> Transfer
                  </Link>
                  <button
                    onClick={() => setConfirmDelete(ben.id)}
                    className="py-2 px-3 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-card rounded-2xl border border-border p-6 max-w-sm w-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-full bg-red-500/10 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <h3 className="font-semibold">Remove Beneficiary</h3>
                <p className="text-sm text-muted-foreground">This action cannot be undone.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(null)} className="flex-1 py-2.5 rounded-xl border border-border hover:bg-muted transition text-sm font-medium">Cancel</button>
              <button onClick={() => deleteBen(confirmDelete)} disabled={isPending} className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-medium hover:bg-red-600 disabled:opacity-60 transition flex items-center justify-center gap-1">
                {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />} Remove
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
