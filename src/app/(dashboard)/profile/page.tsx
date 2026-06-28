"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, CheckCircle, User, Lock, Shield } from "lucide-react";
import { toast } from "sonner";
import { updateProfileAction, changePasswordAction, setPinAction } from "@/actions/user.actions";
import { PinInput } from "@/components/transfer/PinInput";
import { profileUpdateSchema, changePasswordSchema, setPinSchema, type ProfileUpdateInput, type ChangePasswordInput, type SetPinInput } from "@/lib/validations";
import { useUser } from "@/hooks/useUser";
import { useQueryClient } from "@tanstack/react-query";

export default function ProfilePage() {
  const { data: user, isLoading } = useUser();
  const qc = useQueryClient();
  const [tab, setTab] = useState<"profile" | "password" | "pin">("profile");
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [pinLoading, setPinLoading] = useState(false);

  const profileForm = useForm<ProfileUpdateInput>({ resolver: zodResolver(profileUpdateSchema) });
  const pwForm = useForm<ChangePasswordInput>({ resolver: zodResolver(changePasswordSchema) });
  const pinForm = useForm<SetPinInput>({ resolver: zodResolver(setPinSchema) });

  if (isLoading) return <div className="flex items-center justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  if (!user) return null;

  const onProfileSubmit = profileForm.handleSubmit(async (data) => {
    const res = await updateProfileAction(data);
    if (res.error) toast.error(res.error);
    else { toast.success("Profile updated!"); qc.invalidateQueries({ queryKey: ["user"] }); }
  });

  const onPasswordSubmit = pwForm.handleSubmit(async (data) => {
    const res = await changePasswordAction(data);
    if (res.error) toast.error(res.error);
    else { toast.success("Password changed!"); pwForm.reset(); }
  });

  const onPinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const password = (document.getElementById("pin-password") as HTMLInputElement).value;
    if (pin.length !== 4 || confirmPin.length !== 4) { toast.error("Enter 4-digit PIN in both fields"); return; }
    if (pin !== confirmPin) { toast.error("PINs do not match"); return; }
    setPinLoading(true);
    const res = await setPinAction({ pin, confirmPin, password });
    setPinLoading(false);
    if (res.error) toast.error(res.error);
    else { toast.success("PIN set successfully!"); setPin(""); setConfirmPin(""); }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <h1 className="text-xl font-bold">Profile</h1>

      <div className="flex gap-1 rounded-xl bg-muted p-1">
        {([["profile", "Profile", User], ["password", "Password", Lock], ["pin", "PIN", Shield]] as const).map(([id, label, Icon]) => (
          <button key={id} onClick={() => setTab(id)} className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition-colors ${tab === id ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
            <Icon className="h-4 w-4" />{label}
          </button>
        ))}
      </div>

      {tab === "profile" && (
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-16 w-16 rounded-full bg-primary/10 text-primary flex items-center justify-center text-2xl font-bold">
              {user.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h2 className="font-semibold text-lg">{user.name}</h2>
              <p className="text-sm text-muted-foreground">{user.email}</p>
              {user.emailVerified && (
                <div className="flex items-center gap-1 text-xs text-green-500 mt-0.5">
                  <CheckCircle className="h-3 w-3" /> Verified Account
                </div>
              )}
            </div>
          </div>
          <div className="mb-4 p-3 rounded-xl bg-muted/50 text-sm">
            <span className="text-muted-foreground">Account No: </span>
            <span className="font-mono">{user.accountNumber}</span>
          </div>
          <form onSubmit={onProfileSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Full Name</label>
              <input {...profileForm.register("name")} defaultValue={user.name} className="w-full px-4 py-3 rounded-xl border border-border bg-muted text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition" />
              {profileForm.formState.errors.name && <p className="mt-1 text-xs text-red-500">{profileForm.formState.errors.name.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Phone</label>
              <input {...profileForm.register("phone")} defaultValue={user.phone ?? ""} className="w-full px-4 py-3 rounded-xl border border-border bg-muted text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition" placeholder="+2348012345678" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Address</label>
              <textarea {...profileForm.register("address")} defaultValue={user.address ?? ""} rows={2} className="w-full px-4 py-3 rounded-xl border border-border bg-muted text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition resize-none" placeholder="Your address" />
            </div>
            <button type="submit" disabled={profileForm.formState.isSubmitting} className="w-full py-3 rounded-xl bg-primary text-white font-semibold hover:bg-primary/90 disabled:opacity-60 transition flex items-center justify-center gap-2">
              {profileForm.formState.isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Save Changes
            </button>
          </form>
        </div>
      )}

      {tab === "password" && (
        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="font-semibold mb-4">Change Password</h2>
          <form onSubmit={onPasswordSubmit} className="space-y-4">
            {(["currentPassword", "newPassword", "confirmPassword"] as const).map((field) => (
              <div key={field}>
                <label className="block text-sm font-medium mb-1.5 capitalize">{field.replace(/([A-Z])/g, " $1")}</label>
                <input {...pwForm.register(field)} type="password" className="w-full px-4 py-3 rounded-xl border border-border bg-muted text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition" placeholder="••••••••" />
                {pwForm.formState.errors[field] && <p className="mt-1 text-xs text-red-500">{pwForm.formState.errors[field]?.message}</p>}
              </div>
            ))}
            <button type="submit" disabled={pwForm.formState.isSubmitting} className="w-full py-3 rounded-xl bg-primary text-white font-semibold hover:bg-primary/90 disabled:opacity-60 transition flex items-center justify-center gap-2">
              {pwForm.formState.isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Update Password
            </button>
          </form>
        </div>
      )}

      {tab === "pin" && (
        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="font-semibold mb-2">Set Transaction PIN</h2>
          <p className="text-sm text-muted-foreground mb-6">Used to authorize transfers and payments</p>
          <form onSubmit={onPinSubmit} className="space-y-6">
            <div>
              <p className="text-sm font-medium text-center mb-3">New PIN</p>
              <PinInput value={pin} onChange={setPin} />
            </div>
            <div>
              <p className="text-sm font-medium text-center mb-3">Confirm PIN</p>
              <PinInput value={confirmPin} onChange={setConfirmPin} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Account Password (to confirm)</label>
              <input id="pin-password" type="password" className="w-full px-4 py-3 rounded-xl border border-border bg-muted text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition" placeholder="••••••••" />
            </div>
            <button type="submit" disabled={pinLoading} className="w-full py-3 rounded-xl bg-primary text-white font-semibold hover:bg-primary/90 disabled:opacity-60 transition flex items-center justify-center gap-2">
              {pinLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              Set PIN
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
