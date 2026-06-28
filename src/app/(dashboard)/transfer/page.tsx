"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, CheckCircle, ChevronLeft, Download } from "lucide-react";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { transferAction } from "@/actions/transfer.actions";
import { PinInput } from "@/components/transfer/PinInput";
import { formatCurrency } from "@/lib/utils";
import { transferStep1Schema, transferStep2Schema, type TransferStep1Input, type TransferStep2Input } from "@/lib/validations";
import confetti from "canvas-confetti";
import { useUser } from "@/hooks/useUser";

interface BankOption { id: string; name: string; code: string; }

const stepVariants = {
  initial: { opacity: 0, x: 30 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -30 },
};

export default function TransferPage() {
  const { data: session } = useSession();
  const { data: user } = useUser();
  const [step, setStep] = useState(1);
  const [banks, setBanks] = useState<BankOption[]>([]);
  const [accountName, setAccountName] = useState("");
  const [accountLoading, setAccountLoading] = useState(false);
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ reference: string; newBalance: number } | null>(null);

  const [step1Data, setStep1Data] = useState<TransferStep1Input & { receiverName: string; bankName: string } | null>(null);
  const [step2Data, setStep2Data] = useState<TransferStep2Input | null>(null);

  const form1 = useForm<TransferStep1Input>({ resolver: zodResolver(transferStep1Schema) });
  const form2 = useForm<TransferStep2Input>({ resolver: zodResolver(transferStep2Schema) });

  useEffect(() => {
    fetch("/api/admin/settings").then(r => r.json()).then(d => setBanks(d.banks ?? []));
  }, []);

  const accountNumber = form1.watch("accountNumber");
  const bankCode = form1.watch("bankCode");

  useEffect(() => {
    if (accountNumber?.length === 10 && bankCode) {
      setAccountLoading(true);
      fetch(`/api/transfer?accountNumber=${accountNumber}`)
        .then(r => r.json())
        .then(d => { setAccountName(d.ownerName ?? ""); if (!d.ownerName) form1.setError("accountNumber", { message: "Account not found" }); })
        .catch(() => setAccountName(""))
        .finally(() => setAccountLoading(false));
    } else {
      setAccountName("");
    }
  }, [accountNumber, bankCode]);

  const onStep1 = form1.handleSubmit((data) => {
    if (!accountName) { toast.error("Verify account number first"); return; }
    const bank = banks.find(b => b.code === data.bankCode);
    setStep1Data({ ...data, receiverName: accountName, bankName: bank?.name ?? "" });
    setStep(2);
  });

  const onStep2 = form2.handleSubmit((data) => {
    if (!user || data.amount > user.balance) { toast.error("Insufficient balance"); return; }
    setStep2Data(data);
    setStep(3);
  });

  const onSubmit = async () => {
    if (!step1Data || !step2Data || pin.length !== 4) { setPinError("Enter your 4-digit PIN"); return; }
    setLoading(true);
    setPinError("");
    try {
      const res = await transferAction({
        accountNumber: step1Data.accountNumber,
        bankCode: step1Data.bankCode,
        bankName: step1Data.bankName,
        receiverName: step1Data.receiverName,
        amount: step2Data.amount,
        narration: step2Data.narration ?? "",
        pin,
        saveAsBeneficiary: step1Data.saveAsBeneficiary,
      });
      if (res.error) { setPinError(res.error); return; }
      setResult({ reference: res.reference!, newBalance: res.newBalance! });
      setStep(4);
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 }, colors: ["#2563eb", "#7c3aed", "#22c55e"] });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          {step > 1 && step < 4 && (
            <button onClick={() => setStep(s => s - 1)} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
              <ChevronLeft className="h-5 w-5" />
            </button>
          )}
          <div>
            <h1 className="text-xl font-bold">Send Money</h1>
            {step < 4 && <p className="text-sm text-muted-foreground">Step {step} of 3</p>}
          </div>
        </div>
        {step < 4 && (
          <div className="flex gap-2">
            {[1, 2, 3].map(s => (
              <div key={s} className={`flex-1 h-1 rounded-full transition-colors ${s <= step ? "bg-primary" : "bg-muted"}`} />
            ))}
          </div>
        )}
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div key="step1" variants={stepVariants} initial="initial" animate="animate" exit="exit">
            <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
              <h2 className="font-semibold">Recipient Details</h2>
              <div>
                <label className="block text-sm font-medium mb-1.5">Account Number</label>
                <input
                  {...form1.register("accountNumber")}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-muted text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition"
                  placeholder="10-digit account number"
                  maxLength={10}
                />
                {form1.formState.errors.accountNumber && <p className="mt-1 text-xs text-red-500">{form1.formState.errors.accountNumber.message}</p>}
                {accountLoading && <p className="mt-1 text-xs text-muted-foreground flex items-center gap-1"><Loader2 className="h-3 w-3 animate-spin" /> Verifying...</p>}
                {accountName && <p className="mt-1 text-xs text-green-400 font-medium">✓ {accountName}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Bank</label>
                <select {...form1.register("bankCode")} className="w-full px-4 py-3 rounded-xl border border-border bg-muted text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition">
                  <option value="">Select bank</option>
                  {banks.map(b => <option key={b.id} value={b.code}>{b.name}</option>)}
                </select>
                {form1.formState.errors.bankCode && <p className="mt-1 text-xs text-red-500">{form1.formState.errors.bankCode.message}</p>}
              </div>
              <div className="flex items-center gap-2">
                <input {...form1.register("saveAsBeneficiary")} type="checkbox" id="save" className="rounded" />
                <label htmlFor="save" className="text-sm">Save as beneficiary</label>
              </div>
              <button onClick={onStep1} className="w-full py-3 rounded-xl bg-primary text-white font-semibold hover:bg-primary/90 transition">
                Continue
              </button>
            </div>
          </motion.div>
        )}

        {step === 2 && step1Data && (
          <motion.div key="step2" variants={stepVariants} initial="initial" animate="animate" exit="exit">
            <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
              <h2 className="font-semibold">Amount & Narration</h2>
              <div className="p-3 rounded-xl bg-muted text-sm">
                <p className="text-muted-foreground">To: <span className="text-foreground font-medium">{step1Data.receiverName}</span></p>
                <p className="text-muted-foreground">Bank: <span className="text-foreground">{step1Data.bankName}</span></p>
              </div>
              {user && (
                <p className="text-sm text-muted-foreground">Balance: <span className="text-foreground font-medium">{formatCurrency(user.balance)}</span></p>
              )}
              <div>
                <label className="block text-sm font-medium mb-1.5">Amount (₦)</label>
                <input
                  {...form2.register("amount", { valueAsNumber: true })}
                  type="number"
                  min={1}
                  step={0.01}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-muted text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition"
                  placeholder="0.00"
                />
                {form2.formState.errors.amount && <p className="mt-1 text-xs text-red-500">{form2.formState.errors.amount.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Narration (optional)</label>
                <input
                  {...form2.register("narration")}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-muted text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition"
                  placeholder="What's this for?"
                  maxLength={100}
                />
              </div>
              <button onClick={onStep2} className="w-full py-3 rounded-xl bg-primary text-white font-semibold hover:bg-primary/90 transition">
                Review Transfer
              </button>
            </div>
          </motion.div>
        )}

        {step === 3 && step1Data && step2Data && (
          <motion.div key="step3" variants={stepVariants} initial="initial" animate="animate" exit="exit">
            <div className="rounded-2xl border border-border bg-card p-6 space-y-6">
              <h2 className="font-semibold">Confirm Transfer</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between py-2 border-b border-border"><span className="text-muted-foreground">To</span><span className="font-medium">{step1Data.receiverName}</span></div>
                <div className="flex justify-between py-2 border-b border-border"><span className="text-muted-foreground">Bank</span><span>{step1Data.bankName}</span></div>
                <div className="flex justify-between py-2 border-b border-border"><span className="text-muted-foreground">Amount</span><span className="font-bold text-lg">{formatCurrency(step2Data.amount)}</span></div>
                <div className="flex justify-between py-2 border-b border-border"><span className="text-muted-foreground">Fee</span><span className="text-green-500">₦0.00</span></div>
                {step2Data.narration && <div className="flex justify-between py-2"><span className="text-muted-foreground">Narration</span><span>{step2Data.narration}</span></div>}
              </div>
              <div>
                <p className="text-sm font-medium text-center mb-4">Enter your 4-digit PIN</p>
                <PinInput value={pin} onChange={setPin} error={pinError} disabled={loading} />
              </div>
              <button onClick={onSubmit} disabled={loading || pin.length !== 4} className="w-full py-3 rounded-xl bg-primary text-white font-semibold hover:bg-primary/90 disabled:opacity-60 transition flex items-center justify-center gap-2">
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                {loading ? "Processing..." : "Send Money"}
              </button>
            </div>
          </motion.div>
        )}

        {step === 4 && result && step1Data && step2Data && (
          <motion.div key="step4" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-8">
            <div className="h-20 w-20 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-10 w-10 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold mb-1">Transfer Successful!</h2>
            <p className="text-muted-foreground mb-6">Your money has been sent to {step1Data.receiverName}</p>
            <div className="rounded-xl border border-border bg-card p-4 text-sm text-left mb-6 space-y-2">
              <div className="flex justify-between"><span className="text-muted-foreground">Reference</span><span className="font-mono text-xs">{result.reference}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Amount</span><span className="font-bold">{formatCurrency(step2Data.amount)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">New Balance</span><span>{formatCurrency(result.newBalance)}</span></div>
            </div>
            <button onClick={() => { setStep(1); setPin(""); setResult(null); setStep1Data(null); setStep2Data(null); form1.reset(); form2.reset(); }} className="w-full py-3 rounded-xl bg-primary text-white font-semibold hover:bg-primary/90 transition">
              New Transfer
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
