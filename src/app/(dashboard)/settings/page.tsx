"use client";

import { useState, useEffect } from "react";
import { Moon, Sun, Monitor, LogOut, Loader2 } from "lucide-react";
import { useTheme } from "next-themes";
import { formatDate } from "@/lib/utils";
import { getActivityLogsAction, logoutAction } from "@/actions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type Log = { id: string; action: string; ipAddress?: string | null; userAgent?: string | null; createdAt: Date; };

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const [logs, setLogs] = useState<Log[]>([]);
  const [logsLoading, setLogsLoading] = useState(true);

  useEffect(() => {
    getActivityLogsAction().then(r => { setLogs(r.data as any); setLogsLoading(false); });
  }, []);

  const handleSignOutAll = async () => {
    await logoutAction();
    toast.success("Signed out of all sessions");
    router.push("/login");
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-xl font-bold">Settings</h1>

      <div className="rounded-2xl border border-border bg-card p-6">
        <h2 className="font-semibold mb-4">Appearance</h2>
        <div className="flex gap-2">
          {([["light", "Light", Sun], ["dark", "Dark", Moon], ["system", "System", Monitor]] as const).map(([t, label, Icon]) => (
            <button key={t} onClick={() => setTheme(t)} className={`flex-1 flex flex-col items-center gap-2 py-3 rounded-xl border-2 text-sm font-medium transition-all ${theme === t ? "border-primary bg-primary/10 text-primary" : "border-border bg-muted text-muted-foreground hover:text-foreground"}`}>
              <Icon className="h-5 w-5" />{label}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6">
        <h2 className="font-semibold mb-4">Login Activity</h2>
        {logsLoading ? (
          <div className="flex justify-center py-4"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>
        ) : logs.length === 0 ? (
          <p className="text-sm text-muted-foreground">No recent activity</p>
        ) : (
          <div className="space-y-2">
            {logs.map(log => (
              <div key={log.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div>
                  <p className="text-sm font-medium capitalize">{log.action.replace(/_/g, " ")}</p>
                  {log.ipAddress && <p className="text-xs text-muted-foreground">IP: {log.ipAddress}</p>}
                </div>
                <p className="text-xs text-muted-foreground">{formatDate(log.createdAt)}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6">
        <h2 className="font-semibold text-red-500 mb-2">Danger Zone</h2>
        <p className="text-sm text-muted-foreground mb-4">This will sign you out of all active sessions.</p>
        <button onClick={handleSignOutAll} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition">
          <LogOut className="h-4 w-4" /> Sign Out All Devices
        </button>
      </div>
    </div>
  );
}
