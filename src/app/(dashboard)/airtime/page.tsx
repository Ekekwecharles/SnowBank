"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { airtimeAction } from "@/actions/transfer.actions";
import { PinInput } from "@/components/transfer/PinInput";
import { formatCurrency } from "@/lib/utils";
import { useUser } from "@/hooks/useUser";
import { useQueryClient } from "@tanstack/react-query";

const NETWORKS = [
  { id: "MTN", label: "MTN", color: "bg-yellow-400" },
  { id: "Airtel", label: "Airtel", color: "bg-red-500" },
  { id: "Glo", label: "Glo", color: "bg-green-500" },
  { id: "9mobile", label: "9mobile", color: "bg-teal-500" },
] as const;

const PRESETS = [100, 200, 500, 1000];

export default function AirtimePage() {
  const { data: user } = useUser();
  const qc = useQueryClient();
  const [network, setNetwork] = useState<string>("");
  const [phone, setPhone] = useState("");
  const [amount, setAmount] = useState<number | "">("");
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async () => {
    if (!network) { toast.error("Select a network"); return; }
    if (!phone) { toast.error("Enter phone number"); return; }
    if (!amount || Number(amount) < 50) { toast.error("Minimum ₦50"); return; }
    if (pin.length !== 4) { setPinError("Enter your 4-digit PIN"); return; }
    setPinError("");
    setLoading(true);
    try {
      const res = await airtimeAction({ network: network as any, phone, amount: Number(amount), pin });
      if (res.error) { setPinError(res.error); return; }
      setDone(true);
      qc.invalidateQueries({ queryKey: ["user"] });
      qc.invalidateQueries({ queryKey: ["transactions"] });
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="max-w-md mx-auto text-center py-8">
        <div className="h-20 w-20 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="h-10 w-10 text-green-500" />
        </div>
        <h2 className="text-2xl font-bold mb-1">Airtime Sent!</h2>
        <p className="text-muted-foreground mb-2">{formatCurrency(Number(amount))} {network} to {phone}</p>
        <button onClick={() => { setDone(false); setPin(""); setAmount(""); setPhone(""); }} className="mt-6 w-full py-3 rounded-xl bg-primary text-white font-semibold hover:bg-primary/90 transition">
          Buy More
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto space-y-4">
      <div className="rounded-2xl border border-border bg-card p-6 space-y-5">
        <h2 className="font-semibold">Buy Airtime</h2>
        {user && <p className="text-sm text-muted-foreground">Balance: <span className="text-foreground font-medium">{formatCurrency(user.balance)}</span></p>}

        <div>
          <label className="block text-sm font-medium mb-2">Select Network</label>
          <div className="grid grid-cols-4 gap-2">
            {NETWORKS.map(n => (
              <button key={n.id} onClick={() => setNetwork(n.id)} className={`py-3 rounded-xl border-2 text-xs font-bold transition-all ${network === n.id ? "border-primary bg-primary/10" : "border-border bg-muted hover:border-muted-foreground"}`}>
                <div className={`h-3 w-3 rounded-full ${n.color} mx-auto mb-1`} />
                {n.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">Phone Number</label>
          <input value={phone} onChange={e => setPhone(e.target.value)} type="tel" className="w-full px-4 py-3 rounded-xl border border-border bg-muted text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition" placeholder="08012345678" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Amount (₦)</label>
          <div className="grid grid-cols-4 gap-2 mb-2">
            {PRESETS.map(p => (
              <button key={p} onClick={() => setAmount(p)} className={`py-2 rounded-xl border text-sm font-medium transition-all ${amount === p ? "border-primary bg-primary/10 text-primary" : "border-border bg-muted hover:border-primary/50"}`}>
                ₦{p}
              </button>
            ))}
          </div>
          <input value={amount} onChange={e => setAmount(e.target.value ? Number(e.target.value) : "")} type="number" min={50} className="w-full px-4 py-3 rounded-xl border border-border bg-muted text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition" placeholder="Custom amount" />
        </div>

        <div>
          <p className="text-sm font-medium text-center mb-3">Enter PIN</p>
          <PinInput value={pin} onChange={setPin} error={pinError} disabled={loading} />
        </div>

        <button onClick={handleSubmit} disabled={loading} className="w-full py-3 rounded-xl bg-primary text-white font-semibold hover:bg-primary/90 disabled:opacity-60 transition flex items-center justify-center gap-2">
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          Buy Airtime
        </button>
      </div>
    </div>
  );
}
