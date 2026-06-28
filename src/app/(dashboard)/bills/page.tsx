"use client";

import { useState } from "react";
import { Loader2, CheckCircle, Zap, Wifi, Tv } from "lucide-react";
import { toast } from "sonner";
import { billAction } from "@/actions/transfer.actions";
import { PinInput } from "@/components/transfer/PinInput";
import { formatCurrency } from "@/lib/utils";
import { useUser } from "@/hooks/useUser";
import { useQueryClient } from "@tanstack/react-query";

const BILL_CATEGORIES = [
  {
    id: "electricity", label: "Electricity", icon: Zap,
    providers: ["EKEDC (Eko)", "IKEDC (Ikeja)", "AEDC (Abuja)", "PHED", "BEDC", "KEDCO"],
  },
  {
    id: "internet", label: "Internet", icon: Wifi,
    providers: ["Spectranet", "Smile", "MTN Fibre", "Airtel Broadband"],
  },
  {
    id: "cable", label: "Cable TV", icon: Tv,
    providers: ["DSTV", "GOtv", "StarTimes"],
  },
];

export default function BillsPage() {
  const { data: user } = useUser();
  const qc = useQueryClient();
  const [category, setCategory] = useState("");
  const [provider, setProvider] = useState("");
  const [meterNumber, setMeterNumber] = useState("");
  const [amount, setAmount] = useState<number | "">("");
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const selectedCat = BILL_CATEGORIES.find(c => c.id === category);

  const handleSubmit = async () => {
    if (!category || !provider || !meterNumber || !amount) { toast.error("Fill all fields"); return; }
    if (pin.length !== 4) { setPinError("Enter your 4-digit PIN"); return; }
    setPinError("");
    setLoading(true);
    try {
      const res = await billAction({ category, provider, meterNumber, amount: Number(amount), pin });
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
        <h2 className="text-2xl font-bold mb-1">Payment Successful!</h2>
        <p className="text-muted-foreground mb-2">{formatCurrency(Number(amount))} to {provider}</p>
        <button onClick={() => { setDone(false); setPin(""); setAmount(""); setMeterNumber(""); setProvider(""); }} className="mt-6 w-full py-3 rounded-xl bg-primary text-white font-semibold hover:bg-primary/90 transition">
          Pay Another Bill
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto space-y-4">
      <div className="rounded-2xl border border-border bg-card p-6 space-y-5">
        <h2 className="font-semibold">Pay Bills</h2>
        {user && <p className="text-sm text-muted-foreground">Balance: <span className="text-foreground font-medium">{formatCurrency(user.balance)}</span></p>}

        <div>
          <label className="block text-sm font-medium mb-2">Category</label>
          <div className="grid grid-cols-3 gap-2">
            {BILL_CATEGORIES.map(c => {
              const Icon = c.icon;
              return (
                <button key={c.id} onClick={() => { setCategory(c.id); setProvider(""); }} className={`py-3 rounded-xl border-2 text-xs font-medium flex flex-col items-center gap-1 transition-all ${category === c.id ? "border-primary bg-primary/10" : "border-border bg-muted hover:border-primary/50"}`}>
                  <Icon className="h-4 w-4" />
                  {c.label}
                </button>
              );
            })}
          </div>
        </div>

        {selectedCat && (
          <div>
            <label className="block text-sm font-medium mb-1.5">Provider</label>
            <select value={provider} onChange={e => setProvider(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-border bg-muted text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition">
              <option value="">Select provider</option>
              {selectedCat.providers.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium mb-1.5">{category === "cable" ? "IUC Number" : "Meter Number"}</label>
          <input value={meterNumber} onChange={e => setMeterNumber(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-border bg-muted text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition" placeholder="Enter number" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">Amount (₦)</label>
          <input value={amount} onChange={e => setAmount(e.target.value ? Number(e.target.value) : "")} type="number" min={100} className="w-full px-4 py-3 rounded-xl border border-border bg-muted text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition" placeholder="0.00" />
        </div>

        <div>
          <p className="text-sm font-medium text-center mb-3">Enter PIN</p>
          <PinInput value={pin} onChange={setPin} error={pinError} disabled={loading} />
        </div>

        <button onClick={handleSubmit} disabled={loading} className="w-full py-3 rounded-xl bg-primary text-white font-semibold hover:bg-primary/90 disabled:opacity-60 transition flex items-center justify-center gap-2">
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          Pay Now
        </button>
      </div>
    </div>
  );
}
